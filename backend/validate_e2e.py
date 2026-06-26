"""
GoBabyTravel V1 — Live Supabase End-to-End Validation (REST, no SDK).
Replicates the exact client wire protocol: Supabase Auth REST for auth and
PostgREST for table CRUD, with RLS enforced via each user's JWT.
Creates real test users, exercises every table, verifies RLS isolation, cleans up.
"""
import os
import sys
import uuid
import json
import requests

RAW = os.environ.get("SUPABASE_URL", "")
URL = RAW.rstrip("/").removesuffix("/rest/v1").rstrip("/")
ANON = os.environ.get("SUPABASE_ANON_KEY", "")
SERVICE = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

REST = f"{URL}/rest/v1"
AUTH = f"{URL}/auth/v1"

results = []
def rec(name, ok, ev=""):
    results.append((name, ok, ev)); print(f"[{'PASS' if ok else 'FAIL'}] {name} :: {ev}")

def h_anon(jwt=None):
    return {"apikey": ANON, "Authorization": f"Bearer {jwt or ANON}", "Content-Type": "application/json"}
def h_service():
    return {"apikey": SERVICE, "Authorization": f"Bearer {SERVICE}", "Content-Type": "application/json"}

if not (URL and ANON and SERVICE):
    print("MISSING CREDS"); sys.exit(1)

suffix = uuid.uuid4().hex[:8]
emailA, emailB = f"v1t_{suffix}_a@gobabytest.dev", f"v1t_{suffix}_b@gobabytest.dev"
pw = "TestPass!" + suffix
uidA = uidB = None

def admin_create_user(email):
    r = requests.post(f"{AUTH}/admin/users", headers=h_service(),
                      json={"email": email, "password": pw, "email_confirm": True}, timeout=30)
    r.raise_for_status(); return r.json()["id"]

def signin(email):
    r = requests.post(f"{AUTH}/token?grant_type=password", headers=h_anon(),
                      json={"email": email, "password": pw}, timeout=30)
    r.raise_for_status(); return r.json()["access_token"]

def admin_delete_user(uid):
    requests.delete(f"{AUTH}/admin/users/{uid}", headers=h_service(), timeout=30)

def sel(table, jwt, q=""):
    return requests.get(f"{REST}/{table}?{q}", headers=h_anon(jwt), timeout=30)
def ins(table, jwt, body):
    return requests.post(f"{REST}/{table}", headers={**h_anon(jwt), "Prefer": "return=representation"},
                         json=body, timeout=30)
def patch(table, jwt, q, body):
    return requests.patch(f"{REST}/{table}?{q}", headers={**h_anon(jwt), "Prefer": "return=representation"},
                          json=body, timeout=30)

