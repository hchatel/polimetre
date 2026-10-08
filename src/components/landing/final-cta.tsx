import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

export const FinalCta = () => {
  return (
    <section className="flex flex-col items-center gap-5 rounded-card border-2 border-ink bg-primary px-6 py-10 text-center text-primary-ink shadow-pop">
      <h2 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
        Et vous, de quels votes êtes-vous le plus proche ?
      </h2>
      <ButtonLink href="/quiz" variant="secondary" className="w-full sm:w-auto">
        Lancer le test <ArrowRight aria-hidden className="size-5" />
      </ButtonLink>
    </section>
  );
};
