import { Crop as CropIcon, Settings, Loader2 } from "lucide-react";
import type { MobileFloatingButtonsProps } from "@/types";

export function MobileFloatingButtons({
  canGenerate,
  isProcessing,
  onGenerate,
  onOpenSettings,
}: MobileFloatingButtonsProps) {
  return (
    <div className="lg:hidden fixed bottom-6 right-6 flex flex-col gap-3 z-30">
      <button
        onClick={onGenerate}
        disabled={!canGenerate || isProcessing}
        className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <CropIcon className="w-6 h-6" />
        )}
      </button>

      <button
        onClick={onOpenSettings}
        className="w-14 h-14 bg-[#3b82f6] hover:bg-[#2563eb] text-white flex items-center justify-center transition-colors"
      >
        <Settings className="w-6 h-6" />
      </button>
    </div>
  );
}
