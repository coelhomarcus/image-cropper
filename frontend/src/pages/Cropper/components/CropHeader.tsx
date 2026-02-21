import { Crop as CropIcon, ChevronLeft, Menu } from "lucide-react";
import { formatFileSize } from "@/utils/gifProcessor";
import type { CropHeaderProps } from "@/types";

export function CropHeader({
  isGif,
  fileType,
  imageWidth,
  imageHeight,
  originalSize,
  onMenuClick,
  onBack,
}: CropHeaderProps) {
  return (
    <header className="bg-[#0a0a0a] border-b border-[#262626] px-3 md:px-4 py-2 md:py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-[#888888] hover:text-[#ededed] hover:bg-[#141414] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <CropIcon className="w-5 h-5 md:w-6 md:h-6 text-[#3b82f6]" />
          <span className="text-base md:text-lg font-semibold text-[#ededed] hidden sm:inline">
            Recortar Imagem
          </span>
        </div>

        <div className="hidden md:block h-6 w-px bg-[#262626]" />

        <div className="hidden md:flex items-center gap-2">
          <span
            className={`px-2 py-1 text-xs font-medium ${isGif ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}
          >
            {isGif ? "GIF" : fileType.split("/")[1]?.toUpperCase() || "IMG"}
          </span>
          <span className="px-2 py-1 text-xs font-medium bg-[#141414] text-[#888888]">
            {imageWidth} × {imageHeight}
          </span>
          <span className="hidden lg:inline px-2 py-1 text-xs font-medium bg-[#141414] text-[#888888]">
            {formatFileSize(originalSize)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <a
          href="https://marcuscoelho.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline text-xs text-[#666666] hover:text-[#3b82f6] transition-colors"
        >
          @coelhomarcus
        </a>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Voltar</span>
        </button>
      </div>
    </header>
  );
}
