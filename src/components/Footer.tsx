import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 px-4 pt-10 text-slate-300 [padding-bottom:calc(4.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-2 text-sm">
          <Link href="/privacy" className="text-slate-300 hover:text-white">
            プライバシーポリシー
          </Link>
          <Link href="/terms" className="text-slate-300 hover:text-white">
            利用規約
          </Link>
          <a href="#contact" className="text-slate-300 hover:text-white">
            お問い合わせ
          </a>
        </div>
      </div>
    </footer>
  );
}
