import { describe, expect, it } from "vitest";
import { normalizeScrutin } from "./normalize.ts";
import { rawScrutinSchema } from "./schemas.ts";
import { rawScrutin, type FixtureGroup } from "./test-fixtures.ts";

const normalize = (groups: FixtureGroup[]) => {
  return normalizeScrutin(rawScrutinSchema.parse(rawScrutin(42, groups)));
};

describe("normalizeScrutin", () => {
  it("keeps every vote category distinct and derives absences from the group size", () => {
    const result = normalize([
      { ref: "PO_A", members: 20, for: 5, against: 3, abstention: 2, nonVoting: 1, majority: "pour" },
    ]);
    expect(result).toMatchObject({
      ok: true,
      scrutin: {
        number: 42,
        sourceUrl: "https://www.assemblee-nationale.fr/dyn/17/scrutins/42",
        groups: [
          {
            groupRef: "PO_A",
            members: 20,
            majorityPosition: "for",
            breakdown: { for: 5, against: 3, abstention: 2, nonVoting: 1, absent: 9 },
          },
        ],
      },
    });
  });

  it("keeps the reported voluntary non-voting count without subtracting it from absences", () => {
    const result = normalize([{ ref: "PO_A", members: 10, abstention: 4, voluntaryNonVoting: 4 }]);
    expect(result.ok && result.scrutin.groups[0]).toMatchObject({
      reportedVoluntaryNonVoting: 4,
      breakdown: { abstention: 4, absent: 6 },
    });
  });

  it("excludes a scrutin whose groups use the PO0 placeholder", () => {
    expect(normalize([{ ref: "PO0", members: 10, for: 5 }])).toEqual({
      ok: false,
      reason: 'group reference "PO0" instead of a real group',
    });
  });

  it("excludes a scrutin with more recorded votes than members", () => {
    expect(normalize([{ ref: "PO_A", members: 3, for: 4 }])).toMatchObject({ ok: false });
  });
});
