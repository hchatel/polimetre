/**
 * Generates the scrutin and group files of the Kandidator question pool (ROADMAP S4)
 * from the committed shortlist and the maintainer's questions.
 * Usage: pnpm kandidator:pool
 *
 * Any file that does not match the expected format stops the run: previous files are left untouched.
 */
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import type { z } from "zod";
import { questionsSchema } from "../../src/data/kandidator/schemas.ts";
import { OUTPUT_JSON, POOL_EXCLUDED_GROUP_REFS, POOL_GROUPS, POOL_QUESTIONS, POOL_SCRUTINS } from "./config.ts";
import { buildPoolFiles } from "./pool-build.ts";
import { shortlistFileSchema } from "./schemas.ts";

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
  const shortlist = readJson(OUTPUT_JSON, shortlistFileSchema);
  const questions = readJson(POOL_QUESTIONS, questionsSchema);

  const { groups, scrutins } = buildPoolFiles(
    shortlist,
    questions.map((question) => question.scrutinNumber),
    POOL_EXCLUDED_GROUP_REFS,
  );

  writeAtomically(POOL_SCRUTINS, `${JSON.stringify(scrutins, null, 2)}\n`);
  writeAtomically(POOL_GROUPS, `${JSON.stringify(groups, null, 2)}\n`);
  console.log(`${questions.length} questions, ${scrutins.scrutins.length} scrutins, ${groups.length} groups → ${POOL_SCRUTINS}, ${POOL_GROUPS}`);
};

main();
