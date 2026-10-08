import { formatDate } from "@/components/kandidator/result/labels";
import type { LandingView } from "@/server/kandidator/landing-view";

type KeyFiguresProps = Pick<LandingView, "questionCount" | "groupCount" | "legislature" | "dataRetrievedAt">;

export const KeyFigures = ({ questionCount, groupCount, legislature, dataRetrievedAt }: KeyFiguresProps) => {
  const figures = [
    { value: String(questionCount), label: "questions, chacune liée à un scrutin" },
    { value: String(groupCount), label: "groupes parlementaires comparés" },
    { value: `${legislature}ᵉ`, label: "législature : les votes du mandat en cours" },
  ];

  return (
    <section aria-label="Chiffres clés" className="flex flex-col gap-3">
      <ul className="grid gap-3 sm:grid-cols-3">
        {figures.map(({ value, label }) => (
          <li
            key={label}
            className="flex items-baseline gap-3 rounded-card border-2 border-ink bg-surface p-4 sm:flex-col sm:gap-1"
          >
            <span className="font-display text-4xl font-extrabold text-primary tabular-nums">{value}</span>
            <span className="text-muted">{label}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">
        Données ouvertes de l&apos;Assemblée nationale, récupérées le {formatDate(dataRetrievedAt)}.
      </p>
    </section>
  );
};
