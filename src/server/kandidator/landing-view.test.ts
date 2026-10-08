import { describe, expect, it } from "vitest";
import { groups, questions } from "@/data/kandidator/pool";
import { buildLandingView, LANDING_EXAMPLE_QUESTION_ID } from "./landing-view";

describe("buildLandingView", () => {
  const view = buildLandingView();

  it("counts come from the pool", () => {
    expect(view.questionCount).toBe(questions.length);
    expect(view.groupCount).toBe(groups.length);
  });

  it("lists every topic of the pool once, in French alphabetical order", () => {
    expect(new Set(view.topics)).toEqual(new Set(questions.map((question) => question.topic)));
    expect(view.topics).toHaveLength(new Set(view.topics).size);
    expect(view.topics).toEqual([...view.topics].sort(new Intl.Collator("fr").compare));
  });

  it("the example is a real question of the pool, shown verbatim", () => {
    const question = questions.find((candidate) => candidate.id === LANDING_EXAMPLE_QUESTION_ID);

    expect(view.example).toEqual({ topic: question?.topic, text: question?.text });
  });
});
