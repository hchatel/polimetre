import { agreement, answerValue } from "./agreement.ts";
import { MIN_COMPARED } from "./parameters.ts";
import { roundNoise } from "./precision.ts";
import { stanceOf } from "./stance.ts";
import type { AnsweredQuestion, Question, QuestionPool } from "./types.ts";

/** One line of "why this result": question → answer → group stance → agreement. */
export type AgreementDetail = {
  questionId: string;
  answer: "yes" | "no";
  stance: number;
  agreement: number;
};

/** Score of a group in [0, 1], over the `details.length` questions it was compared on. */
export type GroupScore = {
  groupId: string;
  score: number;
  details: AgreementDetail[];
};

/** Tied groups share the same rank (1, 1, 3…). */
export type RankedGroup = GroupScore & { rank: number };

export type ScoreResult =
  | { kind: "noYesNoAnswer" }
  | {
      kind: "scored";
      ranked: RankedGroup[];
      /** Compared on fewer than MIN_COMPARED questions: not ranked. */
      notEnoughData: { groupId: string; compared: number }[];
    };

/** Code-point order, independent of the runtime locale. */
const compareIds = (a: string, b: string): number => {
  if (a === b) {
    return 0;
  }

  return a < b ? -1 : 1;
};

/** Score descending, then group id ascending for a stable display order (§8.4). */
const compareScores = (a: GroupScore, b: GroupScore): number => {
  return b.score - a.score || compareIds(a.groupId, b.groupId);
};

const answeredQuestions = (
  pool: QuestionPool,
  answers: readonly AnsweredQuestion[],
): { question: Question; answer: AnsweredQuestion["answer"] }[] => {
  const seen = new Set<string>();

  return answers.map(({ questionId, answer }) => {
    const question = pool.questions.find((candidate) => candidate.id === questionId);
    if (!question) {
      throw new Error(`Unknown question id: ${questionId}`);
    }
    if (seen.has(questionId)) {
      throw new Error(`Question answered twice: ${questionId}`);
    }
    seen.add(questionId);

    return { question, answer };
  });
};

const groupDetails = (
  pool: QuestionPool,
  answered: ReturnType<typeof answeredQuestions>,
  groupId: string,
): AgreementDetail[] => {
  return answered.flatMap(({ question, answer }) => {
    const value = answerValue(answer);
    const groupStance = stanceOf(pool, question, groupId);
    if (value === null || answer === "neutral" || groupStance.kind === "unknown") {
      return [];
    }

    return [
      {
        questionId: question.id,
        answer,
        stance: groupStance.value,
        agreement: agreement(value, groupStance.value),
      },
    ];
  });
};

/**
 * METHODOLOGY.md §8.4 — score of every group compared on at least one question,
 * sorted by score then group id. Neutral answers and unknown stances are not counted.
 * Ignores MIN_COMPARED: also used by question selection (§9).
 */
export const groupScores = (pool: QuestionPool, answers: readonly AnsweredQuestion[]): GroupScore[] => {
  const answered = answeredQuestions(pool, answers);

  return pool.groupIds
    .map((groupId) => {
      const details = groupDetails(pool, answered, groupId);
      const total = details.reduce((sum, detail) => sum + detail.agreement, 0);

      return { groupId, details, score: details.length === 0 ? 0 : roundNoise(total / details.length) };
    })
    .filter((groupScore) => groupScore.details.length > 0)
    .sort(compareScores);
};

/**
 * METHODOLOGY.md §8.4 — ranking shown to the user.
 *
 * No Yes/No answer → no ranking (§9 guardrail). Groups compared on fewer than
 * MIN_COMPARED questions are flagged "not enough data". Equal scores share a rank.
 */
export const scoreGroups = (pool: QuestionPool, answers: readonly AnsweredQuestion[]): ScoreResult => {
  if (!answers.some(({ answer }) => answerValue(answer) !== null)) {
    return { kind: "noYesNoAnswer" };
  }

  const scores = groupScores(pool, answers);
  const enough = scores.filter((groupScore) => groupScore.details.length >= MIN_COMPARED);
  const ranked = enough.map((groupScore) => ({
    ...groupScore,
    rank: enough.findIndex((other) => other.score === groupScore.score) + 1,
  }));
  const notEnoughData = pool.groupIds
    .filter((groupId) => !enough.some((groupScore) => groupScore.groupId === groupId))
    .map((groupId) => ({
      groupId,
      compared: scores.find((groupScore) => groupScore.groupId === groupId)?.details.length ?? 0,
    }))
    .sort((a, b) => compareIds(a.groupId, b.groupId));

  return { kind: "scored", ranked, notEnoughData };
};
