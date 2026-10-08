"use client";

import dynamic from "next/dynamic";
import { QuizStatus } from "./quiz-status";

/** The quiz draws its first question at random: render it on the client only, so that it never mismatches the HTML. */
export const QuizLoader = dynamic(() => import("./quiz").then((module) => module.Quiz), {
  ssr: false,
  loading: () => <QuizStatus>Chargement des questions…</QuizStatus>,
});
