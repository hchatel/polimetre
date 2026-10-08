import { describe, expect, it } from "vitest";
import { scoreGroups } from "@/domain/kandidator/score";
import { answerLike, playSession, seededRandom } from "@/domain/kandidator/test-support";
import type { AnsweredQuestion } from "@/domain/kandidator/types";
import { candidates, groups, questionPool, questions, scrutinsFile } from "./pool";

/** ROADMAP S4 — integrity of the hard-coded pool and §9 reachability on real data. */

const NON_INSCRITS_REF = "PO840056";
const UDR_REF = "PO847173";

const groupRefs = new Set(groups.map((group) => group.ref));
const scrutinNumbers = new Set(scrutinsFile.scrutins.map((scrutin) => scrutin.number));

describe("questions", () => {
  it("have unique ids", () => {
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
  });

  it("each reference a distinct scrutin of the dataset", () => {
    const referenced = questions.map((question) => question.scrutinNumber);

    expect(new Set(referenced).size).toBe(referenced.length);
    expect(referenced.filter((number) => !scrutinNumbers.has(number))).toEqual([]);
  });

  it("leave no scrutin unused", () => {
    const referenced = new Set(questions.map((question) => question.scrutinNumber));

    expect([...scrutinNumbers].filter((number) => !referenced.has(number))).toEqual([]);
  });
});

describe("scrutins", () => {
  it.each(scrutinsFile.scrutins)("$number links to its official page", (scrutin) => {
    expect(scrutin.sourceUrl).toBe(`https://www.assemblee-nationale.fr/dyn/17/scrutins/${scrutin.number}`);
  });

  it("only contain breakdowns of the pool groups (no non-inscrits, no UDR)", () => {
    const refs = new Set(scrutinsFile.scrutins.flatMap((scrutin) => scrutin.groups.map((group) => group.ref)));

    expect([...refs].filter((ref) => !groupRefs.has(ref))).toEqual([]);
    expect(groupRefs.has(NON_INSCRITS_REF)).toBe(false);
    expect(groupRefs.has(UDR_REF)).toBe(false);
  });
});

describe("candidates", () => {
  it("have unique ids", () => {
    expect(new Set(candidates.map((candidate) => candidate.id)).size).toBe(candidates.length);
  });

  it("are only associated with groups of the pool", () => {
    const refs = candidates.flatMap((candidate) => candidate.associations.map((association) => association.groupRef));

    expect(refs.filter((ref) => !groupRefs.has(ref))).toEqual([]);
  });

  it("source both the party and the party–group link for a 'party-forming-group' association", () => {
    const underSourced = candidates.flatMap((candidate) =>
      candidate.associations
        .filter((association) => association.type === "party-forming-group" && association.sourceUrls.length < 2)
        .map(() => candidate.id),
    );

    expect(underSourced).toEqual([]);
  });
});

/** METHODOLOGY.md §9 — reachability guardrail, on the real pool. */
describe("reachability on real data", () => {
  const winners = (answers: AnsweredQuestion[]) => {
    const result = scoreGroups(questionPool, answers);

    return result.kind === "scored" ? result.ranked.filter(({ rank }) => rank === 1).map(({ groupId }) => groupId) : [];
  };

  it.each(questionPool.groupIds)("ranks %s alone first when answering like it on every question", (groupId) => {
    const answers = questionPool.questions.map((question) => ({
      questionId: question.id,
      answer: answerLike(questionPool, groupId, question),
    }));

    expect(winners(answers)).toEqual([groupId]);
  });

  it.each(questionPool.groupIds)("ranks %s alone first at the end of adaptive sessions answering like it", (groupId) => {
    for (let seed = 1; seed <= 20; seed++) {
      const answers = playSession(
        questionPool,
        (question) => answerLike(questionPool, groupId, question),
        seededRandom(seed),
      );

      expect(winners(answers), `seed ${seed}`).toEqual([groupId]);
    }
  });
});
