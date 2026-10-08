import { describe, expect, it } from "vitest";
import { scoreGroups } from "@/domain/kandidator/score";
import { answerLike, playSession, seededRandom } from "@/domain/kandidator/test-support";
import type { AnsweredQuestion } from "@/domain/kandidator/types";
import { candidates, questionPool } from "@/data/kandidator/pool";
import { buildResultView } from "./result-view";

/** Structure and invariants only: no expected political outcome is hard-coded here. */

const sessions = questionPool.groupIds.map((groupId) =>
  playSession(questionPool, (question) => answerLike(questionPool, groupId, question), seededRandom(7)),
);

describe("buildResultView", () => {
  it.each(sessions.map((answers, index) => [index, answers] as const))(
    "session %i: percentages and ranks come from the domain score",
    (_, answers) => {
      const view = buildResultView(answers);
      const result = scoreGroups(questionPool, answers);
      if (view.kind !== "scored" || result.kind !== "scored") {
        throw new Error("expected a scored result");
      }

      const shown = [...view.top, ...view.others];
      expect(shown.map((group) => group.groupId)).toEqual(result.ranked.map((group) => group.groupId));
      shown.forEach((group, index) => {
        expect(group.percent).toBe(Math.round(result.ranked[index].score * 100));
        expect(group.rank).toBe(result.ranked[index].rank);
        expect(group.compared).toBe(result.ranked[index].details.length);
      });
      expect(view.top.every((group) => group.rank <= 3)).toBe(true);
      expect(view.notEnoughData.map((group) => group.groupId)).toEqual(
        result.notEnoughData.map((group) => group.groupId),
      );
    },
  );

  it("shows a candidate next to a group only through a sourced association with it", () => {
    const view = buildResultView(sessions[0]);
    if (view.kind !== "scored") {
      throw new Error("expected a scored result");
    }

    for (const group of [...view.top, ...view.others]) {
      for (const shown of group.candidates) {
        const candidate = candidates.find((other) => other.id === shown.id);
        expect(shown.associations.length).toBeGreaterThan(0);
        for (const association of shown.associations) {
          expect(association.sourceUrls.length).toBeGreaterThan(0);
          expect(candidate?.associations).toContainEqual({ groupRef: group.groupId, ...association });
        }
      }
    }
  });

  it("explains every answered question with its scrutin source, in answer order", () => {
    const answers = sessions[0];
    const view = buildResultView(answers);

    expect(view.questions.map((question) => question.questionId)).toEqual(answers.map((a) => a.questionId));
    for (const question of view.questions) {
      expect(question.scrutin.sourceUrl).toBe(
        `https://www.assemblee-nationale.fr/dyn/17/scrutins/${question.scrutin.number}`,
      );
      expect(question.groups.map((group) => group.groupId)).toEqual(questionPool.groupIds);
    }
  });

  it("handles a session with only Neutral answers", () => {
    const answers: AnsweredQuestion[] = questionPool.questions
      .slice(0, 3)
      .map((question) => ({ questionId: question.id, answer: "neutral" }));
    const view = buildResultView(answers);

    expect(view.kind).toBe("noYesNoAnswer");
    expect(view.questions.every((question) => question.groups.every((group) => group.agreement === null))).toBe(
      true,
    );
  });
});
