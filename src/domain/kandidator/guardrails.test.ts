import { describe, expect, it } from "vitest";
import { scoreGroups } from "./score.ts";
import { answerLike, fixturePool, playSession, seededRandom } from "./test-support.ts";
import type { AnsweredQuestion } from "./types.ts";

/** METHODOLOGY.md §9 — mandatory guardrail tests, on the fictional fixture. */

const winners = (answers: AnsweredQuestion[]) => {
  const result = scoreGroups(fixturePool, answers);

  return result.kind === "scored" ? result.ranked.filter(({ rank }) => rank === 1).map(({ groupId }) => groupId) : [];
};

describe("reachability", () => {
  it.each(fixturePool.groupIds)("ranks %s alone first when answering like it on every question", (groupId) => {
    const answers = fixturePool.questions.map((question) => ({
      questionId: question.id,
      answer: answerLike(fixturePool, groupId, question),
    }));

    expect(winners(answers)).toEqual([groupId]);
  });

  it.each(fixturePool.groupIds)("ranks %s alone first at the end of adaptive sessions answering like it", (groupId) => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      const answers = playSession(fixturePool, (question) => answerLike(fixturePool, groupId, question), seededRandom(seed));

      expect(winners(answers), `seed ${seed}`).toEqual([groupId]);
    }
  });
});

describe("determinism", () => {
  const answers: AnsweredQuestion[] = [
    { questionId: "q1", answer: "yes" },
    { questionId: "q4", answer: "no" },
    { questionId: "q5", answer: "neutral" },
    { questionId: "q8", answer: "yes" },
    { questionId: "q9", answer: "no" },
  ];

  it("gives the same scores for the same answers", () => {
    expect(scoreGroups(fixturePool, answers)).toEqual(scoreGroups(fixturePool, answers));
  });

  it("does not depend on the order the questions were asked", () => {
    const scores = (list: AnsweredQuestion[]) => {
      const result = scoreGroups(fixturePool, list);

      return result.kind === "scored" ? result.ranked.map(({ groupId, score, rank }) => ({ groupId, score, rank })) : [];
    };

    expect(scores([...answers].reverse())).toEqual(scores(answers));
  });
});

describe("neutral answers only", () => {
  it("produces no ranking", () => {
    const answers = fixturePool.questions.map((question) => ({ questionId: question.id, answer: "neutral" as const }));

    expect(scoreGroups(fixturePool, answers)).toEqual({ kind: "noYesNoAnswer" });
  });
});
