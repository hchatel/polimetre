import type { GroupVoteBreakdown } from "../../src/domain/kandidator/types.ts";
import { scrutinSourceUrl } from "./config.ts";
import type { RawGroup, RawScrutin } from "./schemas.ts";

export type MajorityPosition = "for" | "against" | "abstention";

export type GroupVote = {
  groupRef: string;
  /** Group size at the date of the scrutin, as published. */
  members: number;
  /** Official majority position, kept alongside the full distribution. */
  majorityPosition: MajorityPosition;
  breakdown: GroupVoteBreakdown;
  /**
   * `nonVotantsVolontaires` as published. Not a separate category: in the data it overlaps
   * other counts (often equal to abstentions), so it is kept for reference but never used.
   */
  reportedVoluntaryNonVoting: number;
};

export type Scrutin = {
  uid: string;
  legislature: number;
  number: number;
  date: string;
  title: string;
  voteType: { code: string; label: string };
  result: "adopté" | "rejeté";
  sourceUrl: string;
  groups: GroupVote[];
};

export type Group = {
  ref: string;
  abbreviation: string;
  name: string;
  startDate: string;
  endDate: string | null;
};

export type NormalizeResult = { ok: true; scrutin: Scrutin } | { ok: false; reason: string };

/** Placeholder ref found upstream instead of real groups in a few scrutins. */
const UNKNOWN_GROUP_REF = "PO0";

const MAJORITY_POSITIONS: Record<"pour" | "contre" | "abstention", MajorityPosition> = {
  pour: "for",
  contre: "against",
  abstention: "abstention",
};

/**
 * Raw scrutin → per-group distribution. Absences are derived from the published group size.
 * Known upstream data issues exclude the scrutin with a reason instead of guessing.
 */
export const normalizeScrutin = (raw: RawScrutin): NormalizeResult => {
  const s = raw.scrutin;
  const groups: GroupVote[] = [];

  for (const group of s.ventilationVotes.organe.groupes.groupe) {
    if (group.organeRef === UNKNOWN_GROUP_REF) {
      return { ok: false, reason: `group reference "${UNKNOWN_GROUP_REF}" instead of a real group` };
    }
    const votes = group.vote.decompteVoix;
    const recorded = votes.pour + votes.contre + votes.abstentions + votes.nonVotants;
    const absent = group.nombreMembresGroupe - recorded;
    if (absent < 0) {
      return {
        ok: false,
        reason: `group ${group.organeRef} has ${recorded} recorded votes for ${group.nombreMembresGroupe} members`,
      };
    }
    groups.push({
      groupRef: group.organeRef,
      members: group.nombreMembresGroupe,
      majorityPosition: MAJORITY_POSITIONS[group.vote.positionMajoritaire],
      breakdown: {
        for: votes.pour,
        against: votes.contre,
        abstention: votes.abstentions,
        nonVoting: votes.nonVotants,
        absent,
      },
      reportedVoluntaryNonVoting: votes.nonVotantsVolontaires,
    });
  }

  return {
    ok: true,
    scrutin: {
      uid: s.uid,
      legislature: s.legislature,
      number: s.numero,
      date: s.dateScrutin,
      title: s.titre,
      voteType: { code: s.typeVote.codeTypeVote, label: s.typeVote.libelleTypeVote },
      result: s.sort.code,
      sourceUrl: scrutinSourceUrl(s.numero),
      groups,
    },
  };
};

export const normalizeGroup = (raw: RawGroup): Group => {
  const o = raw.organe;

  return {
    ref: o.uid,
    abbreviation: o.libelleAbrev,
    name: o.libelle,
    startDate: o.viMoDe.dateDebut,
    endDate: o.viMoDe.dateFin,
  };
};
