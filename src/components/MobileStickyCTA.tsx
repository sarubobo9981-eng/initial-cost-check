import { LINE_URL } from "@config/company";

/** 診断結果が出た後にのみ表示する、LINE相談を主役にした固定バー */
export function MobileStickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur sm:hidden">
      <a
        href={LINE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-full bg-[#06C755] py-3 text-center text-sm font-bold text-white"
      >
        LINEで無料相談する
      </a>
      <a
        href="#contact"
        className="mt-1.5 block text-center text-xs font-semibold text-slate-500 underline underline-offset-2"
      >
        フォームで相談する
      </a>
    </div>
  );
}
