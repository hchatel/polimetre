import type { Answer } from "./types.ts";

/** METHODOLOGY.md §8.3 — Yes → +1, No → -1, Neutral → null (not counted). */
export const answerValue = (answer: Answer): 1 | -1 | null => {
  if (answer === "yes") {
    return 1;
  }
  if (answer === "no") {
    return -1;
  }

  return null;
};

/**
 * METHODOLOGY.md §8.4 — agreement between a Yes/No answer and a known stance.
 *
 * agreement = 1 - |answer - stance| / 2, in [0, 1].
 */
export const agreement = (answer: 1 | -1, stance: number): number => {
  return 1 - Math.abs(answer - stance) / 2;
};
