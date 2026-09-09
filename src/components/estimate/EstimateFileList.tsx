import { EstimateFile } from "@/types/estimateFile";
import { EstimateImagePreview } from "@/components/estimate/EstimateImagePreview";

interface EstimateFileListProps {
  files: EstimateFile[];
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "left" | "right") => void;
  onAddMore: () => void;
}

export function EstimateFileList({ files, onRemove, onMove, onAddMore }: EstimateFileListProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {files.map((file, index) => (
        <EstimateImagePreview
          key={file.id}
          file={file}
          index={index}
          total={files.length}
          onRemove={() => onRemove(file.id)}
          onMoveLeft={index > 0 ? () => onMove(file.id, "left") : undefined}
          onMoveRight={index < files.length - 1 ? () => onMove(file.id, "right") : undefined}
        />
      ))}
      <button
        type="button"
        onClick={onAddMore}
        className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-teal-500 hover:text-teal-600"
      >
        <span className="text-2xl">＋</span>
        <span className="text-[11px] font-semibold">写真を追加</span>
      </button>
    </div>
  );
}
