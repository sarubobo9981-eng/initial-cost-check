import { EstimateFile } from "@/types/estimateFile";

interface EstimateImagePreviewProps {
  file: EstimateFile;
  index?: number;
  total?: number;
  onRemove?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}

export function EstimateImagePreview({
  file,
  index,
  total,
  onRemove,
  onMoveLeft,
  onMoveRight,
}: EstimateImagePreviewProps) {
  const isPdf = file.sourceType === "pdf";
  const showIndex = typeof index === "number" && !!total;

  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white">
      {showIndex && (
        <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
          見積書 {index! + 1}/{total}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="この見積書を削除"
          className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white"
        >
          ×
        </button>
      )}

      <div className="flex aspect-[3/4] items-center justify-center bg-slate-50">
        {isPdf ? (
          <div className="flex flex-col items-center gap-1 p-2 text-center">
            <span className="text-3xl">📄</span>
            <span className="line-clamp-2 break-all text-[10px] text-slate-500">{file.file.name}</span>
          </div>
        ) : file.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- ローカルのObject URLプレビューのためnext/imageは使用しない
          <img src={file.previewUrl} alt="見積書のプレビュー" className="h-full w-full object-cover" />
        ) : (
          <span className="text-3xl">🖼️</span>
        )}
      </div>

      {(onMoveLeft || onMoveRight) && (
        <div className="flex justify-between border-t border-slate-100 bg-white px-1 py-0.5">
          <button
            type="button"
            onClick={onMoveLeft}
            disabled={!onMoveLeft}
            aria-label="前に移動"
            className="px-1.5 text-xs text-slate-400 disabled:opacity-20"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={onMoveRight}
            disabled={!onMoveRight}
            aria-label="次に移動"
            className="px-1.5 text-xs text-slate-400 disabled:opacity-20"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
