import { Card } from "@/components/ui/card";
import type { RankedGroupView } from "@/server/kandidator/result-view";
import { ASSOCIATION_LABELS, formatDate } from "./labels";
import { SimilarityBar } from "./similarity-bar";

/** One of the top groups, with its sourced candidate associations (METHODOLOGY.md §6). */
export const GroupCard = ({ group }: { group: RankedGroupView }) => {
  return (
    <li>
      <Card className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-highlight font-display text-xl font-extrabold text-on-highlight">
            {group.rank}
          </span>
          <h3 className="flex-1 font-display text-lg leading-snug font-bold">
            {group.name} <span className="font-normal text-muted">({group.abbreviation})</span>
          </h3>
          <p className="shrink-0 font-display text-3xl font-extrabold text-primary tabular-nums">
            {group.percent}&#8239;%
          </p>
        </div>
        <SimilarityBar percent={group.percent} />
        <p className="text-sm text-muted">
          {group.tied && "Ex æquo · "}
          Comparé sur {group.compared} question{group.compared > 1 ? "s" : ""}
        </p>
        <div className="border-t-2 border-line pt-3 text-sm">
          <p className="font-semibold">Candidat(s) déclaré(s) associé(s) à ce groupe :</p>
          {group.candidates.length === 0 ? (
            <p className="text-muted">Aucun candidat déclaré n&apos;est associé à ce groupe.</p>
          ) : (
            <ul className="mt-1 flex flex-col gap-1">
              {group.candidates.map((candidate) => (
                <li key={candidate.id}>
                  {candidate.name}
                  {candidate.associations.map((association) => (
                    <span key={association.type} className="text-muted">
                      {" "}
                      · {ASSOCIATION_LABELS[association.type]} (
                      {association.sourceUrls.map((url, index) => (
                        <span key={url}>
                          {index > 0 && ", "}
                          <a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                            source{association.sourceUrls.length > 1 ? ` ${index + 1}` : ""}
                          </a>
                        </span>
                      ))}
                      , vérifié le {formatDate(association.date)})
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </li>
  );
};
