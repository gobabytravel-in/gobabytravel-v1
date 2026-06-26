// Feature flags for GoBabyTravel.
//
// GOOGLE_AUTH_ENABLED: Google OAuth requires the provider to be enabled in the
// Supabase dashboard (Authentication → Providers → Google) with a Google Cloud
// OAuth client ID/secret and authorized redirect URIs. Until that is configured,
// Google Sign-In returns "Unsupported provider: provider is not enabled".
// For V1 we ship Email OTP as the primary auth method. Flip this to `true` once
// Google OAuth is fully configured and verified — no other code changes needed.
export const GOOGLE_AUTH_ENABLED = false;
