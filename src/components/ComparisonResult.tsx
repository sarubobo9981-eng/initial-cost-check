import { formatYen } from "@/lib/format";
import { LINE_URL } from "@config/company";

interface ComparisonResultProps {
  totalCurrent: number;
  estimatedWithUs: number;
  difference: number;
}

export function ComparisonResult({ totalCurrent, estimatedWithUs, difference }: ComparisonResultProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm shadow-slate-900/5">
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">現在の見積り合計</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">
            {formatYen(totalCurrent)}
          </p>
        </div>
        <div className="rounded-xl bg-teal-50 p-4">
          <p className="text-xs text-teal-700">当社で契約した場合の概算</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-teal-800 sm:text-2xl">
            {formatYen(estimatedWithUs)}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-teal-700 p-5 text-center text-white">
        <p className="text-xs text-teal-100">見直せる可能性のある差額（目安）</p>
        <p className="mt-1 text-3xl font-extrabold tabular-nums sm:text-4xl">{formatYen(difference)}</p>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        ※上記は入力内容をもとに算出した概算であり、実際の金額を保証するものではありません。
        削減を保証するものでもありません。物件・契約条件によって内容は異なりますので、詳細はご相談ください。
      </p>

      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
        <a
          href={LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full bg-[#06C755] px-5 py-3 text-center text-sm font-bold text-white hover:brightness-95"
        >
          LINEで無料相談する
        </a>
        <a
          href="#contact"
          className="flex-1 rounded-full border border-teal-700 px-5 py-3 text-center text-sm font-bold text-teal-700 hover:bg-teal-50"
        >
          この見積もりについて相談する
        </a>
      </div>
    </div>
  );
}
