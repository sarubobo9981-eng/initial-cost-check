import Link from "next/link";
import {
  SITE_NAME,
  COMPANY_NAME,
  ADDRESS,
  PHONE,
  LICENSE_NUMBER,
  INDUSTRY_ASSOCIATION,
} from "@config/company";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 px-4 pb-24 pt-10 text-slate-300 sm:px-6 sm:pb-10">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-sm font-bold text-white">{SITE_NAME}</p>
            <dl className="mt-3 space-y-1.5 text-xs leading-relaxed text-slate-400">
              <div className="flex gap-2">
                <dt className="flex-none">運営会社</dt>
                <dd>{COMPANY_NAME}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="flex-none">所在地</dt>
                <dd>{ADDRESS}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="flex-none">電話番号</dt>
                <dd>{PHONE}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="flex-none">宅地建物取引業免許番号</dt>
                <dd>{LICENSE_NUMBER}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="flex-none">所属団体</dt>
                <dd>{INDUSTRY_ASSOCIATION}</dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-col gap-2 text-sm sm:items-end">
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
        <p className="mt-8 text-[11px] text-slate-500">
          © {new Date().getFullYear()} {COMPANY_NAME}
        </p>
      </div>
    </footer>
  );
}
