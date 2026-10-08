import { RANDOM_BAND, TOP_K } from "./parameters.ts";
import { roundNoise } from "./precision.ts";
import { groupScores } from "./score.ts";
import { stanceOf } from "./stance.ts";
import type { AnsweredQuestion, Question, QuestionPool, RandomSource } from "./types.ts";

/**
 * METHODOLOGY.md §9 — discrimination power of a question over some groups:
 * max − min of their known stances, in [0, 2]. 0 when fewer than two stances are known.
 */
export const discriminationPower = (
  pool: QuestionPool,
  question: Question,
  groupIds: readonly string[],
): number => {
  const known = groupIds.flatMap((groupId) => {
    const groupStance = stanceOf(pool, question, groupId);

    return groupStance.kind === "known" ? [groupStance.value] : [];
  });
  if (known.length < 2) {
    return 0;
  }

  return roundNoise(Math.max(...known) - Math.min(...known));
};

/**
 * §9 — groups the power is measured on: all groups before any group could be scored
 * (no Yes/No answer yet), then the current TOP_K groups.
 */
export const selectionGroups = (pool: QuestionPool, answers: readonly AnsweredQuestion[]): readonly string[] => {
  const scores = groupScores(pool, answers);
  if (scores.length === 0) {
    return pool.groupIds;
  }

  return scores.slice(0, TOP_K).map((groupScore) => groupScore.groupId);
};

/**
 * METHODOLOGY.md §9 — next question to ask, or null when the pool is exhausted.
 *
 * Picks at random, with the injected source, among the questions not yet asked whose
 * power is at least RANDOM_BAND of the best one. Candidates keep the pool order.
 */
export const selectNextQuestion = (
  pool: QuestionPool,
  answers: readonly AnsweredQuestion[],
  random: RandomSource,
): Question | null => {
  const asked = new Set(answers.map(({ questionId }) => questionId));
  const groupIds = selectionGroups(pool, answers);
  const candidates = pool.questions
    .filter((question) => !asked.has(question.id))
    .map((question) => ({ question, power: discriminationPower(pool, question, groupIds) }));
  if (candidates.length === 0) {
    return null;
  }

  const best = Math.max(...candidates.map(({ power }) => power));
  const band = candidates.filter(({ power }) => power >= roundNoise(RANDOM_BAND * best));
  const index = Math.min(Math.floor(random() * band.length), band.length - 1);

  return band[index].question;
};
