import { describe, expect, it } from "vitest";
import { normalizeScrutin, type Scrutin } from "./normalize.ts";
import { analyzeScrutin, rankScrutins, sameSplit, type RankingOptions } from "./rank.ts";
import { rawScrutinSchema } from "./schemas.ts";
import { rawScrutin, type FixtureGroup } from "./test-fixtures.ts";

const options: RankingOptions = { excludedGroupRefs: ["PO_NI"], minKnownGroupsRatio: 2 / 3, size: 10 };

const scrutin = (number: number, groups: FixtureGroup[]): Scrutin => {
  const result = normalizeScrutin(rawScrutinSchema.parse(rawScrutin(number, groups)));
  if (!result.ok) throw new Error(result.reason);

  return result.scrutin;
};

/** Group fully for (+1), fully against (-1), or not voting at all (unknown), with `voters` votes out of 10. */
const group = (ref: string, vote: 1 | -1 | null, voters = 10): FixtureGroup => {
  if (vote === null) return { ref, members: 10 };

  return vote === 1 ? { ref, members: 10, for: voters } : { ref, members: 10, against: voters };
};

const analyze = (s: Scrutin) => {
  const analysis = analyzeScrutin(s, options);
  if (!analysis) throw new Error("not eligible");

  return analysis;
};

describe("analyzeScrutin (§11)", () => {
  it("scores a cohesive split at the maximum", () => {
    const analysis = analyze(scrutin(1, [group("PO_A", 1), group("PO_B", -1), group("PO_C", -1)]));
    expect(analysis).toMatchObject({ discrimination: 2, cohesion: 1, score: 2, pattern: "PO_A:+ PO_B:- PO_C:-" });
  });

  it("gives 0 discrimination when every group voted the same way", () => {
    expect(analyze(scrutin(1, [group("PO_A", 1), group("PO_B", 1), group("PO_C", 1)])).score).toBe(0);
  });

  it("lowers cohesion for split groups", () => {
    const analysis = analyze(
      scrutin(1, [
        { ref: "PO_A", members: 10, for: 6, against: 4 },
        { ref: "PO_B", members: 10, against: 10 },
      ]),
    );
    expect(analysis.discrimination).toBeCloseTo(1.2);
    expect(analysis.cohesion).toBeCloseTo(0.6);
  });

  it("ignores non-inscrits", () => {
    const analysis = analyze(scrutin(1, [group("PO_A", 1), group("PO_B", 1), group("PO_NI", -1)]));
    expect(analysis.score).toBe(0);
    expect(analysis.positions.has("PO_NI")).toBe(false);
  });

  it("is not eligible when fewer than 2/3 of the groups have a known position", () => {
    expect(analyzeScrutin(scrutin(1, [group("PO_A", 1), group("PO_B", null), group("PO_C", null)]), options)).toBeNull();
  });

  it("is eligible at exactly 2/3 of the groups", () => {
    expect(analyzeScrutin(scrutin(1, [group("PO_A", 1), group("PO_B", -1), group("PO_C", null)]), options)).not.toBeNull();
  });

  it("measures participation over ranked groups", () => {
    const analysis = analyze(scrutin(1, [group("PO_A", 1, 4), group("PO_B", -1, 6), group("PO_NI", 1, 10)]));
    expect(analysis.participation).toBeCloseTo(0.5);
  });
});

describe("sameSplit", () => {
  it("ignores groups unknown on either side", () => {
    const a = analyze(scrutin(1, [group("PO_A", 1), group("PO_B", -1), group("PO_C", null)]));
    const b = analyze(scrutin(2, [group("PO_A", 1), group("PO_B", -1), group("PO_C", 1)]));
    expect(sameSplit(a, b)).toBe(true);
  });

  it("detects a group voting the other way", () => {
    const a = analyze(scrutin(1, [group("PO_A", 1), group("PO_B", -1), group("PO_C", -1)]));
    const b = analyze(scrutin(2, [group("PO_A", 1), group("PO_B", -1), group("PO_C", 1)]));
    expect(sameSplit(a, b)).toBe(false);
  });
});

describe("rankScrutins (§11)", () => {
  const ab = [group("PO_A", 1), group("PO_B", -1), group("PO_C", -1)];
  const ac = [group("PO_A", 1), group("PO_B", 1), group("PO_C", -1)];

  it("prefers a new split over repeating the same one", () => {
    const scrutins = [
      scrutin(1, ab),
      scrutin(2, ab),
      scrutin(3, [group("PO_A", 1), { ref: "PO_B", members: 10, for: 2, against: 8 }, group("PO_C", -1)]),
      scrutin(4, [{ ref: "PO_A", members: 10, for: 9, against: 1 }, group("PO_B", 1), group("PO_C", -1)]),
    ];
    const { shortlist } = rankScrutins(scrutins, { ...options, size: 2 });
    expect(shortlist.map((a) => a.scrutin.number)).toEqual([1, 4]);
  });

  it("breaks ties by participation, then by scrutin number", () => {
    const scrutins = [
      scrutin(1, ab.map((g) => ({ ...g, ...(g.for ? { for: 3 } : { against: 3 }) }))),
      scrutin(2, ac),
      scrutin(3, ab),
    ];
    const { shortlist } = rankScrutins(scrutins, options);
    expect(shortlist.map((a) => a.scrutin.number)).toEqual([2, 3, 1]);
  });

  it("counts eligible scrutins and respects the size", () => {
    const scrutins = [scrutin(1, ab), scrutin(2, ac), scrutin(3, [group("PO_A", 1), group("PO_B", null), group("PO_C", null)])];
    const { shortlist, eligible } = rankScrutins(scrutins, { ...options, size: 1 });
    expect(eligible).toBe(2);
    expect(shortlist).toHaveLength(1);
  });

  it("is deterministic regardless of input order", () => {
    const scrutins = [scrutin(1, ab), scrutin(2, ac), scrutin(3, ab), scrutin(4, ac)];
    const forward = rankScrutins(scrutins, options).shortlist.map((a) => a.scrutin.number);
    const backward = rankScrutins(scrutins.toReversed(), options).shortlist.map((a) => a.scrutin.number);
    expect(backward).toEqual(forward);
  });
});
