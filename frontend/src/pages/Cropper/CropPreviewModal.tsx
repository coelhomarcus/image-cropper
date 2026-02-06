import { X, Download, FileImage, FileDown } from "lucide-react";
import { formatFileSize } from "../../utils/gifProcessor";
import type { CropPreviewModalProps } from "../../types";

export function CropPreviewModal({
  preview,
  originalSize,
  onClose,
  onDownload,
}: CropPreviewModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 md:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-w-4xl w-full max-h-full overflow-auto">
        <div className="bg-[#16171f] rounded-lg border border-[#2d2e3a] p-4 md:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 md:top-4 md:right-4 text-[#6b7280] hover:text-[#f3f4f6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-4 md:mb-6">
            <h3 className="text-base md:text-lg font-semibold text-[#f3f4f6]">
              Recortado com sucesso!
            </h3>
          </div>

          <div className="flex flex-col items-center gap-4 md:gap-6">
            <div className="bg-[#0d0e14] rounded-lg p-2">
              <img
                src={preview.url}
                alt="Preview"
                className="max-w-full max-h-[50vh] md:max-w-[400px] md:max-h-[400px] rounded-md"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2 md:gap-4 w-full">
              <div className="flex items-center gap-2 bg-[#1e1f2a] px-3 md:px-4 py-2 rounded-lg">
                <FileImage className="w-4 h-4 text-[#6b7280]" />
                <span className="text-xs md:text-sm text-[#6b7280]">
                  Original:
                </span>
                <span className="text-xs md:text-sm font-medium text-[#9ca3af]">
                  {formatFileSize(originalSize)}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-green-500/20 px-3 md:px-4 py-2 rounded-lg">
                <FileDown className="w-4 h-4 text-green-400" />
                <span className="text-xs md:text-sm text-green-400">Novo:</span>
                <span className="text-xs md:text-sm font-semibold text-green-300">
                  {preview.sizeFormatted}
                </span>
              </div>
            </div>

            <button
              onClick={onDownload}
              className="w-full sm:w-auto px-6 md:px-8 py-3 text-sm md:text-base font-medium bg-green-600 text-white rounded-lg transition-all hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Baixar Imagem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
