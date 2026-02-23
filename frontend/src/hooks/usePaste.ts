import { useEffect, useCallback } from "react";

interface UsePasteOptions {
  onFilePaste: (file: File) => void;
}

export function usePaste({ onFilePaste }: UsePasteOptions) {
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            onFilePaste(file);
            return;
          }
        }
      }
    },
    [onFilePaste],
  );

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);
}
