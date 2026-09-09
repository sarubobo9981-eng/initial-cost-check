"use client";

import { useState } from "react";
import { EstimateAnalysisResult } from "@/types/estimateAnalysis";
import { InitialCostForm } from "@/types/initialCost";
import { mapAnalysisResultToForm } from "@/lib/estimate/mapAnalysisToForm";
import { createCustomItem, createItemFromCategory } from "@/lib/defaultItems";
import { CostInputForm } from "@/components/CostInputForm";

interface ExtractedCostEditorProps {
  analysisResult: EstimateAnalysisResult | null;
  /** 未実装・解析失敗時などに表示する案内文 */
  noticeMessage?: string;
  onConfirm: (form: InitialCostForm) => void;
  onBack: () => void;
}

/**
 * 解析結果（またはOCR未実装時の空データ）を、既存の CostInputForm で
 * そのまま確認・修正できるようにするエディタ。
 * 「読み取れていない費用を追加」は CostInputForm の「その他の費用を追加」をそのまま利用する。
 */
export function ExtractedCostEditor({
  analysisResult,
  noticeMessage,
  onConfirm,
  onBack,
}: ExtractedCostEditorProps) {
  const [form, setForm] = useState<InitialCostForm>(() =>
    mapAnalysisResultToForm(analysisResult ?? { items: [] })
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold text-slate-900">読み取り結果を確認してください</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          金額に誤りがあれば修正できます。読み取れていない費用は「その他の費用を追加」から追加してください。
        </p>
      </div>

      {noticeMessage && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
          {noticeMessage}
        </p>
      )}

      <CostInputForm
        form={form}
        onMonthlyRentChange={(value) => setForm((prev) => ({ ...prev, monthlyRent: value }))}
        onItemAmountChange={(id, amount) =>
          setForm((prev) => ({
            ...prev,
            items: prev.items.map((item) => (item.id === id ? { ...item, amount } : item)),
          }))
        }
        onAddItem={(categoryId) =>
          setForm((prev) => ({ ...prev, items: [...prev.items, createItemFromCategory(categoryId)] }))
        }
        onAddCustomItem={(label) =>
          setForm((prev) => ({ ...prev, items: [...prev.items, createCustomItem(label)] }))
        }
        onRemoveItem={(id) =>
          setForm((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== id) }))
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-full border border-slate-300 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          撮り直す
        </button>
        <button
          type="button"
          onClick={() => onConfirm(form)}
          className="flex-[2] rounded-full bg-teal-700 py-3 text-sm font-bold text-white hover:bg-teal-800"
        >
          この内容で初期費用をチェック
        </button>
      </div>
    </div>
  );
}
