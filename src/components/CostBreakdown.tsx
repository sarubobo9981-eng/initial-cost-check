import { InitialCostItem } from "@/types/initialCost";
import { formatYen } from "@/lib/format";

interface CostBreakdownProps {
  items: InitialCostItem[];
}

export function CostBreakdown({ items }: CostBreakdownProps) {
  const visibleItems = items.filter((item) => item.amount > 0);

  if (visibleItems.length === 0) return null;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm shadow-slate-900/5">
      <p className="mb-3 text-sm font-semibold text-slate-800">費用の内訳</p>
      <ul className="divide-y divide-slate-100">
        {visibleItems.map((item) => (
          <li key={item.id} className="flex items-center justify-between py-2 text-sm">
            <span className="text-slate-600">{item.label}</span>
            <span className="font-semibold tabular-nums text-slate-900">{formatYen(item.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
