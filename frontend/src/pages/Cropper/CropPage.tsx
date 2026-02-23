import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Upload } from "lucide-react";

import { getCroppedImage, getExtensionForMime } from "@/utils/imageProcessor";
import { cropGif, formatFileSize, isAnimatedWebP } from "@/utils/gifProcessor";
import { ASPECT_RATIOS } from "@/utils/constants";

import {
  loadCropSession,
  saveCropSession,
  clearCropSession,
} from "@/utils/sessionStorage";

import { useDragDrop } from "@/hooks/useDragDrop";
import { usePaste } from "@/hooks/usePaste";
import { CropHeader } from "./components/CropHeader";
import { CropSidebar } from "./components/CropSidebar";
import { CropPreviewModal } from "./components/CropPreviewModal";
import { MobileFloatingButtons } from "./components/MobileFloatingButtons";

import type {
  Crop,
  PixelCrop,
  PreviewResult,
  AspectRatioKey,
  OutputFormat,
} from "@/types";

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

  const [skipFrames, setSkipFrames] = useState(1);

  const [outputFormat, setOutputFormat] = useState<OutputFormat>("original");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const fileRef = useRef<File | null>(null);

  // --- Scale helpers ---

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

  // --- Session loading ---

  useEffect(() => {
    const session = loadCropSession();
    if (!session) {
      navigate("/");
      return;
    }

    setImageSrc(session.image);
    setFileName(session.fileName.replace(/\.[^/.]+$/, "") || "cropped");
    setFileType(session.fileType);
    setOriginalSize(session.fileSize);

    if (session.fileType === "image/gif") {
      setIsGif(true);
      fetch(session.image)
        .then((res) => res.blob())
        .then((blob) => {
          fileRef.current = new File([blob], session.fileName || "image.gif", {
            type: "image/gif",
          });
        });
    } else if (session.fileType === "image/webp") {
      fetch(session.image)
        .then((res) => res.blob())
        .then(async (blob) => {
          const file = new File([blob], session.fileName || "image.webp", {
            type: "image/webp",
          });
          if (await isAnimatedWebP(file)) {
            setIsGif(true);
            fileRef.current = file;
          }
        });
    } else {
      setIsGif(false);
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

  // --- Crop helpers ---

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

  // --- Aspect ratio handlers ---

  const handleAspectChange = (key: AspectRatioKey) => {
    setSelectedAspect(key);
    setWidthInput("");
    setHeightInput("");
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
    setWidthInput("");
    setHeightInput("");
    const w = parseInt(value, 10);
    const h = parseInt(customAspectH, 10);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      setAspectRatio(w / h);
      createCenteredCrop(w / h);
    }
  };

  const handleCustomAspectHChange = (value: string) => {
    setCustomAspectH(value);
    setWidthInput("");
    setHeightInput("");
    const w = parseInt(customAspectW, 10);
    const h = parseInt(value, 10);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      setAspectRatio(w / h);
      createCenteredCrop(w / h);
    }
  };

  // --- Dimension & position handlers ---

  const handleWidthChange = (value: string) => {
    setWidthInput(value);
    if (aspectRatio) setHeightInput("");
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
    if (aspectRatio) setWidthInput("");
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

  // --- Image loading (drag-drop replace) ---

  const loadNewImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    setFileType(file.type);
    setOriginalSize(file.size);
    setFileName(file.name.replace(/\.[^/.]+$/, ""));

    setCrop(undefined);
    setCompletedCrop(undefined);
    setPreview(null);
    setWidthInput("");
    setHeightInput("");
    setSkipFrames(1);
    setOutputFormat("original");

    const animated = file.type === "image/gif" || await isAnimatedWebP(file);
    setIsGif(animated);

    if (animated) {
      fileRef.current = file;
    } else {
      fileRef.current = null;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageSrc(dataUrl);
      saveCropSession(dataUrl, file);
    };
    reader.readAsDataURL(file);
  }, []);

  usePaste({ onFilePaste: loadNewImage });

  const { isDragging, dragProps } = useDragDrop({
    onFileDrop: loadNewImage,
  });

  // --- Output format handlers ---

  const handleOutputFormatChange = (format: OutputFormat) => {
    setOutputFormat(format);
    setPreview(null);
  };

  // --- Reset & clear ---

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
    setOutputFormat("original");
  };

  const handleClearImage = () => {
    clearCropSession();
    navigate("/");
  };

  // --- Processing ---

  const generatePreview = async () => {
    if (!completedCrop || !imgRef.current) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setPreview(null);
    setSidebarOpen(false);

    try {
      let result;

      if (isGif && fileRef.current && outputFormat === "original") {
        result = await cropGif(imgRef.current, completedCrop, fileRef.current, {
          onProgress: (p) => setProcessingProgress(p),
          skipFrames: skipFrames,
        });
      } else {
        result = await getCroppedImage(
          imgRef.current,
          completedCrop,
          fileType,
          outputFormat,
        );
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
    const resolvedType =
      !outputFormat || outputFormat === "original" ? fileType : outputFormat;
    const ext = getExtensionForMime(resolvedType);
    const name = fileName || "cropped";
    const link = document.createElement("a");
    link.download = `${name}.${ext}`;
    link.href = preview.url;
    link.click();
  };

  // --- Render ---

  if (!imageSrc) {
    return null;
  }

  return (
    <div
      className="h-screen bg-black flex flex-col overflow-hidden relative"
      {...dragProps}
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
          outputFormat={outputFormat}
          onOutputFormatChange={handleOutputFormatChange}
          isProcessing={isProcessing}
          processingProgress={processingProgress}
          canGenerate={!!canGenerate}
          onGenerate={generatePreview}
        />

        <div className="flex-1 background *:z-20 flex items-center justify-center p-2 md:p-4 overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => {
              setCompletedCrop(c);
              setWidthInput("");
              setHeightInput("");
            }}
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
          fileName={fileName}
          onFileNameChange={setFileName}
          onClose={() => setPreview(null)}
          onDownload={downloadResult}
        />
      )}

      {isDragging && (
        <div className="absolute inset-0 z-100 bg-black/80 flex items-center justify-center pointer-events-none">
          <div className="border border-dashed border-[#3b82f6] p-12 text-center">
            <Upload className="w-12 h-12 text-[#3b82f6] mx-auto mb-3" />
            <p className="text-[#ededed] text-lg font-medium">
              Solte a imagem aqui
            </p>
            <p className="text-[#666666] text-sm mt-1">
              A imagem atual será substituída
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
