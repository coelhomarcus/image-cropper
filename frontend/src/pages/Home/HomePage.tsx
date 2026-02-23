import { useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useDragDrop } from "@/hooks/useDragDrop";
import { usePaste } from "@/hooks/usePaste";
import { saveCropSession } from "@/utils/sessionStorage";
import { Footer } from "./components/Footer";
import { DragOverlay } from "./components/DragOverlay";
import { UploadCard } from "./components/UploadCard";
import { FeatureGrid } from "./components/FeatureGrid";

export function HomePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        saveCropSession(reader.result as string, file);
        navigate("/crop");
      };
      reader.readAsDataURL(file);
    },
    [navigate],
  );

  usePaste({ onFilePaste: processFile });

  const { isDragging, handlers } = useDragDrop({
    onFileDrop: processFile,
    listenOnDocument: true,
  });

  useEffect(() => {
    const doc = document;
    doc.addEventListener(
      "dragenter",
      handlers.handleDragEnter as EventListener,
    );
    doc.addEventListener(
      "dragleave",
      handlers.handleDragLeave as EventListener,
    );
    doc.addEventListener("dragover", handlers.handleDragOver as EventListener);
    doc.addEventListener("drop", handlers.handleDrop as EventListener);

    return () => {
      doc.removeEventListener(
        "dragenter",
        handlers.handleDragEnter as EventListener,
      );
      doc.removeEventListener(
        "dragleave",
        handlers.handleDragLeave as EventListener,
      );
      doc.removeEventListener(
        "dragover",
        handlers.handleDragOver as EventListener,
      );
      doc.removeEventListener("drop", handlers.handleDrop as EventListener);
    };
  }, [handlers]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative background">
      <DragOverlay isDragging={isDragging} />

      <main className="flex-1 flex items-center justify-center p-4 md:p-6 z-20">
        <div className="max-w-xl w-full">
          <UploadCard
            fileInputRef={fileInputRef}
            onFileSelect={handleFileSelect}
          />
          <FeatureGrid />
        </div>
      </main>

      <Footer />
    </div>
  );
}
