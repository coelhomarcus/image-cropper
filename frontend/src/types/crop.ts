import type { Crop, PixelCrop } from "react-image-crop";

export interface GifSettings {
  skipFrames: number;
}

export interface PreviewResult {
  url: string;
  size: number;
  sizeFormatted: string;
}

export type OutputFormat = "original" | "image/png" | "image/jpeg" | "image/webp" | "image/avif" | "image/bmp";

export type { Crop, PixelCrop };
