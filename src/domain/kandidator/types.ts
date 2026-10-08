/**
 * Votes of one parliamentary group on one scrutin.
 * The categories are kept distinct (METHODOLOGY.md §4–5): they are never merged.
 */
export type GroupVoteBreakdown = {
  for: number;
  against: number;
  abstention: number;
  /** Present but recorded as not voting (e.g. presiding officer). */
  nonVoting: number;
  /** Not listed in the scrutin; derived from the group size at the vote date. */
  absent: number;
};

/** Position of a group on a scrutin, in [-1, +1], or unknown when too few members expressed one. */
export type GroupPosition =
  | { kind: "known"; value: number }
  | { kind: "unknown" };

/** Stance of a group on a question (§8.2), in [-1, +1], or unknown. Same shape as a position. */
export type Stance = GroupPosition;

/**
 * §7 — a question references exactly one scrutin.
 * polarity +1: "Yes" agrees with a vote for the scrutin; -1: "Yes" agrees with a vote against it.
 */
export type Question = {
  id: string;
  scrutinId: string;
  polarity: 1 | -1;
};

/** Everything the scoring needs: the groups, the questions and every group position by scrutin then group id. */
export type QuestionPool = {
  groupIds: readonly string[];
  questions: readonly Question[];
  /** A missing entry means the position is unknown. */
  positions: Readonly<Record<string, Readonly<Record<string, GroupPosition>>>>;
};

export type Answer = "yes" | "neutral" | "no";

/** One answer of the session, in the order questions were asked. */
export type AnsweredQuestion = {
  questionId: string;
  answer: Answer;
};

/** Returns a number in [0, 1), like Math.random. Injected so that tests are reproducible. */
export type RandomSource = () => number;
