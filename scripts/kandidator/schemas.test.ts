import { describe, expect, it } from "vitest";
import { rawGroupSchema, rawScrutinSchema } from "./schemas.ts";
import { rawGroup, rawScrutin } from "./test-fixtures.ts";

describe("rawScrutinSchema", () => {
  it("parses counts given as strings", () => {
    const parsed = rawScrutinSchema.parse(rawScrutin(12, [{ ref: "PO_A", members: 10, for: 7 }]));
    expect(parsed.scrutin.numero).toBe(12);
    expect(parsed.scrutin.ventilationVotes.organe.groupes.groupe[0].vote.decompteVoix.pour).toBe(7);
  });

  it("accepts a single group given as an object instead of a list", () => {
    const raw = rawScrutin(1, [{ ref: "PO_A", members: 10 }]);
    const single = {
      scrutin: {
        ...raw.scrutin,
        ventilationVotes: { organe: { groupes: { groupe: raw.scrutin.ventilationVotes.organe.groupes.groupe[0] } } },
      },
    };
    expect(rawScrutinSchema.parse(single).scrutin.ventilationVotes.organe.groupes.groupe).toHaveLength(1);
  });

  it("rejects a non-numeric count", () => {
    const raw = rawScrutin(1, [{ ref: "PO_A", members: 10 }]);
    raw.scrutin.ventilationVotes.organe.groupes.groupe[0].nombreMembresGroupe = "ten";
    expect(rawScrutinSchema.safeParse(raw).success).toBe(false);
  });

  it("rejects an unexpected majority position", () => {
    const raw = rawScrutin(1, [{ ref: "PO_A", members: 10 }]);
    const group = raw.scrutin.ventilationVotes.organe.groupes.groupe[0];
    expect(
      rawScrutinSchema.safeParse({
        scrutin: {
          ...raw.scrutin,
          ventilationVotes: {
            organe: { groupes: { groupe: [{ ...group, vote: { ...group.vote, positionMajoritaire: "nonVotant" } }] } },
          },
        },
      }).success,
    ).toBe(false);
  });
});

describe("rawGroupSchema", () => {
  it("parses a parliamentary group", () => {
    expect(rawGroupSchema.parse(rawGroup("PO_A")).organe.libelleAbrev).toBe("PO_A");
  });

  it("rejects an organe that is not a parliamentary group", () => {
    const raw = rawGroup("PO_A");
    expect(rawGroupSchema.safeParse({ organe: { ...raw.organe, codeType: "COMPER" } }).success).toBe(false);
  });
});
