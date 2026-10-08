import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import type { LandingView } from "@/server/kandidator/landing-view";

const PREVIEW_CHOICES = ["Oui", "Neutre", "Non"] as const;

/** Visual preview of a quiz screen with a real question of the pool. The whole card links to the quiz. */
export const ExampleQuestion = ({ topic, text }: LandingView["example"]) => {
  return (
    <Link
      href="/quiz"
      aria-label={`Exemple de question : ${text} Commencer le test`}
      className="group mx-auto w-full max-w-md rotate-1 transition-transform hover:rotate-0"
    >
      <Card className="flex flex-col gap-5 p-6 shadow-pop-primary">
        <div className="flex items-center justify-between gap-3">
          <Chip>{topic}</Chip>
          <span className="text-xs font-semibold tracking-wide text-muted uppercase">Exemple</span>
        </div>
        <p className="font-display text-2xl leading-snug font-bold">{text}</p>
        <div aria-hidden className="grid grid-cols-3 gap-2">
          {PREVIEW_CHOICES.map((label) => (
            <span
              key={label}
              className="rounded-full border-2 border-ink bg-paper py-2 text-center font-semibold shadow-pop-sm transition-colors group-hover:bg-surface"
            >
              {label}
            </span>
          ))}
        </div>
      </Card>
    </Link>
  );
};
