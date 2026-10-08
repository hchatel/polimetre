import { cn } from "@/components/ui/cn";

/** Horizontal bar of a similarity percentage. Same colour for every group: no party colour. */
export const SimilarityBar = ({ percent, className }: { percent: number; className?: string }) => {
  return (
    <div aria-hidden className={cn("h-3 overflow-hidden rounded-full border-2 border-ink bg-paper", className)}>
      <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
    </div>
  );
};
