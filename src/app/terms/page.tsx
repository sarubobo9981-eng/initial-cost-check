import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY_NAME, SITE_NAME } from "@config/company";

export const metadata: Metadata = {
  title: "利用規約",
  description: `${SITE_NAME}のご利用にあたっての規約`,
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link href="/" className="text-sm text-teal-700 hover:underline">
        ← トップページに戻る
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">利用規約</h1>
      <p className="mt-4 text-xs text-amber-700">
        ※本ページはテンプレートです。公開前に必ず内容を確認・修正し、必要に応じて専門家にご確認ください。
      </p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="font-semibold text-slate-900">第1条（本規約の適用）</h2>
          <p className="mt-2">
            本規約は、{COMPANY_NAME}（以下「当社」）が提供する「{SITE_NAME}」（以下「本サービス」）の
            利用条件を定めるものです。ご利用者は本規約に同意のうえ、本サービスをご利用ください。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900">第2条（サービス内容）</h2>
          <p className="mt-2">
            本サービスは、ご利用者が入力した初期費用の情報をもとに、費用の内訳整理および見直せる可能性のある項目の確認を支援する情報提供サービスです。
            表示される概算金額・見直せる可能性のある金額は目安であり、実際の契約条件・金額を保証するものではありません。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900">第3条（禁止事項）</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>虚偽の情報を入力する行為</li>
            <li>本サービスの運営を妨げる行為</li>
            <li>法令または公序良俗に反する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900">第4条（免責事項）</h2>
          <p className="mt-2">
            当社は、本サービスにより提供される診断結果・概算金額の正確性、完全性を保証するものではありません。
            実際の初期費用は物件および契約条件により異なります。本サービスの利用により生じた損害について、当社は責任を負わないものとします。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900">第5条（規約の変更）</h2>
          <p className="mt-2">当社は、必要と判断した場合、ご利用者への事前の通知なく本規約を変更できるものとします。</p>
        </section>
      </div>
    </main>
  );
}
