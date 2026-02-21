import { Upload, Image } from "lucide-react";

interface UploadCardProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadCard({ fileInputRef, onFileSelect }: UploadCardProps) {
  return (
    <div className="bg-[#0a0a0a] border border-[#262626] p-4 sm:p-6 md:p-8">
      <label className="block border border-dashed border-[#262626] p-8 sm:p-10 md:p-12 text-center cursor-pointer transition-all hover:border-[#3b82f6] hover:bg-[#141414] group">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileSelect}
          className="hidden"
        />
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-[#141414] flex items-center justify-center group-hover:bg-[#1a1a1a] transition-colors">
          <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-[#3b82f6]" />
        </div>
        <p className="text-lg sm:text-xl font-medium text-[#ededed] mb-2">
          Envie sua imagem
        </p>
        <p className="text-xs sm:text-sm text-[#888888] mb-3 sm:mb-4">
          Toque para selecionar ou arraste um arquivo
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-[#666666]">
          <Image className="w-4 h-4" />
          <span>PNG, JPG, GIF, WebP</span>
        </div>
      </label>
    </div>
  );
}
