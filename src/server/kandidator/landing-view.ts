/**
 * Landing page view model (ROADMAP S6): every figure shown on the home page is derived from the pool,
 * none is written by hand.
 */
import { MAX_QUESTIONS, MIN_QUESTIONS } from "@/domain/kandidator/parameters";
import { dataRetrievedAt, groups, questions, scrutinsFile } from "@/data/kandidator/pool";

/** Real question of the pool shown as a preview on the home page. To be validated by the maintainer. */
export const LANDING_EXAMPLE_QUESTION_ID = "algorithmes-mineurs";

export type LandingView = {
  questionCount: number;
  groupCount: number;
  legislature: number;
  dataRetrievedAt: string;
  minQuestions: number;
  maxQuestions: number;
  topics: string[];
  example: { topic: string; text: string };
};

const frenchOrder = new Intl.Collator("fr");

export const buildLandingView = (): LandingView => {
  const example = questions.find((question) => question.id === LANDING_EXAMPLE_QUESTION_ID);
  if (!example) {
    throw new Error(`Landing example question "${LANDING_EXAMPLE_QUESTION_ID}" is not in the pool`);
  }

  return {
    questionCount: questions.length,
    groupCount: groups.length,
    legislature: scrutinsFile.legislature,
    dataRetrievedAt,
    minQuestions: MIN_QUESTIONS,
    maxQuestions: MAX_QUESTIONS,
    topics: [...new Set(questions.map((question) => question.topic))].sort(frenchOrder.compare),
    example: { topic: example.topic, text: example.text },
  };
};
