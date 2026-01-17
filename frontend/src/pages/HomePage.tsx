import { useRef } from "react";
import { useNavigate } from "react-router";
import { Upload, Crop, Image } from "lucide-react";

export function HomePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        sessionStorage.setItem("cropImage", reader.result as string);
        sessionStorage.setItem("cropFileName", file.name);
        sessionStorage.setItem("cropFileType", file.type);
        sessionStorage.setItem("cropFileSize", file.size.toString());
        navigate("/crop");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e14] flex flex-col">
      {/* Header */}
      <header className="bg-[#16171f] border-b border-[#2d2e3a] px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center md:justify-start gap-3">
          <Crop className="w-5 h-5 md:w-6 md:h-6 text-[#3b82f6]" />
          <h1 className="text-lg md:text-xl font-semibold text-[#f3f4f6]">Recortar Imagem</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-xl w-full">
          {/* Upload Card */}
          <div className="bg-[#16171f] rounded-xl border border-[#2d2e3a] p-4 sm:p-6 md:p-8">
            <label className="block border-2 border-dashed border-[#2d2e3a] rounded-xl p-8 sm:p-10 md:p-12 text-center cursor-pointer transition-all hover:border-[#3b82f6] hover:bg-[#1e1f2a] active:bg-[#1e1f2a] group">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-[#1e1f2a] flex items-center justify-center group-hover:bg-[#252630] transition-colors">
                <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-[#3b82f6]" />
              </div>
              <p className="text-lg sm:text-xl font-medium text-[#f3f4f6] mb-2">
                Envie sua imagem
              </p>
              <p className="text-xs sm:text-sm text-[#9ca3af] mb-3 sm:mb-4">
                Toque para selecionar ou arraste um arquivo
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-[#6b7280]">
                <Image className="w-4 h-4" />
                <span>PNG, JPG, GIF, WebP</span>
              </div>
            </label>
          </div>

          {/* Features */}
          <div className="mt-6 md:mt-8 grid grid-cols-3 gap-2 md:gap-4">
            <div className="text-center p-2 md:p-4">
              <div className="text-xl md:text-2xl mb-1 md:mb-2">✂️</div>
              <p className="text-xs md:text-sm text-[#9ca3af]">Recorte preciso</p>
            </div>
            <div className="text-center p-2 md:p-4">
              <div className="text-xl md:text-2xl mb-1 md:mb-2">📐</div>
              <p className="text-xs md:text-sm text-[#9ca3af]">Aspect Ratio</p>
            </div>
            <div className="text-center p-2 md:p-4">
              <div className="text-xl md:text-2xl mb-1 md:mb-2">🎞️</div>
              <p className="text-xs md:text-sm text-[#9ca3af]">Suporte a GIF</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 md:py-4 text-center text-xs text-[#6b7280]">
        by <a href="https://marcuscoelho.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600 transition-colors">
          @coelhomarcus
        </a>
      </footer>
    </div>
  );
}
