import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button-link";
import { Result } from "@/components/kandidator/result/result";
import { questionPool } from "@/data/kandidator/pool";
import { decodeAnswers } from "@/data/kandidator/share-url";
import { buildResultView } from "@/server/kandidator/result-view";

export const metadata: Metadata = { title: "Résultat · Kandidator" };

/** Answers come from the URL only (`r=`): they are decoded, scored and never stored or logged. */
export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const answers = decodeAnswers((await searchParams).r, questionPool);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 sm:py-10">
      {answers ? (
        <Result view={buildResultView(answers)} />
      ) : (
        <div className="flex flex-col gap-6">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Lien de résultat invalide</h1>
          <p className="text-lg text-muted">Ce lien ne correspond à aucune série de réponses connue.</p>
          <ButtonLink href="/quiz" className="sm:self-start">
            Répondre aux questions
          </ButtonLink>
        </div>
      )}
    </main>
  );
}
