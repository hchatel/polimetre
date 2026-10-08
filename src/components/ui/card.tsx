import type { ComponentProps } from "react";
import { cn } from "./cn";

/** Surface with an ink border and the hard "pop" shadow. */
export const Card = ({ className, ...props }: ComponentProps<"div">) => {
  return <div className={cn("rounded-card border-2 border-ink bg-surface p-5 shadow-pop", className)} {...props} />;
};
