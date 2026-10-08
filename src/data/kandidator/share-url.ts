/**
 * Answers encoded in the result URL (ROADMAP S5): `r=<questionId>:<o|n|0>,…` in answer order.
 * The URL is external input: it is validated with Zod before reaching the domain.
 * No import of the pool files here: the quiz encodes answers client-side.
 */
import { z } from "zod";
import type { Answer, AnsweredQuestion, QuestionPool } from "@/domain/kandidator/types";

const CODES = { yes: "o", no: "n", neutral: "0" } as const satisfies Record<Answer, string>;

const ANSWERS_BY_CODE: Record<string, Answer> = { o: "yes", n: "no", "0": "neutral" };

const MAX_LENGTH = 2000;

const answersSchema = (pool: QuestionPool) => {
  const questionIds = new Set(pool.questions.map((question) => question.id));
  const entrySchema = z
    .string()
    .regex(/^[a-z0-9-]+:[on0]$/)
    .transform((entry): AnsweredQuestion => {
      const [questionId, code] = entry.split(":");

      return { questionId, answer: ANSWERS_BY_CODE[code] };
    })
    .refine(({ questionId }) => questionIds.has(questionId));

  return z
    .string()
    .max(MAX_LENGTH)
    .transform((raw) => raw.split(","))
    .pipe(z.array(entrySchema).min(1).max(pool.questions.length))
    .refine((answers) => new Set(answers.map(({ questionId }) => questionId)).size === answers.length);
};

export const encodeAnswers = (answers: readonly AnsweredQuestion[]): string => {
  return answers.map(({ questionId, answer }) => `${questionId}:${CODES[answer]}`).join(",");
};

/** The answers of a result URL, or null when the link is invalid (unknown question, duplicate, bad code…). */
export const decodeAnswers = (raw: unknown, pool: QuestionPool): AnsweredQuestion[] | null => {
  const parsed = answersSchema(pool).safeParse(raw);

  return parsed.success ? parsed.data : null;
};
