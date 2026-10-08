import type { ComponentProps } from "react";
import { cn } from "./cn";

/** Small topic badge. */
export const Chip = ({ className, ...props }: ComponentProps<"span">) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border-2 border-ink bg-highlight px-3 py-0.5 text-sm font-semibold text-on-highlight",
        className,
      )}
      {...props}
    />
  );
};
