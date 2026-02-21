const KEYS = {
  IMAGE: "cropImage",
  FILE_NAME: "cropFileName",
  FILE_TYPE: "cropFileType",
  FILE_SIZE: "cropFileSize",
} as const;

export interface CropSessionData {
  image: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export function saveCropSession(dataUrl: string, file: File): void {
  sessionStorage.setItem(KEYS.IMAGE, dataUrl);
  sessionStorage.setItem(KEYS.FILE_NAME, file.name);
  sessionStorage.setItem(KEYS.FILE_TYPE, file.type);
  sessionStorage.setItem(KEYS.FILE_SIZE, file.size.toString());
}

export function loadCropSession(): CropSessionData | null {
  const image = sessionStorage.getItem(KEYS.IMAGE);
  if (!image) return null;

  return {
    image,
    fileName: sessionStorage.getItem(KEYS.FILE_NAME) || "",
    fileType: sessionStorage.getItem(KEYS.FILE_TYPE) || "image/jpeg",
    fileSize: parseInt(sessionStorage.getItem(KEYS.FILE_SIZE) || "0", 10),
  };
}

export function clearCropSession(): void {
  sessionStorage.removeItem(KEYS.IMAGE);
  sessionStorage.removeItem(KEYS.FILE_NAME);
  sessionStorage.removeItem(KEYS.FILE_TYPE);
  sessionStorage.removeItem(KEYS.FILE_SIZE);
}
