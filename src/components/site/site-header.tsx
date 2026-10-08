import Link from "next/link";
import { PRODUCT_NAME } from "./brand";

export const SiteHeader = () => {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center px-4 py-4">
      <Link href="/" className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
        <span aria-hidden className="size-4 rounded-full border-2 border-ink bg-primary" />
        {PRODUCT_NAME}
      </Link>
    </header>
  );
};
