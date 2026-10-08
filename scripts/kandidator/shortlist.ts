/**
 * Builds the committed scrutin shortlist from the downloaded cache (ROADMAP S2).
 * Usage: pnpm kandidator:download && pnpm kandidator:shortlist
 *
 * Any file that does not match the expected format stops the run: the previous
 * shortlist is left untouched. Known upstream data issues exclude a scrutin and are listed.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { z } from "zod";
import {
  MIN_KNOWN_GROUPS_RATIO,
  NON_INSCRITS_REF,
  ORGANES_DIR,
  OUTPUT_DIR,
  OUTPUT_JSON,
  OUTPUT_MARKDOWN,
  RETRIEVAL_FILE,
  SCRUTINS_DIR,
  SHORTLIST_REQUIRED,
  SHORTLIST_SIZE,
} from "./config.ts";
import { normalizeGroup, normalizeScrutin, type Scrutin } from "./normalize.ts";
import { toJson, toMarkdown } from "./output.ts";
import { rankScrutins, type RankingOptions } from "./rank.ts";
import { rawGroupSchema, rawScrutinSchema, retrievalSchema } from "./schemas.ts";

const readJson = <T extends z.ZodType>(path: string, schema: T): z.infer<T> => {
  const result = schema.safeParse(JSON.parse(readFileSync(path, "utf8")));
  if (!result.success) {
    throw new Error(`${path} does not match the expected format:\n${result.error.message}`);
  }

  return result.data;
};

const writeAtomically = (path: string, content: string): void => {
  const temporary = `${path}.tmp`;
  writeFileSync(temporary, content);
  renameSync(temporary, path);
};

const main = (): void => {
  if (!existsSync(RETRIEVAL_FILE)) {
    throw new Error(`${RETRIEVAL_FILE} not found: run "pnpm kandidator:download" first.`);
  }
  const retrieval = readJson(RETRIEVAL_FILE, retrievalSchema);

  const files = readdirSync(SCRUTINS_DIR).filter((file) => file.endsWith(".json")).sort();
  const scrutins: Scrutin[] = [];
  const excluded: { number: number; reason: string }[] = [];
  for (const file of files) {
    const raw = readJson(join(SCRUTINS_DIR, file), rawScrutinSchema);
    if (raw.scrutin.legislature !== retrieval.legislature) {
      throw new Error(`${file} belongs to legislature ${raw.scrutin.legislature}`);
    }
    const result = normalizeScrutin(raw);
    if (result.ok) {
      scrutins.push(result.scrutin);
    } else {
      excluded.push({ number: raw.scrutin.numero, reason: result.reason });
    }
  }
  excluded.sort((a, b) => a.number - b.number);

  const groupRefs = [...new Set(scrutins.flatMap((s) => s.groups.map((g) => g.groupRef)))].sort();
  const groups = groupRefs.map((ref) => {
    const path = join(ORGANES_DIR, `${ref}.json`);
    if (!existsSync(path)) {
      throw new Error(`Group ${ref} is used in scrutins but missing from the organes archive.`);
    }
    const group = readJson(path, rawGroupSchema);
    if (group.organe.legislature !== retrieval.legislature) {
      throw new Error(`Group ${ref} belongs to legislature ${group.organe.legislature}`);
    }

    return normalizeGroup(group);
  });

  const options: RankingOptions = {
    excludedGroupRefs: [NON_INSCRITS_REF],
    minKnownGroupsRatio: MIN_KNOWN_GROUPS_RATIO,
    size: SHORTLIST_SIZE,
    required: SHORTLIST_REQUIRED,
  };
  const { shortlist, eligible } = rankScrutins(scrutins, options);
  const input = { retrieval, options, scrutinsRead: files.length, eligible, excluded, groups, shortlist };

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeAtomically(OUTPUT_JSON, `${JSON.stringify(toJson(input), null, 2)}\n`);
  writeAtomically(OUTPUT_MARKDOWN, toMarkdown(input));
  console.log(
    `${files.length} scrutins read, ${excluded.length} excluded, ${eligible} eligible, ${shortlist.length} kept → ${OUTPUT_JSON}`,
  );
};

main();
