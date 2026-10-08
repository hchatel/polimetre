import { describe, expect, it } from "vitest";
import type { AnsweredQuestion } from "@/domain/kandidator/types";
import { questionPool, questions } from "./pool";
import { decodeAnswers, encodeAnswers } from "./share-url";

const [first, second, third] = questions.map((question) => question.id);

describe("encodeAnswers / decodeAnswers", () => {
  it("round-trips the answers in order", () => {
    const answers: AnsweredQuestion[] = [
      { questionId: second, answer: "yes" },
      { questionId: first, answer: "neutral" },
      { questionId: third, answer: "no" },
    ];

    expect(encodeAnswers(answers)).toBe(`${second}:o,${first}:0,${third}:n`);
    expect(decodeAnswers(encodeAnswers(answers), questionPool)).toEqual(answers);
  });

  it("round-trips every question of the pool", () => {
    const answers = questions.map((question): AnsweredQuestion => ({ questionId: question.id, answer: "yes" }));

    expect(decodeAnswers(encodeAnswers(answers), questionPool)).toEqual(answers);
  });

  it.each([
    ["missing", undefined],
    ["repeated parameter", [`${first}:o`, `${second}:n`]],
    ["empty", ""],
    ["unknown question", "not-a-question:o"],
    ["bad answer code", `${first}:y`],
    ["missing answer code", first],
    ["duplicate question", `${first}:o,${first}:n`],
    ["trailing comma", `${first}:o,`],
    ["garbage", "garbage"],
  ])("rejects a %s value", (_, raw) => {
    expect(decodeAnswers(raw, questionPool)).toBeNull();
  });

  it("rejects more answers than the pool holds", () => {
    const tooMany = [...questions, questions[0]].map((question) => `${question.id}:o`).join(",");

    expect(decodeAnswers(tooMany, questionPool)).toBeNull();
  });
});
