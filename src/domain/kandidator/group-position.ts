import { MIN_EXPRESSED } from "./parameters.ts";
import type { GroupPosition, GroupVoteBreakdown } from "./types.ts";

/**
 * METHODOLOGY.md §8.1 — position of a group on a scrutin.
 *
 * position = (for - against) / (for + against + abstention), in [-1, +1].
 * Non-voting and absent members are excluded; abstentions pull toward 0.
 * Unknown when fewer than MIN_EXPRESSED members expressed a position.
 */
export const groupPosition = (breakdown: GroupVoteBreakdown): GroupPosition => {
  const expressed = breakdown.for + breakdown.against + breakdown.abstention;
  if (expressed < MIN_EXPRESSED) {
    return { kind: "unknown" };
  }

  return { kind: "known", value: (breakdown.for - breakdown.against) / expressed };
};
