import Link from "next/link";
import { SITE_NAME } from "@config/company";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white">
            初
          </span>
          <span className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
            {SITE_NAME}
          </span>
        </Link>
        <a
          href="#diagnosis"
          className="hidden rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 sm:inline-block"
        >
          今すぐチェック
        </a>
      </div>
    </header>
  );
}
