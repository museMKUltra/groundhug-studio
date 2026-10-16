/**
 * Focus duration settings shared by the service worker and the popup.
 * Single source of truth for the range; popup.html derives its slider
 * attributes and labels from these values at runtime.
 */

export const DEFAULT_DURATION_MINUTES = 30;
export const MIN_DURATION_MINUTES = 5;
export const MAX_DURATION_MINUTES = 100;
export const STEP_MINUTES = 5;

/**
 * Keep duration within the allowed range.
 */
export function clampDuration(minutes) {
    return Math.min(
        MAX_DURATION_MINUTES,
        Math.max(MIN_DURATION_MINUTES, minutes)
    );
}
