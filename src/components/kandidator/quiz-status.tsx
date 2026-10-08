import type { ReactNode } from "react";

/** Status line shown instead of the quiz (loading, computing the result). */
export const QuizStatus = ({ children }: { children: ReactNode }) => {
  return (
    <p role="status" className="flex items-center justify-center gap-3 py-16 font-display text-lg font-bold">
      <span aria-hidden className="size-4 animate-bounce rounded-full border-2 border-ink bg-primary" />
      {children}
    </p>
  );
};
