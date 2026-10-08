import type { PoolGroup, ScrutinsFile } from "../../src/data/kandidator/schemas.ts";
import type { ShortlistFile } from "./schemas.ts";

export type PoolFiles = {
  groups: PoolGroup[];
  scrutins: ScrutinsFile;
};

/**
 * Copies, from the committed shortlist, the scrutins referenced by the questions and
 * the groups kept in the pool. No number is typed by hand: breakdowns come from the shortlist.
 * Output order is deterministic: groups as in the shortlist, scrutins by number.
 */
export const buildPoolFiles = (
  shortlist: ShortlistFile,
  scrutinNumbers: readonly number[],
  excludedGroupRefs: readonly string[],
): PoolFiles => {
  if (shortlist.legislature !== 17) {
    throw new Error(`The pool covers legislature 17 only (ADR-012), got ${shortlist.legislature}`);
  }
  const excluded = new Set(excludedGroupRefs);
  const isKept = (ref: string) => !excluded.has(ref);
  const byNumber = new Map(shortlist.shortlist.map((entry) => [entry.number, entry]));

  const missing = scrutinNumbers.filter((number) => !byNumber.has(number));
  if (missing.length > 0) {
    throw new Error(`Scrutins referenced by questions but missing from the shortlist: ${missing.join(", ")}`);
  }

  const scrutins = [...new Set(scrutinNumbers)]
    .sort((a, b) => a - b)
    .map((number) => {
      const entry = byNumber.get(number);
      if (!entry) throw new Error(`Scrutin ${number} missing from the shortlist`);

      return {
        number: entry.number,
        uid: entry.uid,
        date: entry.date,
        title: entry.title,
        sourceUrl: entry.sourceUrl,
        groups: entry.groups
          .filter((group) => isKept(group.ref))
          .map((group) => ({
            ref: group.ref,
            for: group.for,
            against: group.against,
            abstention: group.abstention,
            nonVoting: group.nonVoting,
            absent: group.absent,
          })),
      };
    });

  return {
    groups: shortlist.groups
      .filter((group) => isKept(group.ref))
      .map((group) => ({ ref: group.ref, abbreviation: group.abbreviation, name: group.name })),
    scrutins: { legislature: 17, sources: shortlist.sources, scrutins },
  };
};
