"use client";

import { forwardRef } from "react";

interface EstimateCameraInputProps {
  onCapture: (files: File[]) => void;
}

/** スマホのカメラをその場で起動して1枚撮影するための隠し入力 */
export const EstimateCameraInput = forwardRef<HTMLInputElement, EstimateCameraInputProps>(
  function EstimateCameraInput({ onCapture }, ref) {
    return (
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) onCapture(Array.from(files));
          e.target.value = "";
        }}
      />
    );
  }
);
