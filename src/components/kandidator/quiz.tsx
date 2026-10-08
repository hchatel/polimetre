"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/components/ui/cn";
import { encodeAnswers } from "@/data/kandidator/share-url";
import { MAX_QUESTIONS } from "@/domain/kandidator/parameters";
import { selectNextQuestion } from "@/domain/kandidator/question-selection";
import { shouldStop } from "@/domain/kandidator/stop-rule";
import type { Answer, AnsweredQuestion, Question, QuestionPool } from "@/domain/kandidator/types";
import { QuizStatus } from "./quiz-status";

export type QuizQuestion = { id: string; topic: string; text: string };

type QuizProps = {
  pool: QuestionPool;
  questions: readonly QuizQuestion[];
};

const CHOICES: { answer: Answer; label: string }[] = [
  { answer: "yes", label: "Oui" },
  { answer: "neutral", label: "Neutre / Je ne sais pas" },
  { answer: "no", label: "Non" },
];

/**
 * Adaptive quiz (ROADMAP S5, METHODOLOGY.md §9). Rendered on the client only:
 * question order is random (Math.random), the score of the answers is not.
 * Answers stay in this component until they are encoded in the result URL.
 */
export const Quiz = ({ pool, questions }: QuizProps) => {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnsweredQuestion[]>([]);
  const [current, setCurrent] = useState<Question | null>(() => selectNextQuestion(pool, [], Math.random));
  const [finished, setFinished] = useState(false);

  if (finished) {
    return <QuizStatus>Calcul du résultat…</QuizStatus>;
  }

  const display = questions.find((question) => question.id === current?.id);
  if (!current || !display) {
    return <QuizStatus>Aucune question disponible.</QuizStatus>;
  }

  const answer = (choice: Answer) => {
    const next = [...answers, { questionId: current.id, answer: choice }];
    const nextQuestion = shouldStop(pool, next) ? null : selectNextQuestion(pool, next, Math.random);
    setAnswers(next);
    if (nextQuestion) {
      setCurrent(nextQuestion);

      return;
    }
    setFinished(true);
    router.push(`/resultat?r=${encodeAnswers(next)}`);
  };

  const back = () => {
    const previous = answers.at(-1);
    const previousQuestion = pool.questions.find((question) => question.id === previous?.questionId);
    if (!previousQuestion) {
      return;
    }
    setAnswers(answers.slice(0, -1));
    setCurrent(previousQuestion);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted">
          Question {answers.length + 1} · {MAX_QUESTIONS} au plus
        </p>
        <div
          role="progressbar"
          aria-label="Progression"
          aria-valuemin={0}
          aria-valuemax={MAX_QUESTIONS}
          aria-valuenow={answers.length}
          className="h-3 overflow-hidden rounded-full border-2 border-ink bg-surface"
        >
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{ width: `${(answers.length / MAX_QUESTIONS) * 100}%` }}
          />
        </div>
      </div>
      <Card key={current.id} className="flex animate-enter flex-col gap-6 p-6 sm:p-8">
        <Chip className="self-start">{display.topic}</Chip>
        <h1 className="font-display text-2xl leading-snug font-bold text-balance sm:text-3xl" aria-live="polite">
          {display.text}
        </h1>
        <div className="flex flex-col gap-3">
          {CHOICES.map(({ answer: choice, label }) => (
            <button
              key={choice}
              type="button"
              onClick={() => answer(choice)}
              className={cn(
                "min-h-14 rounded-full border-2 border-ink px-6 py-3 font-display text-lg font-bold transition-transform hover:-translate-y-0.5 hover:bg-highlight hover:text-on-highlight active:translate-x-1 active:translate-y-1 active:shadow-none",
                choice === "neutral" ? "bg-paper text-muted shadow-pop-sm" : "bg-surface shadow-pop",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </Card>
      <button
        type="button"
        disabled={answers.length === 0}
        onClick={back}
        className="flex items-center gap-1 self-start text-sm font-medium text-muted underline-offset-4 hover:underline disabled:opacity-40 disabled:hover:no-underline"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Question précédente
      </button>
    </div>
  );
};
