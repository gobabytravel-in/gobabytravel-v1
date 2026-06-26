// GoBaby Travel — Analytics Service (Phase 1)
// Lightweight event tracking. Logs to console in dev, Firestore when configured.

import { Platform } from 'react-native';
import { getUserId } from './userIdentity';

const SESSION_ID = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const recentEvents = new Set<string>();

function isDuplicate(key: string): boolean {
  if (recentEvents.has(key)) return true;
  recentEvents.add(key);
  setTimeout(() => recentEvents.delete(key), 2000);
  return false;
}

async function trackEvent(eventName: string, params: Record<string, any> = {}) {
  const dedupKey = `${eventName}:${JSON.stringify(params)}`;
  if (isDuplicate(dedupKey)) return;

  const enriched = {
    ...params,
    user_id: getUserId() || 'anonymous',
    session_id: SESSION_ID,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  };

  if (__DEV__) {
    console.log(`[Analytics] ${eventName}`, enriched);
  }

  // Firestore logging (optional — only if Firebase is configured)
  try {
    const { db } = require('../config/firebase');
    const { collection, addDoc, serverTimestamp } = require('firebase/firestore');
    if (db) {
      await addDoc(collection(db, 'analytics_events'), {
        event: eventName,
        params: enriched,
        user_id: enriched.user_id,
        session_id: SESSION_ID,
        created_at: serverTimestamp(),
      });
    }
  } catch {
    // Silent — analytics should never break the app
  }
}

// ── Public tracking functions ─────────────────────────────────────────────────

export function trackAppOpen() { trackEvent('app_open'); }
export function trackScreenView(screen: string, extra?: Record<string, any>) {
  trackEvent('screen_view', { screen_name: screen, ...extra });
}
export function trackViewHome() { trackEvent('view_home'); }
export function trackToolOpen(tool: string, source?: string) {
  trackEvent('tool_open', { tool_name: tool, source: source || 'unknown' });
}
export function trackDrawerOpen() { trackEvent('drawer_open'); }
export function trackExternalLink(url: string, context: string) {
  trackEvent('external_link_click', { url, context });
}
export function trackAIMessage(destination?: string) {
  trackEvent('ai_message_sent', { destination: destination || 'unknown' });
}
export function trackItinerarySaved(destination: string, days: number) {
  trackEvent('itinerary_saved', { destination, days });
}
export function trackConversationSaved(destination?: string) {
  trackEvent('conversation_saved', { destination: destination || 'unknown' });
}

export async function setAnalyticsUserId(_userId: string) {}
export async function setAnalyticsUserProperty(_key: string, _value: string) {}
export async function setEntryPoint(_entry: string) {}
export async function setUserType(_type: string) {}
export async function setPreferredDestination(_dest: string) {}

// Legacy compat
export function trackHomepageCTA(_cta: string) {}
export function trackDestinationCardClick(dest: string) { trackEvent('destination_card_click', { destination: dest }); }
export function trackFlowStart(dest: string) { trackEvent('flow_start', { destination: dest }); }
export function trackFlowStep(dest: string, step: string, num: number) { trackScreenView(step, { destination: dest, step_number: num }); }
export function trackFlowStepAction(_dest: string, _step: string, _action: string) {}
export function trackFlowComplete(dest: string) { trackEvent('flow_complete', { destination: dest }); }
export function trackWhatsAppClick(source: string) { trackExternalLink('whatsapp', source); }
export function trackClickPlanTrip() { trackEvent('click_plan_trip'); }
export function trackClickGuidedPlanning() { trackEvent('click_guided_planning'); }
export function trackClickDestinationCard(dest: string) { trackDestinationCardClick(dest); }
export function trackStartGuidedFlow(dest: string) { trackFlowStart(dest); }
export function trackViewStep(step: string, dest: string, num: number) { trackFlowStep(dest, step, num); }
export function trackClickCTA(step: string, dest: string) { trackEvent('click_cta', { step_name: step, destination: dest }); }
export function trackSkipStep(step: string, dest: string) { trackEvent('skip_step', { step_name: step, destination: dest }); }
export function trackCompleteFlow(dest: string) { trackFlowComplete(dest); }
export function trackClickWhatsApp(source: string) { trackWhatsAppClick(source); }
export function trackReturnHome(source: string) { trackEvent('return_home', { from: source }); }
export function trackFlowDropOff(dest: string, step: string, num: number) { trackEvent('flow_drop_off', { destination: dest, last_step: step, last_step_number: num }); }
export function trackCallbackFormOpen() { trackEvent('callback_form_open'); }
export function trackCallbackFormSubmit(success: boolean) { trackEvent('callback_form_submit', { success }); }
export function trackDrawerItemClick(item: string) { trackEvent('drawer_item_click', { item_name: item }); }
