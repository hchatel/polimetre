import { ListChecks, MessageCircleQuestion, Scale } from "lucide-react";

const STEPS = [
  {
    icon: MessageCircleQuestion,
    title: "Répondez",
    text: "Oui, Non, ou Neutre si vous ne savez pas. Chaque question reprend le contenu d'un vote de l'Assemblée.",
  },
  {
    icon: Scale,
    title: "Comparez",
    text: "Vos réponses sont comparées aux votes réels de chaque groupe parlementaire sur ces mêmes textes.",
  },
  {
    icon: ListChecks,
    title: "Vérifiez",
    text: "Pour chaque question : votre réponse, le vote de chaque groupe et le lien vers le scrutin officiel.",
  },
] as const;

export const HowItWorks = () => {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-display text-3xl font-extrabold tracking-tight">Comment ça marche</h2>
      <ol className="grid gap-4 sm:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, text }, index) => (
          <li key={title} className="flex flex-col gap-3 rounded-card border-2 border-ink bg-surface p-5 shadow-pop">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full border-2 border-ink bg-highlight font-display text-lg font-extrabold text-on-highlight">
                {index + 1}
              </span>
              <Icon aria-hidden className="size-6 text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold">{title}</h3>
            <p className="leading-relaxed text-muted">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
};
