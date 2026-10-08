/** Fictional data in the official JSON shape, for tests only. Never real political data. */

export type FixtureGroup = {
  ref: string;
  members: number;
  for?: number;
  against?: number;
  abstention?: number;
  nonVoting?: number;
  voluntaryNonVoting?: number;
  majority?: "pour" | "contre" | "abstention";
};

export const rawScrutin = (number: number, groups: FixtureGroup[]) => {
  const groupe = groups.map((group) => ({
    organeRef: group.ref,
    nombreMembresGroupe: String(group.members),
    vote: {
      positionMajoritaire: group.majority ?? "pour",
      decompteVoix: {
        nonVotants: String(group.nonVoting ?? 0),
        pour: String(group.for ?? 0),
        contre: String(group.against ?? 0),
        abstentions: String(group.abstention ?? 0),
        nonVotantsVolontaires: String(group.voluntaryNonVoting ?? 0),
      },
      decompteNominatif: null,
    },
  }));

  return {
    scrutin: {
      uid: `VTANR5L17V${number}`,
      numero: String(number),
      legislature: "17",
      dateScrutin: "2025-01-15",
      typeVote: { codeTypeVote: "SPO", libelleTypeVote: "scrutin public ordinaire" },
      sort: { code: "adopté", libelle: "Fictional" },
      titre: `Fictional scrutin ${number}`,
      ventilationVotes: { organe: { organeRef: "PO_AN", groupes: { groupe } } },
    },
  };
};

export const rawGroup = (ref: string) => {
  return {
    organe: {
      uid: ref,
      codeType: "GP",
      libelle: `Group ${ref}`,
      libelleAbrev: ref,
      legislature: "17",
      viMoDe: { dateDebut: "2024-07-18", dateAgrement: null, dateFin: null },
    },
  };
};
