import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Upload } from "lucide-react";

import { getCroppedImage, getFileExtension } from "../utils/imageProcessor";
import { cropGif, formatFileSize } from "../utils/gifProcessor";
import { ASPECT_RATIOS } from "../hooks/useCrop";
import {
  CropHeader,
  CropSidebar,
  CropPreviewModal,
  MobileFloatingButtons,
} from "./Cropper";
import type {
  Crop,
  PixelCrop,
  GifSettings,
  PreviewResult,
  AspectRatioKey,
} from "../types";

export function CropPage() {
  const navigate = useNavigate();

  const [imageSrc, setImageSrc] = useState<string | undefined>();
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<string>("image/jpeg");
  const [isGif, setIsGif] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspectRatio, setAspectRatio] = useState<number | undefined>();
  const [selectedAspect, setSelectedAspect] = useState<AspectRatioKey>("Livre");
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [customAspectW, setCustomAspectW] = useState("");
  const [customAspectH, setCustomAspectH] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [preview, setPreview] = useState<PreviewResult | null>(null);

  const [gifSettings, setGifSettings] = useState<GifSettings>({
    colors: 256,
    skipFrames: 1,
  });
  const [showGifSettings, setShowGifSettings] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const imgRef = useRef<HTMLImageElement>(null);
  const fileRef = useRef<File | null>(null);

  const getScale = () => {
    if (!imgRef.current) return { scaleX: 1, scaleY: 1 };
    return {
      scaleX: imgRef.current.naturalWidth / imgRef.current.width,
      scaleY: imgRef.current.naturalHeight / imgRef.current.height,
    };
  };

  const cropWidthDisplay = completedCrop?.width ?? 0;
  const cropHeightDisplay = completedCrop?.height ?? 0;
  const { scaleX, scaleY } = getScale();
  const cropWidth = cropWidthDisplay * scaleX;
  const cropHeight = cropHeightDisplay * scaleY;
  const canGenerate = completedCrop && !isProcessing;

  useEffect(() => {
    const storedImage = sessionStorage.getItem("cropImage");
    const storedFileName = sessionStorage.getItem("cropFileName");
    const storedFileType = sessionStorage.getItem("cropFileType");
    const storedFileSize = sessionStorage.getItem("cropFileSize");

    if (!storedImage) {
      navigate("/");
      return;
    }

    setImageSrc(storedImage);
    setFileName(storedFileName?.replace(/\.[^/.]+$/, "") || "cropped");
    setFileType(storedFileType || "image/jpeg");
    setIsGif(storedFileType === "image/gif");
    setOriginalSize(parseInt(storedFileSize || "0", 10));

    if (storedFileType === "image/gif" && storedImage) {
      fetch(storedImage)
        .then((res) => res.blob())
        .then((blob) => {
          fileRef.current = new File([blob], storedFileName || "image.gif", {
            type: "image/gif",
          });
        });
    }
  }, [navigate]);

  useEffect(() => {
    if (imgRef.current && imageSrc) {
      const img = imgRef.current;
      const handleImageLoad = () => {
        setImageWidth(img.naturalWidth);
        setImageHeight(img.naturalHeight);
      };
      if (img.complete) {
        handleImageLoad();
      } else {
        img.onload = handleImageLoad;
      }
    }
  }, [imageSrc]);

  const createCenteredCrop = useCallback((ratio: number | undefined) => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const imgWidth = img.width;
    const imgHeight = img.height;

    let cropW: number;
    let cropH: number;

    if (ratio) {
      if (imgWidth / imgHeight > ratio) {
        cropH = imgHeight * 0.8;
        cropW = cropH * ratio;
      } else {
        cropW = imgWidth * 0.8;
        cropH = cropW / ratio;
      }
    } else {
      cropW = imgWidth * 0.8;
      cropH = imgHeight * 0.8;
    }

    const x = (imgWidth - cropW) / 2;
    const y = (imgHeight - cropH) / 2;

    const newCrop: Crop = { unit: "px", x, y, width: cropW, height: cropH };
    setCrop(newCrop);
    setCompletedCrop({ unit: "px", x, y, width: cropW, height: cropH });
  }, []);

  const handleAspectChange = (key: AspectRatioKey) => {
    setSelectedAspect(key);
    if (key === "Personalizado") {
      const w = parseInt(customAspectW, 10);
      const h = parseInt(customAspectH, 10);
      if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
        setAspectRatio(w / h);
        createCenteredCrop(w / h);
      } else {
        setAspectRatio(988 / 180);
        setCustomAspectW("988");
        setCustomAspectH("180");
        createCenteredCrop(988 / 180);
      }
    } else {
      const ratio = ASPECT_RATIOS[key];
      setAspectRatio(ratio);
      if (ratio) createCenteredCrop(ratio);
    }
    setPreview(null);
  };

  const handleCustomAspectWChange = (value: string) => {
    setCustomAspectW(value);
    const w = parseInt(value, 10);
    const h = parseInt(customAspectH, 10);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      setAspectRatio(w / h);
      createCenteredCrop(w / h);
    }
  };

  const handleCustomAspectHChange = (value: string) => {
    setCustomAspectH(value);
    const w = parseInt(customAspectW, 10);
    const h = parseInt(value, 10);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      setAspectRatio(w / h);
      createCenteredCrop(w / h);
    }
  };

  const setCropDimensions = useCallback(
    (width: number, height: number) => {
      if (!imgRef.current) return;
      const img = imgRef.current;
      const maxWidth = img.width;
      const maxHeight = img.height;

      const clampedWidth = Math.min(Math.max(1, width), maxWidth);
      const clampedHeight = Math.min(Math.max(1, height), maxHeight);

      const x = crop?.x ?? 0;
      const y = crop?.y ?? 0;
      const finalX = Math.min(x, maxWidth - clampedWidth);
      const finalY = Math.min(y, maxHeight - clampedHeight);

      const newCrop: Crop = {
        unit: "px",
        x: Math.max(0, finalX),
        y: Math.max(0, finalY),
        width: clampedWidth,
        height: clampedHeight,
      };

      setCrop(newCrop);
      setCompletedCrop({
        unit: "px",
        x: Math.max(0, finalX),
        y: Math.max(0, finalY),
        width: clampedWidth,
        height: clampedHeight,
      });
      setPreview(null);
    },
    [crop?.x, crop?.y],
  );

  const handleWidthChange = (value: string) => {
    setWidthInput(value);
    const width = parseInt(value, 10);
    if (!isNaN(width) && width > 0) {
      const { scaleX, scaleY } = getScale();
      const displayWidth = width / scaleX;
      if (aspectRatio) {
        const actualHeight = Math.round(width / aspectRatio);
        setCropDimensions(displayWidth, actualHeight / scaleY);
      } else {
        setCropDimensions(displayWidth, cropHeightDisplay || 100);
      }
    }
  };

  const handleHeightChange = (value: string) => {
    setHeightInput(value);
    const height = parseInt(value, 10);
    if (!isNaN(height) && height > 0) {
      const { scaleX, scaleY } = getScale();
      const displayHeight = height / scaleY;
      if (aspectRatio) {
        const actualWidth = Math.round(height * aspectRatio);
        setCropDimensions(actualWidth / scaleX, displayHeight);
      } else {
        setCropDimensions(cropWidthDisplay || 100, displayHeight);
      }
    }
  };

  const handleCropXChange = (value: string) => {
    const x = parseInt(value, 10);
    if (isNaN(x) || x < 0) return;
    if (!imgRef.current || !completedCrop) return;
    const { scaleX } = getScale();
    const displayX = x / scaleX;
    const maxX = imgRef.current.width - (completedCrop.width ?? 0);
    const clampedX = Math.min(Math.max(0, displayX), maxX);

    const newCrop: Crop = { ...completedCrop, x: clampedX };
    setCrop(newCrop);
    setCompletedCrop({ ...completedCrop, x: clampedX });
    setPreview(null);
  };

  const handleCropYChange = (value: string) => {
    const y = parseInt(value, 10);
    if (isNaN(y) || y < 0) return;
    if (!imgRef.current || !completedCrop) return;
    const { scaleY } = getScale();
    const displayY = y / scaleY;
    const maxY = imgRef.current.height - (completedCrop.height ?? 0);
    const clampedY = Math.min(Math.max(0, displayY), maxY);

    const newCrop: Crop = { ...completedCrop, y: clampedY };
    setCrop(newCrop);
    setCompletedCrop({ ...completedCrop, y: clampedY });
    setPreview(null);
  };

  const loadNewImage = (file: File) => {
    if (!file.type.startsWith("image/")) return;

    setFileType(file.type);
    setIsGif(file.type === "image/gif");
    setOriginalSize(file.size);
    setFileName(file.name.replace(/\.[^/.]+$/, ""));

    setCrop(undefined);
    setCompletedCrop(undefined);
    setPreview(null);
    setWidthInput("");
    setHeightInput("");
    setGifSettings({ colors: 256, skipFrames: 1 });

    if (file.type === "image/gif") {
      fileRef.current = file;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageSrc(dataUrl);
      sessionStorage.setItem("cropImage", dataUrl);
      sessionStorage.setItem("cropFileName", file.name);
      sessionStorage.setItem("cropFileType", file.type);
      sessionStorage.setItem("cropFileSize", String(file.size));
    };
    reader.readAsDataURL(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const file = e.dataTransfer.files?.[0];
    if (file) loadNewImage(file);
  };

  const handleReset = () => {
    setWidthInput("");
    setHeightInput("");
    setSelectedAspect("Livre");
    setAspectRatio(undefined);
    setCustomAspectW("");
    setCustomAspectH("");
    setCrop(undefined);
    setCompletedCrop(undefined);
    setPreview(null);
  };

  const handleClearImage = () => {
    sessionStorage.removeItem("cropImage");
    sessionStorage.removeItem("cropFileName");
    sessionStorage.removeItem("cropFileType");
    sessionStorage.removeItem("cropFileSize");
    navigate("/");
  };

  const generatePreview = async () => {
    if (!completedCrop || !imgRef.current) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setPreview(null);
    setSidebarOpen(false);

    try {
      let result;

      if (isGif && fileRef.current) {
        result = await cropGif(imgRef.current, completedCrop, fileRef.current, {
          onProgress: (p) => setProcessingProgress(p),
          colors: gifSettings.colors,
          skipFrames: gifSettings.skipFrames,
        });
      } else {
        result = await getCroppedImage(imgRef.current, completedCrop, fileType);
      }

      setPreview({
        url: result.url,
        size: result.blob.size,
        sizeFormatted: formatFileSize(result.blob.size),
      });
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      alert("Erro ao processar a imagem.");
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const downloadResult = () => {
    if (!preview) return;
    const ext = isGif ? "gif" : getFileExtension(fileType);
    const name = fileName || "cropped";
    const link = document.createElement("a");
    link.download = `${name} [crop.marcuscoelho.com].${ext}`;
    link.href = preview.url;
    link.click();
  };

  if (!imageSrc) {
    return null;
  }

  return (
    <div
      className="h-screen bg-[#0d0e14] flex flex-col overflow-hidden relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CropHeader
        isGif={isGif}
        fileType={fileType}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        originalSize={originalSize}
        onMenuClick={() => setSidebarOpen(true)}
        onBack={handleClearImage}
      />

      <div className="flex flex-1 min-h-0 relative">
        <CropSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isGif={isGif}
          fileType={fileType}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          originalSize={originalSize}
          widthInput={widthInput}
          heightInput={heightInput}
          onWidthChange={handleWidthChange}
          onHeightChange={handleHeightChange}
          cropWidth={cropWidth}
          cropHeight={cropHeight}
          selectedAspect={selectedAspect}
          onAspectChange={handleAspectChange}
          customAspectW={customAspectW}
          customAspectH={customAspectH}
          onCustomAspectWChange={handleCustomAspectWChange}
          onCustomAspectHChange={handleCustomAspectHChange}
          cropX={(crop?.x ?? 0) * scaleX}
          cropY={(crop?.y ?? 0) * scaleY}
          onCropXChange={handleCropXChange}
          onCropYChange={handleCropYChange}
          onReset={handleReset}
          gifSettings={gifSettings}
          setGifSettings={setGifSettings}
          showGifSettings={showGifSettings}
          setShowGifSettings={setShowGifSettings}
          isProcessing={isProcessing}
          processingProgress={processingProgress}
          canGenerate={!!canGenerate}
          onGenerate={generatePreview}
        />

        <div className="flex-1 bg-[#0d0e14] flex items-center justify-center p-2 md:p-4 overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Image to crop"
              className="max-w-full select-none"
              style={{ maxHeight: "calc(100vh - 80px)" }}
              draggable={false}
            />
          </ReactCrop>
        </div>

        <MobileFloatingButtons
          canGenerate={!!canGenerate}
          isProcessing={isProcessing}
          onGenerate={generatePreview}
          onOpenSettings={() => setSidebarOpen(true)}
        />
      </div>

      {preview && (
        <CropPreviewModal
          preview={preview}
          originalSize={originalSize}
          onClose={() => setPreview(null)}
          onDownload={downloadResult}
        />
      )}

      {isDragging && (
        <div className="absolute inset-0 z-100 bg-[#0d0e14]/80 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-dashed border-[#3b82f6] rounded-xl p-12 text-center">
            <Upload className="w-12 h-12 text-[#3b82f6] mx-auto mb-3" />
            <p className="text-[#f3f4f6] text-lg font-medium">
              Solte a imagem aqui
            </p>
            <p className="text-[#6b7280] text-sm mt-1">
              A imagem atual será substituída
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
