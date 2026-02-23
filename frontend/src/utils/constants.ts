import type { GifSettings } from "../types";

export const DEFAULT_GIF_SETTINGS: GifSettings = {
  skipFrames: 1,
};

export const ASPECT_RATIOS = {
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
