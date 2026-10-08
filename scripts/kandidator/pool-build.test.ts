import { describe, expect, it } from "vitest";
import { scrutinsFileSchema } from "../../src/data/kandidator/schemas.ts";
import { buildPoolFiles } from "./pool-build.ts";
import type { ShortlistFile } from "./schemas.ts";

/** Fictional shortlist: never real political data. */
const breakdown = (ref: string, votes: number) => {
  return { ref, for: votes, against: 10 - votes, abstention: 0, nonVoting: 0, absent: 0 };
};

const entry = (number: number) => {
  return {
    number,
    uid: `VTANR5L17V${number}`,
    date: "2025-01-15",
    title: `Fictional scrutin ${number}`,
    sourceUrl: `https://www.assemblee-nationale.fr/dyn/17/scrutins/${number}`,
    groups: [breakdown("PO1", 10), breakdown("PO2", 0), breakdown("PO9", 5)],
  };
};

const shortlist: ShortlistFile = {
  legislature: 17,
  sources: [
    {
      id: "scrutins",
      url: "https://example.org/Scrutins.json.zip",
      retrievedAt: "2026-01-01T00:00:00.000Z",
      sha256: "0".repeat(64),
    },
  ],
  groups: [
    { ref: "PO1", abbreviation: "A", name: "Group A" },
    { ref: "PO2", abbreviation: "B", name: "Group B" },
    { ref: "PO9", abbreviation: "X", name: "Excluded group" },
  ],
  shortlist: [entry(30), entry(10), entry(20)],
};

describe("buildPoolFiles", () => {
  it("keeps only the referenced scrutins, sorted by number, without the excluded groups", () => {
    const { groups, scrutins } = buildPoolFiles(shortlist, [30, 10], ["PO9"]);

    expect(groups.map((group) => group.ref)).toEqual(["PO1", "PO2"]);
    expect(scrutins.scrutins.map((scrutin) => scrutin.number)).toEqual([10, 30]);
    expect(scrutins.scrutins[0].groups).toEqual([breakdown("PO1", 10), breakdown("PO2", 0)]);
  });

  it("produces files that match the pool schema", () => {
    expect(scrutinsFileSchema.safeParse(buildPoolFiles(shortlist, [20], ["PO9"]).scrutins).success).toBe(true);
  });

  it("is deterministic", () => {
    expect(buildPoolFiles(shortlist, [20, 10], ["PO9"])).toEqual(buildPoolFiles(shortlist, [10, 20], ["PO9"]));
  });

  it("fails on a scrutin missing from the shortlist", () => {
    expect(() => buildPoolFiles(shortlist, [10, 99], ["PO9"])).toThrow("99");
  });

  it("fails on another legislature", () => {
    expect(() => buildPoolFiles({ ...shortlist, legislature: 16 }, [10], [])).toThrow("legislature");
  });
});
