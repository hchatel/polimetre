import { FinalCta } from "@/components/landing/final-cta";
import { Guarantees } from "@/components/landing/guarantees";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { KeyFigures } from "@/components/landing/key-figures";
import { buildLandingView } from "@/server/kandidator/landing-view";

/** Landing page (ROADMAP S6): pitch, short method and sources. The public methodology page is still to come. */
export default function Home() {
  const view = buildLandingView();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-4 pb-16 sm:gap-20">
      <Hero
        minQuestions={view.minQuestions}
        maxQuestions={view.maxQuestions}
        example={view.example}
      />
      <KeyFigures
        questionCount={view.questionCount}
        groupCount={view.groupCount}
        legislature={view.legislature}
        dataRetrievedAt={view.dataRetrievedAt}
      />
      <HowItWorks />
      <Guarantees />
      <FinalCta />
    </main>
  );
}
