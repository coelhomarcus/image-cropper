import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import ReactCrop from "react-image-crop";
import type { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { getCroppedImage, getFileExtension } from "../utils/imageProcessor";
import { cropGif, formatFileSize } from "../utils/gifProcessor";
import { ASPECT_RATIOS } from "../hooks/useCrop";
import { CropHeader, CropSidebar, CropPreviewModal, MobileFloatingButtons } from "./crop";

type AspectRatioKey = keyof typeof ASPECT_RATIOS;

interface GifSettings {
  colors: number;
  skipFrames: number;
}

interface PreviewResult {
  url: string;
  size: number;
  sizeFormatted: string;
}

export function CropPage() {
  const navigate = useNavigate();
  
  // Image state
  const [imageSrc, setImageSrc] = useState<string | undefined>();
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<string>("image/jpeg");
  const [isGif, setIsGif] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  
  // Crop state
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspectRatio, setAspectRatio] = useState<number | undefined>();
  const [selectedAspect, setSelectedAspect] = useState<AspectRatioKey>("Livre");
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [customAspectW, setCustomAspectW] = useState("");
  const [customAspectH, setCustomAspectH] = useState("");
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  
  // GIF settings
  const [gifSettings, setGifSettings] = useState<GifSettings>({ colors: 256, skipFrames: 1 });
  const [showGifSettings, setShowGifSettings] = useState(false);
  
  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Refs
  const imgRef = useRef<HTMLImageElement>(null);
  const fileRef = useRef<File | null>(null);

  const cropWidth = completedCrop?.width ?? 0;
  const cropHeight = completedCrop?.height ?? 0;
  const canGenerate = completedCrop && !isProcessing;

  // Load image from sessionStorage on mount
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

    // Convert base64 to File for GIF processing
    if (storedFileType === "image/gif" && storedImage) {
      fetch(storedImage)
        .then(res => res.blob())
        .then(blob => {
          fileRef.current = new File([blob], storedFileName || "image.gif", { type: "image/gif" });
        });
    }
  }, [navigate]);

  // Handle image load
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
        setAspectRatio(1);
        setCustomAspectW("1");
        setCustomAspectH("1");
        createCenteredCrop(1);
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

  const setCropDimensions = useCallback((width: number, height: number) => {
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
  }, [crop?.x, crop?.y]);

  const handleWidthChange = (value: string) => {
    setWidthInput(value);
    const width = parseInt(value, 10);
    if (!isNaN(width) && width > 0) {
      if (aspectRatio) {
        setCropDimensions(width, Math.round(width / aspectRatio));
      } else {
        setCropDimensions(width, cropHeight || 100);
      }
    }
  };

  const handleHeightChange = (value: string) => {
    setHeightInput(value);
    const height = parseInt(value, 10);
    if (!isNaN(height) && height > 0) {
      if (aspectRatio) {
        setCropDimensions(Math.round(height * aspectRatio), height);
      } else {
        setCropDimensions(cropWidth || 100, height);
      }
    }
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
    <div className="h-screen bg-[#0d0e14] flex flex-col overflow-hidden">
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
          cropX={crop?.x ?? 0}
          cropY={crop?.y ?? 0}
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

        {/* Crop area */}
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
              className="max-w-full" 
              style={{ maxHeight: "calc(100vh - 80px)" }} 
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
    </div>
  );
}
