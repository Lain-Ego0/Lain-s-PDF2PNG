export enum ResolutionPreset {
  SD_1K = '1K', // ~1920 width
  HD_2K = '2K', // ~2560 width
  UHD_4K = '4K', // ~3840 width
  ORIGINAL = 'Original', // 72 DPI (Scale 1.0)
  CUSTOM = 'Custom' // User defined scale
}

export interface ConvertSettings {
  preset: ResolutionPreset;
  customScale: number;
  format: 'png' | 'jpeg';
  quality: number; // 0.1 to 1.0 (only for jpeg)
}

export interface RenderedPage {
  pageNumber: number;
  blob: Blob | null;
  url: string | null;
  width: number;
  height: number;
  status: 'idle' | 'rendering' | 'done' | 'error';
}

export interface PdfDocumentInfo {
  name: string;
  pageCount: number;
  file: File;
}
