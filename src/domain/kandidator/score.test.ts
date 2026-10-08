import { describe, expect, it } from "vitest";
import { MIN_COMPARED } from "./parameters.ts";
import { groupScores, scoreGroups } from "./score.ts";
import { answered, poolOf } from "./test-support.ts";

const pool = poolOf([
  { A: 1, B: -1, C: 0.5 },
  { A: 1, B: 1, C: null },
  { A: -1, B: 1, C: 0 },
  { A: 0.6, B: -0.2, C: 1 },
]);

describe("groupScores (§8.4)", () => {
  it("averages the agreements of the compared questions", () => {
    const scores = groupScores(pool, answered([1, "yes"], [2, "yes"], [3, "no"], [4, "yes"]));

    expect(scores.map(({ groupId, score }) => [groupId, score])).toEqual([
      ["A", 0.95],
      ["C", 0.75],
      ["B", 0.35],
    ]);
  });

  it("ignores Neutral answers", () => {
    const [a] = groupScores(pool, answered([1, "yes"], [3, "neutral"]));

    expect(a).toMatchObject({ groupId: "A", score: 1 });
    expect(a.details).toHaveLength(1);
  });

  it("ignores unknown stances for that group only", () => {
    const scores = groupScores(pool, answered([2, "yes"]));

    expect(scores.map(({ groupId }) => groupId)).toEqual(["A", "B"]);
  });

  it("explains each score: question → answer → stance → agreement", () => {
    const c = groupScores(pool, answered([1, "no"])).find(({ groupId }) => groupId === "C");

    expect(c?.details).toEqual([{ questionId: "q1", answer: "no", stance: 0.5, agreement: 0.25 }]);
  });

  it("rejects unknown and duplicated question ids", () => {
    expect(() => groupScores(pool, answered([9, "yes"]))).toThrow("Unknown question id: q9");
    expect(() => groupScores(pool, answered([1, "yes"], [1, "no"]))).toThrow("answered twice");
  });
});

describe("scoreGroups (§8.4)", () => {
  it("returns no ranking when every answer is Neutral", () => {
    expect(scoreGroups(pool, answered([1, "neutral"], [2, "neutral"]))).toEqual({ kind: "noYesNoAnswer" });
    expect(scoreGroups(pool, [])).toEqual({ kind: "noYesNoAnswer" });
  });

  it(`flags groups compared on fewer than MIN_COMPARED (${MIN_COMPARED}) questions`, () => {
    const result = scoreGroups(pool, answered([1, "yes"], [2, "yes"], [3, "no"]));

    expect(result.kind).toBe("scored");
    if (result.kind !== "scored") {
      return;
    }
    expect(result.ranked.map(({ groupId }) => groupId)).toEqual(["A", "B"]);
    expect(result.notEnoughData).toEqual([{ groupId: "C", compared: 2 }]);
  });

  it("gives tied groups the same rank, ordered by group id", () => {
    const tied = poolOf([
      { C: 1, A: 1, B: -1 },
      { C: 1, A: 1, B: -1 },
      { C: 0.7, A: 0.7, B: 1 },
    ]);
    const result = scoreGroups(tied, answered([1, "yes"], [2, "yes"], [3, "yes"]));

    expect(result.kind === "scored" && result.ranked.map(({ groupId, rank }) => [groupId, rank])).toEqual([
      ["A", 1],
      ["C", 1],
      ["B", 3],
    ]);
  });

  it("treats mathematically equal scores as tied despite floating-point noise", () => {
    // A: (0.7 + 0.2 + 1) / 3 and B: (0.9 + 0.1 + 0.9) / 3 are both 0.6333… exactly.
    const noisy = poolOf([
      { A: 0.4, B: 0.8 },
      { A: -0.6, B: -0.8 },
      { A: 1, B: 0.8 },
    ]);
    const result = scoreGroups(noisy, answered([1, "yes"], [2, "yes"], [3, "yes"]));

    expect(result.kind === "scored" && result.ranked.map(({ rank }) => rank)).toEqual([1, 1]);
  });

  it("lists groups never compared as not enough data", () => {
    const result = scoreGroups(pool, answered([2, "yes"]));

    expect(result.kind === "scored" && result.notEnoughData).toEqual([
      { groupId: "A", compared: 1 },
      { groupId: "B", compared: 1 },
      { groupId: "C", compared: 0 },
    ]);
  });
});
