export const ALPHA_SESSION_MAX_AGE_SECONDS = 30 * 60;
export const ALPHA_INACTIVITY_TIMEOUT_MS =
  ALPHA_SESSION_MAX_AGE_SECONDS * 1000;

export const ALPHA_ACTIVITY_EVENTS = [
  "click",
  "keydown",
  "mousemove",
  "scroll",
  "touchstart"
] as const;

export function shouldSignOutForInactivity(
  lastActivityAt: number,
  now: number,
  timeoutMs = ALPHA_INACTIVITY_TIMEOUT_MS
) {
  return now - lastActivityAt >= timeoutMs;
}
