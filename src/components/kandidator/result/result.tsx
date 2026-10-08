import { Info, RotateCcw } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import type { ResultView } from "@/server/kandidator/result-view";
import { GroupCard } from "./group-card";
import { formatDate } from "./labels";
import { SimilarityBar } from "./similarity-bar";
import { WhyThisResult } from "./why-this-result";

const RestartLink = () => {
  return (
    <ButtonLink href="/quiz" className="sm:self-start">
      <RotateCcw aria-hidden className="size-5" /> Recommencer
    </ButtonLink>
  );
};

/** PRODUCT.md §6 — a similarity with group votes, never a recommendation (EDITORIAL_GUIDELINES.md). */
const Notice = () => {
  return (
    <div className="flex gap-3 rounded-card border-2 border-ink bg-highlight-soft p-4 text-sm leading-relaxed">
      <Info aria-hidden className="mt-0.5 size-5 shrink-0" />
      <p>
        Cette comparaison porte sur les votes des groupes parlementaires à l&apos;Assemblée nationale, pas sur le
        programme ni les votes personnels des candidats. Ce n&apos;est pas une recommandation de vote.
      </p>
    </div>
  );
};

export const Result = ({ view }: { view: ResultView }) => {
  return (
    <div className="flex flex-col gap-10">
      {view.kind === "noYesNoAnswer" ? (
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-3xl leading-tight font-extrabold tracking-tight">
            Aucune comparaison possible
          </h1>
          <p className="text-lg leading-relaxed text-muted">
            Vous avez répondu « Neutre / Je ne sais pas » à toutes les questions : il n&apos;y a pas de réponse à
            comparer avec les votes des groupes.
          </p>
        </div>
      ) : (
        <>
          <section className="flex flex-col gap-5">
            <h1 className="font-display text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">
              Sur ces questions, vos réponses sont les plus proches des votes de ces groupes
            </h1>
            <Notice />
            <ol className="flex flex-col gap-5">
              {view.top.map((group) => (
                <GroupCard key={group.groupId} group={group} />
              ))}
            </ol>
          </section>
          {(view.others.length > 0 || view.notEnoughData.length > 0) && (
            <section className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-extrabold tracking-tight">Autres groupes</h2>
              <ul className="flex flex-col gap-3">
                {view.others.map((group) => (
                  <li key={group.groupId} className="flex flex-col gap-1.5">
                    <div className="flex justify-between gap-4">
                      <span>
                        <span className="font-semibold">{group.rank}.</span> {group.name} ({group.abbreviation})
                        {group.tied && " · ex æquo"}
                      </span>
                      <span className="font-semibold tabular-nums">{group.percent}&#8239;%</span>
                    </div>
                    <SimilarityBar percent={group.percent} className="h-2 border" />
                  </li>
                ))}
                {view.notEnoughData.map((group) => (
                  <li key={group.groupId} className="flex flex-col justify-between gap-x-4 text-muted sm:flex-row">
                    <span>
                      {group.name} ({group.abbreviation})
                    </span>
                    <span>pas assez de questions comparables ({group.compared})</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
      {view.kind === "scored" && <WhyThisResult questions={view.questions} />}
      <RestartLink />
      <p className="text-sm text-muted">
        Votes : données ouvertes de l&apos;Assemblée nationale, récupérées le {formatDate(view.dataRetrievedAt)}.
      </p>
    </div>
  );
};
