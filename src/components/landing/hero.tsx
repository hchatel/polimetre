import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import type { LandingView } from "@/server/kandidator/landing-view";
import { ExampleQuestion } from "./example-question";

type HeroProps = Pick<LandingView, "minQuestions" | "maxQuestions" | "example">;

export const Hero = ({ minQuestions, maxQuestions, example }: HeroProps) => {
  return (
    <section className="grid items-center gap-12 py-8 sm:py-14 lg:grid-cols-[1.1fr_1fr]">
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-5xl leading-[1.02] font-extrabold tracking-tight text-balance sm:text-6xl">
          Vos idées, face aux <span className="highlight">votes</span> de l&apos;Assemblée.
        </h1>
        <p className="max-w-prose text-lg leading-relaxed text-muted">
          Répondez à quelques questions tirées de votes réels de l&apos;Assemblée nationale, et voyez de quels groupes
          parlementaires vos réponses sont les plus proches.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <ButtonLink href="/quiz">
            Commencer le test <ArrowRight aria-hidden className="size-5" />
          </ButtonLink>
          <p className="text-center text-sm text-muted sm:text-left">
            De {minQuestions} à {maxQuestions} questions · quelques minutes
          </p>
        </div>
      </div>
      <ExampleQuestion {...example} />
    </section>
  );
};
