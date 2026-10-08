import { describe, expect, it } from "vitest";
import { MAX_QUESTIONS, MIN_QUESTIONS, STOP_GAP } from "./parameters.ts";
import { shouldStop } from "./stop-rule.ts";
import { answered, poolOf } from "./test-support.ts";
import type { Answer } from "./types.ts";

/** Pool of `size` questions where A is always +1 and B always `b`. */
const twoGroups = (size: number, b: number) => {
  return poolOf(Array.from({ length: size }, () => ({ A: 1, B: b })));
};

const answers = (count: number, answer: Answer = "yes") => {
  return answered(...Array.from({ length: count }, (_, index): [number, Answer] => [index + 1, answer]));
};

describe("shouldStop (§9)", () => {
  it(`stops after MAX_QUESTIONS (${MAX_QUESTIONS}) questions, Neutral included`, () => {
    const pool = twoGroups(MAX_QUESTIONS + 5, 1);

    expect(shouldStop(pool, answers(MAX_QUESTIONS - 1, "neutral"))).toBe(false);
    expect(shouldStop(pool, answers(MAX_QUESTIONS, "neutral"))).toBe(true);
  });

  it("stops when the pool is exhausted", () => {
    expect(shouldStop(twoGroups(2, 1), answers(2, "neutral"))).toBe(true);
  });

  it(`stops after MIN_QUESTIONS (${MIN_QUESTIONS}) Yes/No answers once the gap reaches STOP_GAP (${STOP_GAP})`, () => {
    // Every Yes gives A 100% and B 100 - STOP_GAP: the gap is exactly STOP_GAP points.
    const pool = twoGroups(MAX_QUESTIONS, 1 - (2 * STOP_GAP) / 100);

    expect(shouldStop(pool, answers(MIN_QUESTIONS - 1))).toBe(false);
    expect(shouldStop(pool, answers(MIN_QUESTIONS))).toBe(true);
  });

  it("does not count Neutral answers toward MIN_QUESTIONS", () => {
    const pool = twoGroups(MAX_QUESTIONS, -1);
    const mixed = [...answers(MIN_QUESTIONS - 1), { questionId: `q${MIN_QUESTIONS}`, answer: "neutral" as const }];

    expect(shouldStop(pool, mixed)).toBe(false);
  });

  it("continues while the gap is below STOP_GAP", () => {
    const pool = twoGroups(MAX_QUESTIONS, 1 - (2 * STOP_GAP) / 100 + 0.02);

    expect(shouldStop(pool, answers(MIN_QUESTIONS))).toBe(false);
  });
});
