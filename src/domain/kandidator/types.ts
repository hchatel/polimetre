/**
 * Votes of one parliamentary group on one scrutin.
 * The categories are kept distinct (METHODOLOGY.md §4–5): they are never merged.
 */
export type GroupVoteBreakdown = {
  for: number;
  against: number;
  abstention: number;
  /** Present but recorded as not voting (e.g. presiding officer). */
  nonVoting: number;
  /** Not listed in the scrutin; derived from the group size at the vote date. */
  absent: number;
};

/** Position of a group on a scrutin, in [-1, +1], or unknown when too few members expressed one. */
export type GroupPosition =
  | { kind: "known"; value: number }
  | { kind: "unknown" };
