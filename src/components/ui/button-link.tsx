import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "./cn";

const VARIANTS = {
  primary: "bg-primary text-primary-ink",
  secondary: "bg-surface text-ink",
} as const;

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: keyof typeof VARIANTS };

/** Chunky call-to-action link with the hard "pop" shadow; it sinks on press. */
export const ButtonLink = ({ variant = "primary", className, ...props }: ButtonLinkProps) => {
  return (
    <Link
      className={cn(
        "inline-flex min-h-14 shrink-0 items-center whitespace-nowrap justify-center gap-2 rounded-full border-2 border-ink px-7 font-display text-lg font-bold shadow-pop transition-transform hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
};
