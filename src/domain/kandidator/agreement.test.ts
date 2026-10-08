import { describe, expect, it } from "vitest";
import { agreement, answerValue } from "./agreement.ts";

describe("answerValue (§8.3)", () => {
  it("maps Yes to +1, No to -1 and Neutral to null", () => {
    expect(answerValue("yes")).toBe(1);
    expect(answerValue("no")).toBe(-1);
    expect(answerValue("neutral")).toBeNull();
  });
});

describe("agreement (§8.4)", () => {
  it("is 1 when the answer matches a fully cohesive stance", () => {
    expect(agreement(1, 1)).toBe(1);
    expect(agreement(-1, -1)).toBe(1);
  });

  it("is 0 when the answer opposes a fully cohesive stance", () => {
    expect(agreement(1, -1)).toBe(0);
    expect(agreement(-1, 1)).toBe(0);
  });

  it("is 0.5 against a split group", () => {
    expect(agreement(1, 0)).toBe(0.5);
    expect(agreement(-1, 0)).toBe(0.5);
  });

  it("is linear in between", () => {
    expect(agreement(1, 0.5)).toBe(0.75);
    expect(agreement(-1, 0.5)).toBe(0.25);
  });
});
