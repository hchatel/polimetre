/**
 * Kandidator question pool (ROADMAP S4): validated with Zod, then exposed as the domain QuestionPool
 * plus the display metadata needed by the UI (question text, scrutin source, group names, candidates).
 */
import { groupPosition } from "@/domain/kandidator/group-position";
import type { GroupPosition, QuestionPool } from "@/domain/kandidator/types";
import candidatesJson from "./candidates.json";
import groupsJson from "./groups.json";
import questionsJson from "./questions.json";
import scrutinsJson from "./scrutins.json";
import { candidatesSchema, groupsSchema, questionsSchema, scrutinsFileSchema } from "./schemas";

export const questions = questionsSchema.parse(questionsJson);
export const groups = groupsSchema.parse(groupsJson);
export const scrutinsFile = scrutinsFileSchema.parse(scrutinsJson);
// TODO(D8): declared candidates and their sourced group associations, provided by the maintainer.
export const candidates = candidatesSchema.parse(candidatesJson);

const positionsOf = (scrutin: (typeof scrutinsFile.scrutins)[number]): Record<string, GroupPosition> => {
  return Object.fromEntries(scrutin.groups.map(({ ref, ...breakdown }) => [ref, groupPosition(breakdown)]));
};

/** The scrutin id of a question in the domain pool is its number, as a string. */
export const questionPool: QuestionPool = {
  groupIds: groups.map((group) => group.ref),
  questions: questions.map((question) => ({
    id: question.id,
    scrutinId: String(question.scrutinNumber),
    polarity: question.polarity,
  })),
  positions: Object.fromEntries(scrutinsFile.scrutins.map((scrutin) => [String(scrutin.number), positionsOf(scrutin)])),
};
