import { CostCategory, ReviewFinding } from "@/types/initialCost";
import { formatYen } from "@/lib/format";

interface ReviewableItemsCardsProps {
  findings: ReviewFinding[];
}

// カード末尾に表示する短い確認アクション文言（UI表示専用。計算根拠はfinding.reasonに集約）
const ACTION_LABEL: Partial<Record<CostCategory, string>> = {
  brokerage_fee: "条件確認",
  support_service: "任意サービスか確認",
  disinfection: "契約条件を確認",
  fire_insurance: "契約条件を確認",
  key_exchange: "契約条件を確認",
};
const DEFAULT_ACTION_LABEL = "契約条件を確認";

export function ReviewableItemsCards({ findings }: ReviewableItemsCardsProps) {
  if (findings.length === 0) return null;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-sm font-bold text-slate-900">今回チェックしたい項目</h3>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-slate-500">
        以下は「見直せる可能性のある項目」です。削減を保証するものではありません。実際の条件はご契約内容をご確認ください。
      </p>
      <div className="space-y-3">
        {findings.map((finding) => (
          <div
            key={finding.itemId}
            className="rounded-xl bg-amber-50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">{finding.itemLabel}</p>
              {finding.confidence === "reviewable" && finding.reviewableAmount > 0 && (
                <span className="flex-none rounded-full bg-amber-200/70 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                  見直しの余地あり
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              現在：<span className="font-semibold tabular-nums">{formatYen(finding.currentAmount)}</span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{finding.reason}</p>
            <p className="mt-2 text-sm font-semibold text-teal-700">
              → {ACTION_LABEL[finding.category] ?? DEFAULT_ACTION_LABEL}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
