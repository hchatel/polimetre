import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Joins class names; later Tailwind classes override earlier conflicting ones. */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};
