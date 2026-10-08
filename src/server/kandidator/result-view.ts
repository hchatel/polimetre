/**
 * Result page view model (ROADMAP S5): the domain score combined with the display data of the pool,
 * so that every score is explainable (question → answer → group vote → scrutin → source URL).
 */
import { agreement, answerValue } from "@/domain/kandidator/agreement";
import { scoreGroups } from "@/domain/kandidator/score";
import { stanceOf } from "@/domain/kandidator/stance";
import type { Answer, AnsweredQuestion, GroupVoteBreakdown } from "@/domain/kandidator/types";
import { candidates, dataRetrievedAt, groups, questionPool, questions, scrutinsFile } from "@/data/kandidator/pool";
import type { Candidate } from "@/data/kandidator/schemas";

/** Ranks up to this value are shown as the main result (PRODUCT.md §6: top 3). */
const TOP_RANK = 3;

type GroupLabel = { groupId: string; abbreviation: string; name: string };

export type AssociationType = Candidate["associations"][number]["type"];

export type CandidateView = {
  id: string;
  name: string;
  associations: { type: AssociationType; sourceUrls: string[]; date: string }[];
};

export type RankedGroupView = GroupLabel & {
  rank: number;
  /** Another group shares this rank. */
  tied: boolean;
  /** Score as a percentage, rounded to the nearest integer (display only). */
  percent: number;
  compared: number;
  candidates: CandidateView[];
};

export type GroupVoteView = GroupLabel & {
  /** Null when the group has no breakdown on this scrutin (e.g. it did not exist yet). */
  breakdown: GroupVoteBreakdown | null;
  /** Agreement with the user's answer in [0, 1]; null for a Neutral answer or an unknown position. */
  agreement: number | null;
};

export type QuestionView = {
  questionId: string;
  topic: string;
  text: string;
  answer: Answer;
  scrutin: { number: number; title: string; date: string; sourceUrl: string };
  groups: GroupVoteView[];
};

export type ResultView = {
  questions: QuestionView[];
  /** Latest retrieval date of the official data files. */
  dataRetrievedAt: string;
} & (
  | { kind: "noYesNoAnswer" }
  | {
      kind: "scored";
      top: RankedGroupView[];
      others: RankedGroupView[];
      notEnoughData: (GroupLabel & { compared: number })[];
    }
);

const groupLabel = (groupId: string): GroupLabel => {
  const group = groups.find((candidate) => candidate.ref === groupId);
  if (!group) {
    throw new Error(`Unknown group: ${groupId}`);
  }

  return { groupId, abbreviation: group.abbreviation, name: group.name };
};

/** METHODOLOGY.md §6 — only candidates with an explicit, sourced association with the group. */
const candidatesOf = (groupId: string): CandidateView[] => {
  return candidates.flatMap((candidate) => {
    const associations = candidate.associations
      .filter((association) => association.groupRef === groupId)
      .map(({ type, sourceUrls, date }) => ({ type, sourceUrls, date }));

    return associations.length === 0 ? [] : [{ id: candidate.id, name: candidate.name, associations }];
  });
};

const questionView = ({ questionId, answer }: AnsweredQuestion): QuestionView => {
  const question = questions.find((candidate) => candidate.id === questionId);
  const domainQuestion = questionPool.questions.find((candidate) => candidate.id === questionId);
  const scrutin = scrutinsFile.scrutins.find((candidate) => candidate.number === question?.scrutinNumber);
  if (!question || !domainQuestion || !scrutin) {
    throw new Error(`Unknown question: ${questionId}`);
  }

  const value = answerValue(answer);

  return {
    questionId,
    topic: question.topic,
    text: question.text,
    answer,
    scrutin: { number: scrutin.number, title: scrutin.title, date: scrutin.date, sourceUrl: scrutin.sourceUrl },
    groups: questionPool.groupIds.map((groupId) => {
      const breakdown = scrutin.groups.find((group) => group.ref === groupId);
      const groupStance = stanceOf(questionPool, domainQuestion, groupId);

      return {
        ...groupLabel(groupId),
        breakdown: breakdown
          ? {
              for: breakdown.for,
              against: breakdown.against,
              abstention: breakdown.abstention,
              nonVoting: breakdown.nonVoting,
              absent: breakdown.absent,
            }
          : null,
        agreement: value === null || groupStance.kind === "unknown" ? null : agreement(value, groupStance.value),
      };
    }),
  };
};

export const buildResultView = (answers: readonly AnsweredQuestion[]): ResultView => {
  const base = {
    questions: answers.map(questionView),
    dataRetrievedAt,
  };
  const result = scoreGroups(questionPool, answers);
  if (result.kind === "noYesNoAnswer") {
    return { ...base, kind: "noYesNoAnswer" };
  }

  const ranked = result.ranked.map(
    (group): RankedGroupView => ({
      ...groupLabel(group.groupId),
      rank: group.rank,
      tied: result.ranked.some((other) => other !== group && other.rank === group.rank),
      percent: Math.round(group.score * 100),
      compared: group.details.length,
      candidates: candidatesOf(group.groupId),
    }),
  );

  return {
    ...base,
    kind: "scored",
    top: ranked.filter((group) => group.rank <= TOP_RANK),
    others: ranked.filter((group) => group.rank > TOP_RANK),
    notEnoughData: result.notEnoughData.map(({ groupId, compared }) => ({ ...groupLabel(groupId), compared })),
  };
};
