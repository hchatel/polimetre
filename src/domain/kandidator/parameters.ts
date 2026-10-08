/**
 * Tunable thresholds of the Kandidator methodology (METHODOLOGY.md §8–9).
 * Provisional values, tuned after play-testing. Nothing else belongs here.
 */

/** §8.1 — below this number of expressed votes, a group position is unknown. */
export const MIN_EXPRESSED = 3;

/** §8.4 — a group compared on fewer Yes/No questions is flagged "not enough data" instead of ranked. */
export const MIN_COMPARED = 3;

/** §9 — once the user has given a Yes/No answer, discrimination power is measured on the top K groups. */
export const TOP_K = 3;

/** §9 — questions whose power is at least this share of the best one are picked at random. */
export const RANDOM_BAND = 0.9;

/** §9 — minimum number of Yes/No answers before the gap rule can stop the session. */
export const MIN_QUESTIONS = 6;

/** §9 — gap between the 1st and 2nd group, in percentage points, that stops the session. */
export const STOP_GAP = 15;

/** §9 — the session stops after this many questions asked (Neutral included). */
export const MAX_QUESTIONS = 18;
