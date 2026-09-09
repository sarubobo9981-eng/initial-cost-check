import { LINE_URL } from "@config/company";

export function FinalCTA() {
  return (
    <section className="bg-teal-700 px-6 py-16 text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-xl font-bold sm:text-2xl">無料相談してみませんか？</h2>
        <p className="mt-3 text-sm leading-relaxed text-teal-50 sm:text-base">
          同じ物件でも、仲介会社や契約条件によって初期費用の内容が異なる場合があります。
          現在の見積書を確認したうえでご案内します。
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <a
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#06C755] px-8 py-3.5 text-sm font-bold text-white hover:brightness-95"
          >
            LINEで無料相談する
          </a>
          <a
            href="#contact"
            className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-teal-700 hover:bg-teal-50"
          >
            この見積もりについて相談する
          </a>
        </div>
      </div>
    </section>
  );
}
