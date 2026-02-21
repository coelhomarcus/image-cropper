import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Footer, DragOverlay, UploadCard, FeatureGrid } from "./components";

export function HomePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current++;
      if (e.dataTransfer?.types.includes("Files")) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current--;
      if (dragCounterRef.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDragging(false);
    };

    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragenter", handleDragEnter);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", handleDrop);
    };
  }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      sessionStorage.setItem("cropImage", reader.result as string);
      sessionStorage.setItem("cropFileName", file.name);
      sessionStorage.setItem("cropFileType", file.type);
      sessionStorage.setItem("cropFileSize", file.size.toString());
      navigate("/crop");
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDropOnPage = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0d0e14] flex flex-col relative"
      onDrop={handleDropOnPage}
    >
      <DragOverlay isDragging={isDragging} />

      <main className="flex-1 flex items-center justify-center p-4 md:p-6">
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
