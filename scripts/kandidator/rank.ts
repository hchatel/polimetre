import { groupPosition } from "../../src/domain/kandidator/group-position.ts";
import type { GroupPosition } from "../../src/domain/kandidator/types.ts";
import type { Scrutin } from "./normalize.ts";

export type RankingOptions = {
  /** Groups listed in breakdowns but not ranked (non-inscrits). */
  excludedGroupRefs: readonly string[];
  minKnownGroupsRatio: number;
  size: number;
  /** Scrutin numbers added after the ranked ones when not already kept (maintainer choice). */
  required: readonly number[];
};

type Sign = "+" | "-" | "0";

export type ScrutinAnalysis = {
  scrutin: Scrutin;
  positions: ReadonlyMap<string, GroupPosition>;
  /** Spread of known positions: max − min, in [0, 2]. */
  discrimination: number;
  /** Mean of |position| over known positions, in [0, 1]. */
  cohesion: number;
  score: number;
  /** Expressed votes / members, over ranked groups. Only used to break ties. */
  participation: number;
  /** Sign of each ranked group's position, e.g. "PO1:+ PO2:- PO3:?". */
  pattern: string;
};

const sign = (value: number): Sign => {
  if (value > 0) return "+";
  if (value < 0) return "-";

  return "0";
};

/**
 * METHODOLOGY.md §11 — discrimination, cohesion and split pattern of one scrutin.
 * Returns null when fewer than `minKnownGroupsRatio` of the ranked groups have a known position.
 */
export const analyzeScrutin = (scrutin: Scrutin, options: RankingOptions): ScrutinAnalysis | null => {
  const ranked = scrutin.groups
    .filter((group) => !options.excludedGroupRefs.includes(group.groupRef))
    .toSorted((a, b) => a.groupRef.localeCompare(b.groupRef));
  const positions = new Map(ranked.map((group) => [group.groupRef, groupPosition(group.breakdown)]));
  const known = [...positions.values()].flatMap((p) => (p.kind === "known" ? [p.value] : []));

  if (known.length < 2 || known.length < options.minKnownGroupsRatio * ranked.length) {
    return null;
  }

  const discrimination = Math.max(...known) - Math.min(...known);
  const cohesion = known.reduce((sum, value) => sum + Math.abs(value), 0) / known.length;
  const members = ranked.reduce((sum, group) => sum + group.members, 0);
  const expressed = ranked.reduce(
    (sum, { breakdown }) => sum + breakdown.for + breakdown.against + breakdown.abstention,
    0,
  );
  const pattern = [...positions]
    .map(([ref, position]) => `${ref}:${position.kind === "known" ? sign(position.value) : "?"}`)
    .join(" ");

  return {
    scrutin,
    positions,
    discrimination,
    cohesion,
    score: discrimination * cohesion,
    participation: members === 0 ? 0 : expressed / members,
    pattern,
  };
};

/**
 * Two scrutins split the groups the same way when no group known in both
 * has a different sign. Unknown positions never make two splits different.
 */
export const sameSplit = (a: ScrutinAnalysis, b: ScrutinAnalysis): boolean => {
  for (const [ref, position] of a.positions) {
    const other = b.positions.get(ref);
    if (position.kind === "known" && other?.kind === "known" && sign(position.value) !== sign(other.value)) {
      return false;
    }
  }

  return true;
};

/**
 * METHODOLOGY.md §11 — greedy shortlist. At each step, keeps the scrutin with the best
 * score / (1 + number of already kept scrutins with the same split), so that different
 * splits of the groups are represented. Ties go to the highest participation, then to the
 * lowest scrutin number: deterministic. Required scrutins not already kept are then appended
 * in number order; each must be eligible.
 */
export const rankScrutins = (
  scrutins: readonly Scrutin[],
  options: RankingOptions,
): { shortlist: ScrutinAnalysis[]; eligible: number } => {
  const remaining = scrutins
    .map((scrutin) => analyzeScrutin(scrutin, options))
    .filter((analysis): analysis is ScrutinAnalysis => analysis !== null)
    .map((analysis) => ({ analysis, sameSplitKept: 0 }));
  const eligible = remaining.length;
  const shortlist: ScrutinAnalysis[] = [];

  const value = (candidate: (typeof remaining)[number]) =>
    candidate.analysis.score / (1 + candidate.sameSplitKept);
  const isBetter = (a: (typeof remaining)[number], b: (typeof remaining)[number]) =>
    value(a) !== value(b)
      ? value(a) > value(b)
      : a.analysis.participation !== b.analysis.participation
        ? a.analysis.participation > b.analysis.participation
        : a.analysis.scrutin.number < b.analysis.scrutin.number;

  while (shortlist.length < options.size && remaining.length > 0) {
    let bestIndex = 0;
    for (let index = 1; index < remaining.length; index++) {
      if (isBetter(remaining[index], remaining[bestIndex])) bestIndex = index;
    }
    const [best] = remaining.splice(bestIndex, 1);
    shortlist.push(best.analysis);
    for (const candidate of remaining) {
      if (sameSplit(candidate.analysis, best.analysis)) candidate.sameSplitKept++;
    }
  }

  const kept = new Set(shortlist.map((analysis) => analysis.scrutin.number));
  for (const number of [...new Set(options.required)].sort((a, b) => a - b)) {
    if (kept.has(number)) continue;
    const required = remaining.find((candidate) => candidate.analysis.scrutin.number === number);
    if (!required) throw new Error(`Required scrutin ${number} is missing or not eligible`);
    shortlist.push(required.analysis);
  }

  return { shortlist, eligible };
};
