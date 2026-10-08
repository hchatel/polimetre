/**
 * Downloads the official archives into the git-ignored cache (ROADMAP S2).
 * Usage: pnpm kandidator:download
 *
 * Fails safely: everything is downloaded and extracted into a temporary folder first,
 * and the previous cache is only replaced once every source succeeded.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CACHE_DIR, LEGISLATURE, SOURCES, type SourceId } from "./config.ts";
import type { Retrieval } from "./schemas.ts";

const ZIP_SIGNATURE = "PK";

const download = async (id: SourceId, workDir: string): Promise<Retrieval["sources"][number]> => {
  const { url, members } = SOURCES[id];
  console.log(`Downloading ${id}: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} answered HTTP ${response.status}`);
  }
  const archive = Buffer.from(await response.arrayBuffer());
  // The portal sometimes answers an HTML error page with a 200 status.
  if (archive.subarray(0, 2).toString("latin1") !== ZIP_SIGNATURE) {
    throw new Error(`${url} did not return a zip archive`);
  }

  const zipPath = join(workDir, `${id}.zip`);
  writeFileSync(zipPath, archive);
  try {
    execFileSync("unzip", ["-q", "-o", zipPath, ...members, "-d", join(workDir, id)]);
  } catch (error) {
    throw new Error(`Could not extract ${zipPath} (is the "unzip" command installed?)`, { cause: error });
  }
  rmSync(zipPath);

  return {
    id,
    url,
    retrievedAt: new Date().toISOString(),
    sha256: createHash("sha256").update(archive).digest("hex"),
  };
};

const main = async (): Promise<void> => {
  mkdirSync(join(CACHE_DIR, ".."), { recursive: true });
  const workDir = mkdtempSync(`${CACHE_DIR}.tmp-`);
  try {
    const sources = [];
    for (const id of Object.keys(SOURCES) as SourceId[]) {
      sources.push(await download(id, workDir));
    }
    const retrieval: Retrieval = { legislature: LEGISLATURE, sources };
    writeFileSync(join(workDir, "retrieval.json"), `${JSON.stringify(retrieval, null, 2)}\n`);

    rmSync(CACHE_DIR, { recursive: true, force: true });
    renameSync(workDir, CACHE_DIR);
    console.log(`Done: ${CACHE_DIR}`);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
};

await main();
