import { describe, expect, it } from "vitest";
import { groupPosition } from "./group-position.ts";
import { MIN_EXPRESSED } from "./parameters.ts";
import type { GroupVoteBreakdown } from "./types.ts";

const breakdown = (partial: Partial<GroupVoteBreakdown>): GroupVoteBreakdown => {
  return { for: 0, against: 0, abstention: 0, nonVoting: 0, absent: 0, ...partial };
};

describe("groupPosition (§8.1)", () => {
  it("is +1 when every expressed vote is for", () => {
    expect(groupPosition(breakdown({ for: 10 }))).toEqual({ kind: "known", value: 1 });
  });

  it("is -1 when every expressed vote is against", () => {
    expect(groupPosition(breakdown({ against: 10 }))).toEqual({ kind: "known", value: -1 });
  });

  it("is 0 for an evenly split group", () => {
    expect(groupPosition(breakdown({ for: 5, against: 5 }))).toEqual({ kind: "known", value: 0 });
  });

  it("counts abstentions in the denominator, pulling toward 0", () => {
    expect(groupPosition(breakdown({ for: 6, abstention: 2 }))).toEqual({
      kind: "known",
      value: 0.75,
    });
  });

  it("ignores non-voting and absent members", () => {
    expect(groupPosition(breakdown({ for: 3, against: 1, nonVoting: 40, absent: 40 }))).toEqual({
      kind: "known",
      value: 0.5,
    });
  });

  it("is unknown below MIN_EXPRESSED expressed votes", () => {
    expect(groupPosition(breakdown({ for: MIN_EXPRESSED - 1, nonVoting: 10, absent: 50 }))).toEqual({
      kind: "unknown",
    });
  });

  it("is known at exactly MIN_EXPRESSED expressed votes", () => {
    expect(groupPosition(breakdown({ against: MIN_EXPRESSED }))).toEqual({ kind: "known", value: -1 });
  });
});
