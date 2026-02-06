import { Crop as CropIcon, ChevronLeft, Menu } from "lucide-react";
import { formatFileSize } from "../../utils/gifProcessor";
import type { CropHeaderProps } from "../../types";

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
    <header className="bg-[#16171f] border-b border-[#2d2e3a] px-3 md:px-4 py-2 md:py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#1e1f2a] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <CropIcon className="w-5 h-5 md:w-6 md:h-6 text-[#3b82f6]" />
          <span className="text-base md:text-lg font-semibold text-[#f3f4f6] hidden sm:inline">
            Recortar Imagem
          </span>
        </div>

        <div className="hidden md:block h-6 w-px bg-[#2d2e3a]" />

        <div className="hidden md:flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${isGif ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}
          >
            {isGif ? "GIF" : fileType.split("/")[1]?.toUpperCase() || "IMG"}
          </span>
          <span className="px-2 py-1 rounded text-xs font-medium bg-[#1e1f2a] text-[#9ca3af]">
            {imageWidth} × {imageHeight}
          </span>
          <span className="hidden lg:inline px-2 py-1 rounded text-xs font-medium bg-[#1e1f2a] text-[#9ca3af]">
            {formatFileSize(originalSize)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <a
          href="https://marcuscoelho.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline text-xs text-[#6b7280] hover:text-[#3b82f6] transition-colors"
        >
          @coelhomarcus
        </a>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-md text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Voltar</span>
        </button>
      </div>
    </header>
  );
}
