import type { GroupPosition, Question, QuestionPool, Stance } from "./types.ts";

/**
 * METHODOLOGY.md §8.2 — stance of a group on a question.
 *
 * stance = polarity × position, in [-1, +1]. Unknown when the position is unknown.
 */
export const stance = (polarity: Question["polarity"], position: GroupPosition): Stance => {
  if (position.kind === "unknown") {
    return position;
  }

  return { kind: "known", value: polarity * position.value };
};

/** §8.2 — stance of a group on a question of the pool. A position missing from the pool is unknown. */
export const stanceOf = (pool: QuestionPool, question: Question, groupId: string): Stance => {
  const position = pool.positions[question.scrutinId]?.[groupId] ?? { kind: "unknown" };

  return stance(question.polarity, position);
};
