import { useState, useRef, useCallback, useEffect } from "react";
import type { Crop, PixelCrop } from "react-image-crop";
import { getCroppedImage, getFileExtension } from "../utils/imageProcessor";
import { cropGif, formatFileSize } from "../utils/gifProcessor";

export interface PreviewResult {
  url: string;
  size: number;
  sizeFormatted: string;
}

export interface GifSettings {
  colors: number;
  skipFrames: number;
}

export interface UseCropReturn {
  crop: Crop | undefined;
  setCrop: (crop: Crop) => void;
  completedCrop: PixelCrop | undefined;
  setCompletedCrop: (crop: PixelCrop) => void;
  imageSrc: string | undefined;
  isGif: boolean;
  isProcessing: boolean;
  processingProgress: number;
  imgRef: React.RefObject<HTMLImageElement | null>;
  onSelectFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  generatePreview: () => Promise<void>;
  downloadResult: () => void;
  clearImage: () => void;
  fileName: string | undefined;
  cropWidth: number;
  cropHeight: number;
  setCropDimensions: (width: number, height: number) => void;
  aspectRatio: number | undefined;
  setAspectRatioAndUpdate: (ratio: number | undefined) => void;
  imageWidth: number;
  imageHeight: number;
  // GIF settings
  gifSettings: GifSettings;
  setGifSettings: (settings: GifSettings) => void;
  // Preview
  preview: PreviewResult | null;
  clearPreview: () => void;
  originalSize: number;
  originalSizeFormatted: string;
}

const ASPECT_RATIOS = {
  Livre: undefined,
  "1:1": 1,
  "16:9": 16 / 9,
  "9:16": 9 / 16,
  "4:3": 4 / 3,
  "3:4": 3 / 4,
  "3:2": 3 / 2,
  "2:3": 2 / 3,
  Personalizado: -1,
};

export { ASPECT_RATIOS };

export function useCrop(): UseCropReturn {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imageSrc, setImageSrc] = useState<string>();
  const [imageType, setImageType] = useState<string>("image/jpeg");
  const [isGif, setIsGif] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [fileName, setFileName] = useState<string>();
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const [imageWidth, setImageWidth] = useState<number>(0);
  const [imageHeight, setImageHeight] = useState<number>(0);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [gifSettings, setGifSettings] = useState<GifSettings>({
    colors: 256,
    skipFrames: 1,
  });
  const [preview, setPreview] = useState<PreviewResult | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const fileRef = useRef<File | null>(null);

  const cropWidth = completedCrop?.width ?? 0;
  const cropHeight = completedCrop?.height ?? 0;
  const originalSizeFormatted = formatFileSize(originalSize);

  const resetCrop = useCallback(() => {
    setCrop(undefined);
    setCompletedCrop(undefined);
    setPreview(null);
  }, []);

  // Create a centered crop with the given aspect ratio
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

    const newCrop: Crop = {
      unit: "px",
      x,
      y,
      width: cropW,
      height: cropH,
    };

    setCrop(newCrop);
    setCompletedCrop({
      unit: "px",
      x,
      y,
      width: cropW,
      height: cropH,
    });
  }, []);

  const setAspectRatioAndUpdate = useCallback(
    (ratio: number | undefined) => {
      setAspectRatio(ratio);
      setPreview(null);

      if (!imgRef.current) return;

      if (crop && ratio) {
        const currentWidth = crop.width;
        const newHeight = currentWidth / ratio;

        const img = imgRef.current;
        let finalWidth = currentWidth;
        let finalHeight = newHeight;

        if (newHeight > img.height) {
          finalHeight = img.height * 0.8;
          finalWidth = finalHeight * ratio;
        }

        const x = Math.min(crop.x, img.width - finalWidth);
        const y = Math.min(crop.y, img.height - finalHeight);

        const newCrop: Crop = {
          unit: "px",
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: finalWidth,
          height: finalHeight,
        };

        setCrop(newCrop);
        setCompletedCrop({
          unit: "px",
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: finalWidth,
          height: finalHeight,
        });
      } else if (!crop && ratio) {
        createCenteredCrop(ratio);
      }
    },
    [crop, createCenteredCrop],
  );

  const onSelectFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        fileRef.current = file;
        setImageType(file.type);
        setIsGif(file.type === "image/gif");
        setOriginalSize(file.size);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setFileName(nameWithoutExt);
        resetCrop();
        setGifSettings({ colors: 256, skipFrames: 1 });

        const reader = new FileReader();
        reader.addEventListener("load", () => {
          setImageSrc(reader.result as string);
        });
        reader.readAsDataURL(file);
      }
    },
    [resetCrop],
  );

  useEffect(() => {
    if (imgRef.current && imageSrc) {
      const img = imgRef.current;
      const handleImageLoad = () => {
        setImageWidth(img.naturalWidth);
        setImageHeight(img.naturalHeight);
        if (aspectRatio) {
          setTimeout(() => createCenteredCrop(aspectRatio), 0);
        }
      };

      if (img.complete) {
        handleImageLoad();
      } else {
        img.onload = handleImageLoad;
      }
    }
  }, [imageSrc, aspectRatio, createCenteredCrop]);

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

  const clearImage = useCallback(() => {
    setImageSrc(undefined);
    setFileName(undefined);
    setImageWidth(0);
    setImageHeight(0);
    setAspectRatio(undefined);
    setOriginalSize(0);
    setPreview(null);
    fileRef.current = null;
    resetCrop();
  }, [resetCrop]);

  const generatePreview = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setPreview(null);

    try {
      let result;

      if (isGif && fileRef.current) {
        result = await cropGif(imgRef.current, completedCrop, fileRef.current, {
          onProgress: (p) => setProcessingProgress(p),
          colors: gifSettings.colors,
          skipFrames: gifSettings.skipFrames,
        });
      } else {
        result = await getCroppedImage(
          imgRef.current,
          completedCrop,
          imageType,
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
  }, [completedCrop, isGif, imageType, gifSettings]);

  const downloadResult = useCallback(() => {
    if (!preview) return;

    const ext = isGif ? "gif" : getFileExtension(imageType);
    const name = fileName || "cropped";

    const link = document.createElement("a");
    link.download = `${name} [crop.marcuscoelho.com].${ext}`;
    link.href = preview.url;
    link.click();
  }, [preview, isGif, imageType, fileName]);

  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  return {
    crop,
    setCrop,
    completedCrop,
    setCompletedCrop,
    imageSrc,
    isGif,
    isProcessing,
    processingProgress,
    imgRef,
    onSelectFile,
    generatePreview,
    downloadResult,
    clearImage,
    fileName,
    cropWidth,
    cropHeight,
    setCropDimensions,
    aspectRatio,
    setAspectRatioAndUpdate,
    imageWidth,
    imageHeight,
    gifSettings,
    setGifSettings,
    preview,
    clearPreview,
    originalSize,
    originalSizeFormatted,
  };
}
