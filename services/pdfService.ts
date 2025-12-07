import * as pdfjsLib from 'pdfjs-dist';

// Define the worker source. 
// We use unpkg to reliably access the worker script matching the npm package structure.
// This is necessary because the cdnjs path structure can vary or not support the ESM worker correctly.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.449/build/pdf.worker.min.mjs`;

export const getDocument = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  return loadingTask.promise;
};

export const renderPageToImage = async (
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.95
): Promise<{ blob: Blob; width: number; height: number }> => {
  const page = await pdfDoc.getPage(pageNumber);
  
  // Calculate viewport based on scale
  // Standard PDF 72 DPI. scale=1 means 72 DPI. 
  // scale=2 means 144 DPI, etc.
  const viewport = page.getViewport({ scale });

  // Prepare canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) throw new Error('Canvas context not available');

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext as any).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({ blob, width: canvas.width, height: canvas.height });
        } else {
          reject(new Error('Canvas to Blob failed'));
        }
      },
      `image/${format}`,
      quality
    );
  });
};

export const calculateScaleForPreset = (
  originalWidth: number, 
  preset: '1K' | '2K' | '4K' | 'Original'
): number => {
  if (preset === 'Original') return 1.5; // Bump default slightly for better readability (approx 108 DPI)
  
  // Target widths
  const targets = {
    '1K': 1920,
    '2K': 2560,
    '4K': 3840
  };
  
  const targetWidth = targets[preset];
  // Calculate scale needed to reach target width
  return targetWidth / originalWidth;
};