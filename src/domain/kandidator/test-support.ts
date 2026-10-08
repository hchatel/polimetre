/**
 * Test support for the Kandidator domain. The fixture is obviously fictional
 * (groups A–E, scrutins S1…): never real political data.
 */
import { selectNextQuestion } from "./question-selection.ts";
import { stanceOf } from "./stance.ts";
import { shouldStop } from "./stop-rule.ts";
import type { Answer, AnsweredQuestion, GroupPosition, Question, QuestionPool, RandomSource } from "./types.ts";

const GROUP_IDS = ["A", "B", "C", "D", "E"] as const;

/** Positions of A–E on one scrutin; null is unknown. */
const row = (...values: (number | null)[]): Record<string, GroupPosition> => {
  return Object.fromEntries(
    GROUP_IDS.map((groupId, index) => {
      const value = values[index];

      return [groupId, value === null ? { kind: "unknown" } : { kind: "known", value }];
    }),
  );
};

const question = (number: number, polarity: Question["polarity"] = 1): Question => {
  return { id: `q${number}`, scrutinId: `S${number}`, polarity };
};

export const fixturePool: QuestionPool = {
  groupIds: GROUP_IDS,
  questions: [
    question(1),
    question(2),
    question(3, -1),
    question(4),
    question(5),
    question(6),
    question(7),
    question(8, -1),
    question(9),
    question(10),
  ],
  positions: {
    //        A     B     C     D     E
    S1: row(1, 0.8, -0.6, -1, -1),
    S2: row(-1, 1, 1, 0.5, -1),
    S3: row(1, 1, -1, -1, 0.9),
    S4: row(-0.8, -1, 0.7, 1, 1),
    S5: row(1, -1, 1, -1, null),
    S6: row(0.2, 1, -1, 1, -1),
    S7: row(1, 1, 1, -1, -1),
    S8: row(-1, 0.6, -1, 1, 1),
    S9: row(null, -1, 1, 1, -1),
    S10: row(1, 0.9, 1, 0.9, 1),
  },
};

/** Seeded pseudo-random source (mulberry32), for reproducible tests. */
export const seededRandom = (seed: number): RandomSource => {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** §9 reachability — answer exactly like the group: Yes if stance > 0, No if < 0, Neutral otherwise. */
export const answerLike = (pool: QuestionPool, groupId: string, target: Question): Answer => {
  const groupStance = stanceOf(pool, target, groupId);
  if (groupStance.kind === "unknown" || groupStance.value === 0) {
    return "neutral";
  }

  return groupStance.value > 0 ? "yes" : "no";
};

/** Plays a full adaptive session (§9) with the given answering strategy. */
export const playSession = (
  pool: QuestionPool,
  answerFor: (target: Question) => Answer,
  random: RandomSource,
): AnsweredQuestion[] => {
  const answers: AnsweredQuestion[] = [];
  while (!shouldStop(pool, answers)) {
    const next = selectNextQuestion(pool, answers, random);
    if (!next) {
      break;
    }
    answers.push({ questionId: next.id, answer: answerFor(next) });
  }

  return answers;
};

/** Small pool for focused tests: one question qN (polarity +1) on scrutin SN per row of positions. */
export const poolOf = (rows: Record<string, number | null>[]): QuestionPool => {
  const groupIds = [...new Set(rows.flatMap((positions) => Object.keys(positions)))].sort();

  return {
    groupIds,
    questions: rows.map((_, index) => question(index + 1)),
    positions: Object.fromEntries(
      rows.map((positions, index) => [
        `S${index + 1}`,
        Object.fromEntries(
          Object.entries(positions).map(([groupId, value]) => [
            groupId,
            value === null ? { kind: "unknown" } : { kind: "known", value },
          ]),
        ),
      ]),
    ),
  };
};

export const answered = (...entries: [number, Answer][]): AnsweredQuestion[] => {
  return entries.map(([number, answer]) => ({ questionId: `q${number}`, answer }));
};
