import type { Answer } from "@/domain/kandidator/types";
import type { AssociationType } from "@/server/kandidator/result-view";

export const ANSWER_LABELS: Record<Answer, string> = {
  yes: "Oui",
  no: "Non",
  neutral: "Neutre / Je ne sais pas",
};

/** METHODOLOGY.md §6 — association types, in French. */
export const ASSOCIATION_LABELS: Record<AssociationType, string> = {
  "group-member": "membre du groupe",
  "party-forming-group": "membre du parti qui forme le groupe",
  "group-support": "soutien public du groupe",
};

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "UTC" });

/** "2025-11-19" or an ISO date-time → "19 novembre 2025". */
export const formatDate = (isoDate: string): string => {
  return dateFormat.format(new Date(isoDate));
};

/** 0.82 → "82 %" (narrow no-break space, French typography). */
export const formatPercent = (ratio: number): string => {
  return `${Math.round(ratio * 100)} %`;
};
