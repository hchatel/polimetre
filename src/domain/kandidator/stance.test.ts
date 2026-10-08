import { describe, expect, it } from "vitest";
import { stance, stanceOf } from "./stance.ts";
import { fixturePool } from "./test-support.ts";

describe("stance (§8.2)", () => {
  it("keeps the position when polarity is +1", () => {
    expect(stance(1, { kind: "known", value: 0.5 })).toEqual({ kind: "known", value: 0.5 });
  });

  it("flips the position when polarity is -1", () => {
    expect(stance(-1, { kind: "known", value: 0.5 })).toEqual({ kind: "known", value: -0.5 });
  });

  it("stays unknown when the position is unknown", () => {
    expect(stance(-1, { kind: "unknown" })).toEqual({ kind: "unknown" });
  });
});

describe("stanceOf", () => {
  const q3 = fixturePool.questions[2];

  it("applies the question polarity to the pool position", () => {
    expect(stanceOf(fixturePool, q3, "C")).toEqual({ kind: "known", value: 1 });
  });

  it("is unknown for a group missing from the scrutin", () => {
    expect(stanceOf(fixturePool, q3, "Z")).toEqual({ kind: "unknown" });
  });
});
