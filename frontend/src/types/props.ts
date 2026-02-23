import type { PreviewResult, OutputFormat } from "./crop";

export type AspectRatioKey =
  | "Livre"
  | "1:1"
  | "16:9"
  | "4:3"
  | "3:2"
  | "9:16"
  | "3:4"
  | "2:3"
  | "Personalizado";

export interface CropHeaderProps {
  isGif: boolean;
  fileType: string;
  imageWidth: number;
  imageHeight: number;
  originalSize: number;
  onMenuClick: () => void;
  onBack: () => void;
}

export interface CropSidebarProps {
  isOpen: boolean;
  onClose: () => void;

  isGif: boolean;
  fileType: string;
  imageWidth: number;
  imageHeight: number;
  originalSize: number;

  widthInput: string;
  heightInput: string;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  cropWidth: number;
  cropHeight: number;

  selectedAspect: AspectRatioKey;
  onAspectChange: (key: AspectRatioKey) => void;
  customAspectW: string;
  customAspectH: string;
  onCustomAspectWChange: (value: string) => void;
  onCustomAspectHChange: (value: string) => void;

  cropX: number;
  cropY: number;
  onCropXChange: (value: string) => void;
  onCropYChange: (value: string) => void;

  onReset: () => void;

  outputFormat: OutputFormat;
  onOutputFormatChange: (format: OutputFormat) => void;


  isProcessing: boolean;
  processingProgress: number;
  canGenerate: boolean;
  onGenerate: () => void;
}

export interface CropPreviewModalProps {
  preview: PreviewResult;
  originalSize: number;
  fileName: string;
  onFileNameChange: (name: string) => void;
  onClose: () => void;
  onDownload: () => void;
}

export interface MobileFloatingButtonsProps {
  canGenerate: boolean;
  isProcessing: boolean;
  onGenerate: () => void;
  onOpenSettings: () => void;
}
