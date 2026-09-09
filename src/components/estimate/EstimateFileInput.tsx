"use client";

import { forwardRef } from "react";

interface EstimateFileInputProps {
  accept: string;
  multiple?: boolean;
  onSelect: (files: File[]) => void;
}

/** 写真ライブラリ選択・PDF選択で共用する隠し入力 */
export const EstimateFileInput = forwardRef<HTMLInputElement, EstimateFileInputProps>(
  function EstimateFileInput({ accept, multiple, onSelect }, ref) {
    return (
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) onSelect(Array.from(files));
          e.target.value = "";
        }}
      />
    );
  }
);
