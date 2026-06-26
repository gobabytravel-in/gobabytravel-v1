import os
from postgrest import SyncPostgrestClient

_raw_url = os.environ.get("SUPABASE_URL", "")
# Normalize: strip /rest/v1/ suffix if present
SUPABASE_URL = _raw_url.rstrip("/").removesuffix("/rest/v1").rstrip("/")

SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

_client: "SyncPostgrestClient | None" = None


class _DB:
    """Thin wrapper exposing the same `.table(name)` API the app already uses.

    We construct PostgREST directly (service-role) instead of going through
    supabase.create_client, because the installed gotrue auth client is
    incompatible with the pinned httpx version. The backend only needs
    PostgREST (table CRUD with the service role key), so the auth/storage
    sub-clients are unnecessary here.
    """

    def __init__(self, url: str, key: str):
        self._pg = SyncPostgrestClient(
            f"{url}/rest/v1",
            headers={"apikey": key, "Authorization": f"Bearer {key}"},
            schema="public",
        )

    def table(self, name: str):
        return self._pg.from_(name)

    # Alias kept for parity with supabase Client API
    def from_(self, name: str):
        return self._pg.from_(name)

    def rpc(self, fn: str, params: dict | None = None):
        return self._pg.rpc(fn, params or {})


def get_db() -> "_DB":
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        _client = _DB(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _client
