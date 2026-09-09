"use client";

import { useState } from "react";
import { useInitialCostForm } from "@/hooks/useInitialCostForm";
import { createCustomItem, createItemFromCategory } from "@/lib/defaultItems";
import { CostInputForm } from "@/components/CostInputForm";
import { EstimateInput } from "@/components/estimate/EstimateInput";
import { CostSummaryBar } from "@/components/CostSummaryBar";
import { CostBreakdown } from "@/components/CostBreakdown";
import { ReviewableItemsCards } from "@/components/ReviewableItemsCards";
import { ComparisonResult } from "@/components/ComparisonResult";
import { MobileStickyCTA } from "@/components/MobileStickyCTA";

type EntryMode = "capture" | "manual";

export function DiagnosisFlow() {
  const [entryMode, setEntryMode] = useState<EntryMode>("capture");
  const { form, diagnosis, setMonthlyRent, updateItemAmount, addItem, removeItem, replaceForm } =
    useInitialCostForm();

  const hasInput = diagnosis.totalCurrent > 0;

  return (
    <section id="diagnosis" className="px-6 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
          {entryMode === "capture" ? (
            <EstimateInput
              onComplete={(nextForm) => {
                replaceForm(nextForm);
                setEntryMode("manual");
              }}
              onManualFallback={() => setEntryMode("manual")}
            />
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEntryMode("capture")}
                className="mb-3 text-xs font-semibold text-teal-700 underline underline-offset-2"
              >
                ← 見積書を撮影して読み取る
              </button>
              <CostInputForm
                form={form}
                onMonthlyRentChange={setMonthlyRent}
                onItemAmountChange={updateItemAmount}
                onAddItem={(categoryId) => addItem(createItemFromCategory(categoryId))}
                onAddCustomItem={(label) => addItem(createCustomItem(label))}
                onRemoveItem={removeItem}
              />
            </>
          )}
        </div>

        {entryMode === "manual" && (
          <div className="mt-4">
            <CostSummaryBar total={diagnosis.totalCurrent} />
          </div>
        )}

        {entryMode === "manual" && hasInput && (
          <div className="mt-6 space-y-6">
            <CostBreakdown items={form.items} />
            <ReviewableItemsCards findings={diagnosis.findings} />
            <ComparisonResult
              totalCurrent={diagnosis.totalCurrent}
              estimatedWithUs={diagnosis.estimatedWithUs}
              difference={diagnosis.difference}
            />
          </div>
        )}
      </div>

      {hasInput && <MobileStickyCTA />}
    </section>
  );
}
