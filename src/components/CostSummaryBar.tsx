import { formatYen } from "@/lib/format";

interface CostSummaryBarProps {
  total: number;
}

export function CostSummaryBar({ total }: CostSummaryBarProps) {
  return (
    <div className="rounded-xl bg-slate-900 px-5 py-4 text-white">
      <p className="text-xs text-slate-300">現在の入力合計</p>
      <p className="mt-0.5 text-3xl font-bold tabular-nums sm:text-4xl">{formatYen(total)}</p>
    </div>
  );
}
