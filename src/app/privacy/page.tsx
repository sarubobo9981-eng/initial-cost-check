import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY_NAME, CONTACT_EMAIL, SITE_NAME } from "@config/company";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: `${SITE_NAME}におけるお客様の個人情報の取扱いについて`,
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link href="/" className="text-sm text-teal-700 hover:underline">
        ← トップページに戻る
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">プライバシーポリシー</h1>
      <p className="mt-4 text-xs text-amber-700">
        ※本ページはテンプレートです。公開前に必ず内容を確認・修正し、必要に応じて専門家にご確認ください。
      </p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="font-semibold text-slate-900">1. 基本方針</h2>
          <p className="mt-2">
            {COMPANY_NAME}（以下「当社」といいます）は、本サービス「{SITE_NAME}」（以下「本サービス」）の提供にあたり、
            お客様の個人情報を適切に取り扱うことを重要な責務と考え、以下の方針に基づき個人情報を取り扱います。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900">2. 取得する情報</h2>
          <p className="mt-2">
            本サービスでは、初期費用診断・お問い合わせの際に、お名前、メールアドレス、電話番号、LINE
            ID、物件情報、見積書ファイル、相談内容等をお客様に入力いただく場合があります。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900">3. 利用目的</h2>
          <p className="mt-2">取得した情報は、以下の目的の範囲内で利用します。</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>初期費用診断結果のご案内</li>
            <li>お問い合わせ・ご相談への対応、賃貸仲介に関するご案内</li>
            <li>本サービスの品質向上・不具合対応</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900">4. 見積書解析における外部AIサービスの利用</h2>
          <p className="mt-2">
            本サービスの見積書解析機能では、お客様がアップロード・撮影された見積書の内容を読み取るため、Anthropic社が提供するAPI（Claude）を利用する場合があります。
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              見積書には、物件名・金額のほか、氏名・住所等の情報が記載されている場合があります。解析のために必要な範囲で、これらを含む画像・PDFデータを外部APIへ送信することがあります。
            </li>
            <li>
              解析に使用したファイルは、当サービス側では原則として永続的に保存しません。ただし、外部API事業者側でのデータの取扱い（保持期間・利用目的等）については、当社が完全に制御できるものではなく、各社が公表する規約・プライバシーポリシーに従います。最新の内容は各社の公式情報をご確認ください。
            </li>
            <li>
              見積書のアップロード・撮影は任意です。ご心配な場合は、金額の手入力によるご利用も可能です。
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900">5. 第三者提供</h2>
          <p className="mt-2">
            法令に基づく場合を除き、お客様の同意なく個人情報を第三者に提供することはありません。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900">6. 開示・訂正・削除等のご請求</h2>
          <p className="mt-2">
            お客様ご自身の個人情報の開示・訂正・削除等をご希望の場合は、下記お問い合わせ先までご連絡ください。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-slate-900">7. お問い合わせ窓口</h2>
          <p className="mt-2">
            {COMPANY_NAME}
            <br />
            {CONTACT_EMAIL}
          </p>
        </section>
      </div>
    </main>
  );
}
