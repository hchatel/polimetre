import type { Metadata } from "next";
import { QuizLoader } from "@/components/kandidator/quiz-loader";
import { questionPool, questions } from "@/data/kandidator/pool";

export const metadata: Metadata = { title: "Questions · Kandidator" };

export default function QuizPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-6 sm:justify-center sm:py-10">
      <QuizLoader
        pool={questionPool}
        questions={questions.map(({ id, topic, text }) => ({ id, topic, text }))}
      />
    </main>
  );
}
