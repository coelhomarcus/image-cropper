import {
  X,
  RotateCcw,
  ChevronDown,
  Settings,
  Crop as CropIcon,
  Loader2,
} from "lucide-react";
import { ASPECT_RATIOS } from "../../hooks/useCrop";
import { formatFileSize } from "../../utils/gifProcessor";
import type { CropSidebarProps, AspectRatioKey } from "../../types";

export function CropSidebar({
  isOpen,
  onClose,
  isGif,
  fileType,
  imageWidth,
  imageHeight,
  originalSize,
  widthInput,
  heightInput,
  onWidthChange,
  onHeightChange,
  cropWidth,
  cropHeight,
  selectedAspect,
  onAspectChange,
  customAspectW,
  customAspectH,
  onCustomAspectWChange,
  onCustomAspectHChange,
  cropX,
  cropY,
  onReset,
  gifSettings,
  setGifSettings,
  showGifSettings,
  setShowGifSettings,
  isProcessing,
  processingProgress,
  canGenerate,
  onGenerate,
}: CropSidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      <aside
        className={`
        fixed lg:relative inset-y-0 left-0 z-50
        w-[280px] min-w-[280px] bg-[#16171f] flex flex-col border-r border-[#2d2e3a]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        lg:h-full
      `}
      >
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#2d2e3a]">
          <span className="text-sm font-medium text-[#f3f4f6]">
            Configurações
          </span>
          <button
            onClick={onClose}
            className="p-1 text-[#6b7280] hover:text-[#f3f4f6]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="lg:hidden p-4 border-b border-[#2d2e3a]">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${isGif ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}
            >
              {isGif ? "GIF" : fileType.split("/")[1]?.toUpperCase() || "IMG"}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-[#1e1f2a] text-[#9ca3af]">
              {imageWidth} × {imageHeight}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-[#1e1f2a] text-[#9ca3af]">
              {formatFileSize(originalSize)}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section>
            <h3 className="text-[#f3f4f6] font-medium text-sm mb-3">
              Tamanho do Recorte
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#6b7280] text-xs mb-1.5">
                  Largura
                </label>
                <input
                  type="number"
                  value={
                    widthInput || (cropWidth > 0 ? Math.round(cropWidth) : "")
                  }
                  onChange={(e) => onWidthChange(e.target.value)}
                  className="dark-input w-full"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-[#6b7280] text-xs mb-1.5">
                  Altura
                </label>
                <input
                  type="number"
                  value={
                    heightInput ||
                    (cropHeight > 0 ? Math.round(cropHeight) : "")
                  }
                  onChange={(e) => onHeightChange(e.target.value)}
                  className="dark-input w-full"
                  placeholder="0"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[#f3f4f6] font-medium text-sm mb-3">
              Proporção
            </h3>
            <select
              value={selectedAspect}
              onChange={(e) => onAspectChange(e.target.value as AspectRatioKey)}
              className="dark-select w-full"
            >
              {(Object.keys(ASPECT_RATIOS) as AspectRatioKey[]).map((key) => (
                <option key={key} value={key}>
                  {key === "Livre" ? "Livre" : key}
                </option>
              ))}
            </select>
            {selectedAspect === "Personalizado" && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  placeholder="W"
                  value={customAspectW}
                  onChange={(e) => onCustomAspectWChange(e.target.value)}
                  className="dark-input w-full"
                  min="1"
                />
                <span className="text-[#6b7280] font-medium">:</span>
                <input
                  type="number"
                  placeholder="H"
                  value={customAspectH}
                  onChange={(e) => onCustomAspectHChange(e.target.value)}
                  className="dark-input w-full"
                  min="1"
                />
              </div>
            )}
          </section>

          <section>
            <h3 className="text-[#f3f4f6] font-medium text-sm mb-3">
              Posição do Recorte
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#6b7280] text-xs mb-1.5">
                  Posição (Y)
                </label>
                <input
                  type="number"
                  value={Math.round(cropY)}
                  readOnly
                  className="dark-input w-full opacity-60"
                />
              </div>
              <div>
                <label className="block text-[#6b7280] text-xs mb-1.5">
                  Posição (X)
                </label>
                <input
                  type="number"
                  value={Math.round(cropX)}
                  readOnly
                  className="dark-input w-full opacity-60"
                />
              </div>
            </div>
          </section>

          <button
            onClick={onReset}
            className="w-full py-2 px-4 bg-[#1e1f2a] hover:bg-[#252630] text-[#9ca3af] rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Resetar
          </button>

          {isGif && (
            <section className="border-t border-[#2d2e3a] pt-4">
              <button
                onClick={() => setShowGifSettings(!showGifSettings)}
                className="flex items-center gap-2 text-sm text-[#9ca3af] hover:text-[#f3f4f6] w-full"
              >
                <Settings className="w-4 h-4" />
                Configurações do GIF
                <ChevronDown
                  className={`w-4 h-4 ml-auto transition-transform ${showGifSettings ? "rotate-180" : ""}`}
                />
              </button>
              {showGifSettings && (
                <div className="mt-3">
                  <label className="block text-[#6b7280] text-xs mb-2">
                    Cores: {gifSettings.colors}
                  </label>
                  <input
                    type="range"
                    min="16"
                    max="256"
                    step="16"
                    value={gifSettings.colors}
                    onChange={(e) =>
                      setGifSettings({
                        ...gifSettings,
                        colors: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-[#3b82f6]"
                  />
                  <div className="flex justify-between text-xs text-[#6b7280] mt-1">
                    <span>16 (pequeno)</span>
                    <span>256 (qualidade)</span>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        <div className="p-4 border-t border-[#2d2e3a]">
          {isProcessing && (
            <div className="mb-3">
              <div className="w-full bg-[#1e1f2a] rounded-full h-1.5">
                <div
                  className="bg-[#3b82f6] h-1.5 rounded-full transition-all duration-150"
                  style={{ width: `${processingProgress * 100}%` }}
                />
              </div>
            </div>
          )}
          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            className="w-full py-3 px-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {Math.round(processingProgress * 100)}%
              </>
            ) : (
              <>
                <CropIcon className="w-4 h-4" />
                Recortar →
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
