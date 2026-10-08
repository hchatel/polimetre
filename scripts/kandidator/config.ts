/**
 * Configuration of the Kandidator scrutin shortlist scripts (ROADMAP S2).
 * Dev-only: never imported by the app.
 */

export const LEGISLATURE = 17;

const OPEN_DATA = `https://data.assemblee-nationale.fr/static/openData/repository/${LEGISLATURE}`;

/** Official archives, confirmed on data.assemblee-nationale.fr (see docs/DATA_SOURCES.md). */
export const SOURCES = {
  scrutins: {
    url: `${OPEN_DATA}/loi/scrutins/Scrutins.json.zip`,
    /** Only these archive members are extracted. */
    members: ["json/*"],
  },
  // Historical AMO: the only archive that also contains groups dissolved during the legislature.
  organes: {
    url: `${OPEN_DATA}/amo/tous_acteurs_mandats_organes_xi_legislature/AMO30_tous_acteurs_tous_mandats_tous_organes_historique.json.zip`,
    members: ["json/organe/*"],
  },
} as const;

export type SourceId = keyof typeof SOURCES;

export const CACHE_DIR = ".cache/kandidator";
export const SCRUTINS_DIR = `${CACHE_DIR}/scrutins/json`;
export const ORGANES_DIR = `${CACHE_DIR}/organes/json/organe`;
export const RETRIEVAL_FILE = `${CACHE_DIR}/retrieval.json`;

export const OUTPUT_DIR = "data/kandidator";
export const OUTPUT_JSON = `${OUTPUT_DIR}/shortlist-l${LEGISLATURE}.json`;
export const OUTPUT_MARKDOWN = `${OUTPUT_DIR}/shortlist-l${LEGISLATURE}.md`;

/** "Non inscrits": listed like a group in the breakdowns, but not a group. Excluded from ranking. */
export const NON_INSCRITS_REF = "PO840056";

/** METHODOLOGY.md §11 — number of scrutins kept in the shortlist. */
export const SHORTLIST_SIZE = 150;

/**
 * METHODOLOGY.md §11 — scrutins added to the shortlist on top of the ranked ones (maintainer decision, 2026-10-08).
 * 468: direct deletion of the return to 62 (same split as 470, so the ranking leaves it out).
 */
export const SHORTLIST_REQUIRED = [468];

/** METHODOLOGY.md §11 — share of groups that must have a known position for a scrutin to be ranked. */
export const MIN_KNOWN_GROUPS_RATIO = 2 / 3;

export const scrutinSourceUrl = (number: number): string => {
  return `https://www.assemblee-nationale.fr/dyn/${LEGISLATURE}/scrutins/${number}`;
};

/** ROADMAP S4 — files of the Kandidator question pool. */
export const POOL_DIR = "src/data/kandidator";
export const POOL_QUESTIONS = `${POOL_DIR}/questions.json`;
export const POOL_SCRUTINS = `${POOL_DIR}/scrutins.json`;
export const POOL_GROUPS = `${POOL_DIR}/groups.json`;

/** UDR: replaced by UDDPLR on 2025-09-05. Maintainer decision (2026-10-08): only UDDPLR is kept in the pool. */
export const UDR_REF = "PO847173";

/** Groups left out of the question pool. */
export const POOL_EXCLUDED_GROUP_REFS = [NON_INSCRITS_REF, UDR_REF];
