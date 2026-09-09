"use client";

import { useState } from "react";
import { CostCategory, InitialCostForm, InitialCostItem } from "@/types/initialCost";
import { OPTIONAL_CATEGORIES } from "@/lib/costCategories";
import { YenInput } from "@/components/YenInput";
import { LOW_CONFIDENCE_THRESHOLD } from "@/types/estimateAnalysis";

/** AI解析結果のうち確信度が低い項目に「要確認」を表示する */
function ReviewHint({ item }: { item: InitialCostItem }) {
  if (item.confidence === undefined || item.confidence > LOW_CONFIDENCE_THRESHOLD) return null;
  return (
    <p className="mt-1 text-xs text-amber-700">
      要確認：AIの読み取り精度が低い項目です。
      {item.originalText && <>読み取った文字「{item.originalText}」</>}
      金額をご確認ください。
    </p>
  );
}

function ReviewBadge({ item }: { item: InitialCostItem }) {
  if (item.confidence === undefined || item.confidence > LOW_CONFIDENCE_THRESHOLD) return null;
  return (
    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
      要確認
    </span>
  );
}

interface CostInputFormProps {
  form: InitialCostForm;
  onMonthlyRentChange: (value: number) => void;
  onItemAmountChange: (id: string, amount: number) => void;
  onAddItem: (categoryId: CostCategory) => void;
  onAddCustomItem: (label: string) => void;
  onRemoveItem: (id: string) => void;
}

export function CostInputForm({
  form,
  onMonthlyRentChange,
  onItemAmountChange,
  onAddItem,
  onAddCustomItem,
  onRemoveItem,
}: CostInputFormProps) {
  const [customLabel, setCustomLabel] = useState("");

  const primaryItems = form.items.filter((item) => !item.isCustom);
  const customItems = form.items.filter((item) => item.isCustom);
  const usedCategories = new Set(form.items.map((item) => item.category));
  const addableCategories = OPTIONAL_CATEGORIES.filter((cat) => !usedCategories.has(cat.id));

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="monthlyRent" className="mb-1.5 block text-sm font-semibold text-slate-800">
          月額家賃
          <span className="ml-1 font-normal text-slate-400">（仲介手数料の上限判定に使用します）</span>
        </label>
        <YenInput
          id="monthlyRent"
          value={form.monthlyRent}
          onChange={onMonthlyRentChange}
          ariaLabel="月額家賃"
        />
      </div>

      <div className="space-y-3">
        {primaryItems.map((item) => (
          <div key={item.id}>
            <label htmlFor={item.id} className="mb-1.5 block text-sm font-semibold text-slate-800">
              {item.label}
              <ReviewBadge item={item} />
            </label>
            <YenInput
              id={item.id}
              value={item.amount}
              onChange={(value) => onItemAmountChange(item.id, value)}
              ariaLabel={item.label}
            />
            <ReviewHint item={item} />
          </div>
        ))}
      </div>

      {customItems.length > 0 && (
        <div className="space-y-3 border-t border-dashed border-slate-200 pt-3">
          {customItems.map((item) => (
            <div key={item.id} className="flex items-end gap-2">
              <div className="flex-1">
                <p className="mb-1.5 text-sm font-semibold text-slate-800">
                  {item.label}
                  <ReviewBadge item={item} />
                </p>
                <YenInput
                  value={item.amount}
                  onChange={(value) => onItemAmountChange(item.id, value)}
                  ariaLabel={item.label}
                />
                <ReviewHint item={item} />
              </div>
              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                aria-label={`${item.label}を削除`}
                className="mb-0.5 h-11 w-11 flex-none rounded-lg border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <details className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-teal-700 marker:content-none">
          ＋ その他の費用を追加
        </summary>
        <div className="mt-3 space-y-3">
          {addableCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {addableCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onAddItem(cat.id)}
                  className="rounded-full border border-teal-600 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                >
                  + {cat.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="項目名を入力（例：室内消臭施工費）"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            />
            <button
              type="button"
              onClick={() => {
                if (!customLabel.trim()) return;
                onAddCustomItem(customLabel);
                setCustomLabel("");
              }}
              className="flex-none rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              追加
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}
