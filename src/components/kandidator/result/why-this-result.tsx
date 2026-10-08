import { ChevronDown } from "lucide-react";
import { MIN_EXPRESSED } from "@/domain/kandidator/parameters";
import type { QuestionView } from "@/server/kandidator/result-view";
import { ANSWER_LABELS, formatDate, formatPercent } from "./labels";

const COLUMNS = ["Pour", "Contre", "Abstention", "Non-votants", "Absents"] as const;

const agreementLabel = (question: QuestionView, group: QuestionView["groups"][number]): string => {
  if (question.answer === "neutral") {
    return "non comptée";
  }

  return group.agreement === null ? "position inconnue" : formatPercent(group.agreement);
};

/** "Why this result": question → your answer → each group's vote → scrutin source (AGENTS.md rule 5). */
export const WhyThisResult = ({ questions }: { questions: readonly QuestionView[] }) => {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-2xl font-extrabold tracking-tight">Pourquoi ce résultat ?</h2>
      <p className="text-sm leading-relaxed text-muted">
        Pour chaque question : votre réponse, le vote de chaque groupe sur le scrutin correspondant, et l&apos;accord
        entre les deux. Une réponse neutre n&apos;est pas comptée. La position d&apos;un groupe est inconnue quand moins
        de {MIN_EXPRESSED} de ses députés ont voté pour, contre ou se sont abstenus.
      </p>
      {questions.map((question) => (
        <details key={question.questionId} className="group rounded-card border-2 border-ink bg-surface p-4">
          <summary className="flex cursor-pointer list-none items-start gap-3 [&::-webkit-details-marker]:hidden">
            <span className="flex flex-1 flex-col gap-1">
              <span className="font-semibold">{question.text}</span>
              <span className="text-sm text-muted">
                Votre réponse :{" "}
                <span className="font-semibold text-ink">{ANSWER_LABELS[question.answer]}</span>
              </span>
            </span>
            <ChevronDown aria-hidden className="mt-0.5 size-5 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-4 flex flex-col gap-3 border-t-2 border-line pt-4 text-sm">
            <p>
              Scrutin n° {question.scrutin.number} du {formatDate(question.scrutin.date)} :{" "}
              <a
                href={question.scrutin.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-2"
              >
                {question.scrutin.title}
              </a>
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left tabular-nums">
                <thead>
                  <tr className="border-b-2 border-ink">
                    <th className="py-1 pr-3 font-medium">Groupe</th>
                    <th className="py-1 pr-3 font-medium">Accord</th>
                    {COLUMNS.map((column) => (
                      <th key={column} className="py-1 pr-3 font-medium">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {question.groups.map((group) => (
                    <tr key={group.groupId} className="border-b border-line">
                      <th scope="row" className="py-1 pr-3 font-normal" title={group.name}>
                        {group.abbreviation}
                      </th>
                      <td className="py-1 pr-3">{agreementLabel(question, group)}</td>
                      {group.breakdown ? (
                        <>
                          <td className="py-1 pr-3">{group.breakdown.for}</td>
                          <td className="py-1 pr-3">{group.breakdown.against}</td>
                          <td className="py-1 pr-3">{group.breakdown.abstention}</td>
                          <td className="py-1 pr-3">{group.breakdown.nonVoting}</td>
                          <td className="py-1 pr-3">{group.breakdown.absent}</td>
                        </>
                      ) : (
                        <td colSpan={COLUMNS.length} className="py-1 pr-3 text-muted">
                          Pas de décompte pour ce groupe dans ce scrutin
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>
      ))}
    </section>
  );
};
