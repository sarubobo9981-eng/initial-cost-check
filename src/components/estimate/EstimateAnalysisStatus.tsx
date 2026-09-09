import { AnalysisStepState, AnalysisStepStatus } from "@/types/estimateAnalysis";

interface EstimateAnalysisStatusProps {
  steps: AnalysisStepState[];
  /** 準備中(未実装)や解析失敗時に表示するメッセージ */
  noticeMessage?: string;
  /** 失敗時に表示するアクション（再試行・手入力へ切り替え等） */
  actions?: React.ReactNode;
}

function StatusIcon({ status }: { status: AnalysisStepStatus }) {
  if (status === "done") {
    return (
      <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-teal-600 text-[10px] text-white">
        ✓
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="h-5 w-5 flex-none animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
    );
  }
  if (status === "error") {
    return (
      <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">
        !
      </span>
    );
  }
  return <span className="h-5 w-5 flex-none rounded-full border-2 border-slate-200" />;
}

export function EstimateAnalysisStatus({ steps, noticeMessage, actions }: EstimateAnalysisStatusProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
      <p className="mb-5 text-base font-bold text-slate-900">見積書を読み取っています…</p>
      <ul className="mx-auto max-w-xs space-y-3 text-left">
        {steps.map((step) => (
          <li key={step.id} className="flex items-center gap-3 text-sm">
            <StatusIcon status={step.status} />
            <span className={step.status === "pending" ? "text-slate-400" : "text-slate-800"}>
              {step.label}
            </span>
          </li>
        ))}
      </ul>

      {noticeMessage && (
        <p className="mx-auto mt-5 max-w-xs rounded-lg bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
          {noticeMessage}
        </p>
      )}

      {actions && <div className="mt-4 flex flex-col gap-2">{actions}</div>}
    </div>
  );
}
