import { answerValue } from "./agreement.ts";
import { MAX_QUESTIONS, MIN_QUESTIONS, STOP_GAP } from "./parameters.ts";
import { roundNoise } from "./precision.ts";
import { scoreGroups } from "./score.ts";
import type { AnsweredQuestion, QuestionPool } from "./types.ts";

/**
 * METHODOLOGY.md §9 — whether the session ends. True when:
 * - MAX_QUESTIONS questions were asked (Neutral included), or
 * - every question of the pool was asked, or
 * - at least MIN_QUESTIONS Yes/No answers and the 1st ranked group leads the 2nd
 *   by at least STOP_GAP points (needs two ranked groups).
 */
export const shouldStop = (pool: QuestionPool, answers: readonly AnsweredQuestion[]): boolean => {
  if (answers.length >= MAX_QUESTIONS || answers.length >= pool.questions.length) {
    return true;
  }

  const yesNo = answers.filter(({ answer }) => answerValue(answer) !== null).length;
  if (yesNo < MIN_QUESTIONS) {
    return false;
  }

  const result = scoreGroups(pool, answers);
  if (result.kind !== "scored" || result.ranked.length < 2) {
    return false;
  }

  const [first, second] = result.ranked;

  return roundNoise((first.score - second.score) * 100) >= STOP_GAP;
};
