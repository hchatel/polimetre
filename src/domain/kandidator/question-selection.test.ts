import { describe, expect, it } from "vitest";
import { discriminationPower, selectionGroups, selectNextQuestion } from "./question-selection.ts";
import { TOP_K } from "./parameters.ts";
import { answered, fixturePool, playSession, poolOf, seededRandom } from "./test-support.ts";

describe("discriminationPower (§9)", () => {
  const pool = poolOf([{ A: 1, B: -0.5, C: 0.2, D: null }]);
  const [q1] = pool.questions;

  it("is the spread (max − min) of the known stances", () => {
    expect(discriminationPower(pool, q1, ["A", "B", "C", "D"])).toBe(1.5);
    expect(discriminationPower(pool, q1, ["A", "C"])).toBe(0.8);
  });

  it("is 0 with fewer than two known stances", () => {
    expect(discriminationPower(pool, q1, ["A", "D"])).toBe(0);
  });
});

describe("selectionGroups (§9)", () => {
  it("uses every group before any Yes/No answer", () => {
    expect(selectionGroups(fixturePool, answered([1, "neutral"]))).toEqual(fixturePool.groupIds);
  });

  it(`uses the current top ${TOP_K} groups afterwards`, () => {
    // Yes on q7: A, B, C agree fully; D and E disagree.
    expect(selectionGroups(fixturePool, answered([7, "yes"]))).toEqual(["A", "B", "C"]);
  });
});

describe("selectNextQuestion (§9)", () => {
  const pool = poolOf([
    { A: 1, B: -1, C: 1 }, // power 2
    { A: 1, B: 0.9, C: 1 }, // power 0.1
    { A: 1, B: -0.8, C: 0 }, // power 1.8 = exactly 90% of the best
    { A: 1, B: -0.7, C: 0 }, // power 1.7, below the band
  ]);
  const pick = (value: number, answers = answered()) => {
    return selectNextQuestion(pool, answers, () => value)?.id;
  };

  it("picks at random among the questions within RANDOM_BAND of the best", () => {
    expect(pick(0)).toBe("q1");
    expect(pick(0.99)).toBe("q3");
  });

  it("never asks a question twice", () => {
    expect(pick(0, answered([1, "yes"]))).toBe("q3");
  });

  it("measures the power on the top groups once the user has answered Yes or No", () => {
    const shifting = poolOf([
      { A: 1, B: 1, C: 1, D: -1 },
      { A: 1, B: 1, C: 1, D: -1 }, // power 2 overall, 0 among A, B, C
      { A: 0.5, B: -0.5, C: 0, D: 0.5 }, // power 1 overall and among A, B, C
    ]);

    expect(selectNextQuestion(shifting, answered([1, "neutral"]), () => 0)?.id).toBe("q2");
    expect(selectNextQuestion(shifting, answered([1, "yes"]), () => 0)?.id).toBe("q3");
  });

  it("returns null when the pool is exhausted", () => {
    expect(selectNextQuestion(pool, answered([1, "yes"], [2, "no"], [3, "neutral"], [4, "yes"]), () => 0)).toBeNull();
  });

  it("is reproducible with the same random seed", () => {
    const play = (seed: number) => playSession(fixturePool, () => "yes", seededRandom(seed));

    expect(play(42)).toEqual(play(42));
  });
});