try:
    # 1. Public reads (anon, no auth)
    r = sel("daily_discovery", None, "select=*&limit=5")
    rec("13a. Public read daily_discovery (anon)", r.status_code == 200, f"HTTP {r.status_code}, {len(r.json()) if r.ok else r.text[:80]} rows")
    r = sel("app_config", None, "select=*")
    rec("13b. Public read app_config (anon)", r.status_code == 200, f"HTTP {r.status_code}, {len(r.json()) if r.ok else r.text[:80]} rows")

    # 2. Authentication
    uidA = admin_create_user(emailA); rec("1a. Auth create user A", bool(uidA), uidA[:8])
    uidB = admin_create_user(emailB); rec("1b. Auth create user B", bool(uidB), uidB[:8])
    jwtA = signin(emailA); rec("1c. Auth sign-in A (password grant)", bool(jwtA), f"jwt len {len(jwtA)}")
    jwtB = signin(emailB)

    # 5. Profile auto-create (trigger) + save/reload
    r = sel("profiles", jwtA, f"id=eq.{uidA}&select=*")
    prof = r.json() if r.ok else []
    rec("5a. Profile auto-created (trigger)", len(prof) == 1, f"email={prof[0]['email'] if prof else None}")
    r = patch("profiles", jwtA, f"id=eq.{uidA}", {
        "full_name": "Test Traveler", "country": "Portugal", "travel_style": "Adventure",
        "travel_interests": ["food", "history"], "budget_preference": "mid", "languages": ["en", "pt"]})
    rr = sel("profiles", jwtA, f"id=eq.{uidA}&select=*").json()[0]
    rec("5b. Profile save & reload", rr["full_name"] == "Test Traveler" and rr["country"] == "Portugal",
        f"name={rr['full_name']}, country={rr['country']}")
    rec("9. Travel DNA persistence (style+interests)",
        rr["travel_style"] == "Adventure" and "food" in (rr["travel_interests"] or []),
        f"style={rr['travel_style']}, interests={rr['travel_interests']}")

    # 6. Travel Passport: countries_visited
    ins("countries_visited", jwtA, {"user_id": uidA, "country_code": "PT", "country_name": "Portugal"})
    ins("countries_visited", jwtA, {"user_id": uidA, "country_code": "JP", "country_name": "Japan"})
    cv = sel("countries_visited", jwtA, f"user_id=eq.{uidA}&select=*").json()
    rec("6. Passport countries save & reload", len(cv) == 2, f"{[c['country_code'] for c in cv]}")

    # Saved Dreams
    ins("saved_dreams", jwtA, {"user_id": uidA, "destination_id": "lisbon",
                               "destination_name": "Lisbon", "destination_country": "Portugal"})
    sd = sel("saved_dreams", jwtA, f"user_id=eq.{uidA}&select=*").json()
    rec("6b. Saved Dreams save & reload", len(sd) == 1, f"{sd[0]['destination_name'] if sd else None}")

    # 8. Conversations + messages
    conv = ins("conversations", jwtA, {"user_id": uidA, "title": "Lisbon planning", "destination": "Lisbon"}).json()[0]
    cid = conv["id"]
    ins("conversation_messages", jwtA, {"conversation_id": cid, "role": "user", "content": "Plan 3 days"})
    ins("conversation_messages", jwtA, {"conversation_id": cid, "role": "assistant", "content": "Here is your plan"})
    msgs = sel("conversation_messages", jwtA, f"conversation_id=eq.{cid}&select=*").json()
    convs = sel("conversations", jwtA, f"user_id=eq.{uidA}&select=*").json()
    rec("8. Saved Conversations save & reload", len(convs) == 1 and len(msgs) == 2, f"{len(convs)} conv, {len(msgs)} msgs")

    # 7/10. Itineraries (Saved Trips)
    ins("itineraries", jwtA, {"user_id": uidA, "title": "2 Days in Lisbon", "destination": "Lisbon",
                              "duration_days": 2, "content": [{"day": 1, "theme": "Arrival"}]})
    it = sel("itineraries", jwtA, f"user_id=eq.{uidA}&select=*").json()
    rec("7/10. Saved Trips (itineraries) save & reload", len(it) == 1, f"{it[0]['title'] if it else None}")

    # RLS isolation: B cannot read A's data
    b_sees = sel("countries_visited", jwtB, f"user_id=eq.{uidA}&select=*").json()
    rec("RLS: User B cannot read User A rows", len(b_sees) == 0, f"B sees {len(b_sees)} of A's (expect 0)")
    # B cannot modify A's profile
    patch("profiles", jwtB, f"id=eq.{uidA}", {"full_name": "HACKED"})
    a_now = requests.get(f"{REST}/profiles?id=eq.{uidA}&select=full_name", headers=h_service()).json()[0]
    rec("RLS: User B cannot modify A's profile", a_now["full_name"] != "HACKED", f"A name still={a_now['full_name']}")

    # bump_login_meta RPC
    rp = requests.post(f"{REST}/rpc/bump_login_meta", headers=h_anon(jwtA), json={"uid": uidA}, timeout=30)
    a2 = requests.get(f"{REST}/profiles?id=eq.{uidA}&select=login_count,last_login", headers=h_service()).json()[0]
    rec("Login RPC bump_login_meta", rp.status_code in (200, 204) and (a2.get("login_count") or 0) >= 1,
        f"rpc HTTP {rp.status_code}, login_count={a2.get('login_count')}")

finally:
    for uid in [u for u in (uidA, uidB) if u]:
        try: admin_delete_user(uid)
        except Exception as e: print(f"cleanup warn {uid[:8]}: {e}")
    print("\n=== cleanup done (test users + cascaded rows deleted) ===")

passed = sum(1 for _, ok, _ in results if ok)
print(f"\n=== SUPABASE E2E: {passed}/{len(results)} PASSED ===")
sys.exit(0 if passed == len(results) else 2)
