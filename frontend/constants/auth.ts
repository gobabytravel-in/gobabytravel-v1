// Shared authentication constants.
// Supabase OTP lengths can change without notice (was 6, is currently 8).
// Using a floor+ceiling approach means future length changes require zero
// app updates — the user simply types whatever code arrives and hits Verify.

// Minimum digits before the "Verify" button activates.
// A floor of 4 prevents accidental taps on partially-typed codes while
// allowing any plausible Supabase OTP length.
export const OTP_MIN_LENGTH = 4;

// Maximum digits the input will accept.
// A ceiling of 10 prevents an unbounded input box while covering any
// foreseeable Supabase OTP length. Supabase currently sends 8 digits.
export const OTP_MAX_LENGTH = 10;
