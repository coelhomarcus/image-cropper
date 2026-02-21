import type { PixelCrop } from "react-image-crop";

export interface CropResult {
  blob: Blob;
  url: string;
}

export function getCroppedImage(
  image: HTMLImageElement,
  crop: PixelCrop,
  imageType: string,
): Promise<CropResult> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const actualWidth = Math.round(crop.width * scaleX);
    const actualHeight = Math.round(crop.height * scaleY);

    canvas.width = actualWidth;
    canvas.height = actualHeight;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      actualWidth,
      actualHeight,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob"));
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve({ blob, url });
      },
      imageType,
      0.95,
    );
  });
}

export function downloadBlob(url: string, filename: string): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

export function getFileExtension(imageType: string): string {
  return imageType.split("/")[1] || "png";
}
