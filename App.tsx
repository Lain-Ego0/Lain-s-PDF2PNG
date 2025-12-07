import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { Download, Trash2, Layers, Zap, Loader } from './components/icons';
import { DropZone } from './components/DropZone';
import { SettingsPanel } from './components/SettingsPanel';
import { PageCard } from './components/PageCard';
import { getDocument, renderPageToImage, calculateScaleForPreset } from './services/pdfService';
import { ConvertSettings, PdfDocumentInfo, RenderedPage, ResolutionPreset } from './types';
import * as pdfjsLib from 'pdfjs-dist';

function App() {
  // State
  const [docInfo, setDocInfo] = useState<PdfDocumentInfo | null>(null);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [settings, setSettings] = useState<ConvertSettings>({
    preset: ResolutionPreset.HD_2K,
    customScale: 2.0,
    format: 'png',
    quality: 1.0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Refs for managing PDF document instance
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  // Handle File Load
  const handleFileLoaded = async (file: File) => {
    try {
      setIsProcessing(true);
      const doc = await getDocument(file);
      pdfDocRef.current = doc;
      
      setDocInfo({
        name: file.name.replace('.pdf', ''),
        pageCount: doc.numPages,
        file: file
      });

      // Initialize placeholder pages
      const newPages: RenderedPage[] = Array.from({ length: doc.numPages }, (_, i) => ({
        pageNumber: i + 1,
        blob: null,
        url: null,
        width: 0,
        height: 0,
        status: 'idle'
      }));
      setPages(newPages);
      
    } catch (err) {
      console.error("Failed to load PDF", err);
      // More descriptive error handling could go here
      alert("Error loading PDF. Please try another file or check if the PDF is valid.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger Rendering Process
  const startConversion = async () => {
    if (!pdfDocRef.current || !docInfo) return;

    setIsProcessing(true);
    setProgress(0);

    // Revoke old URLs to prevent memory leaks
    pages.forEach(p => {
      if (p.url) URL.revokeObjectURL(p.url);
    });

    const total = docInfo.pageCount;
    
    // Create a copy of pages to update status to rendering
    const updatedPages = pages.map(p => ({ ...p, status: 'rendering' as const }));
    setPages(updatedPages);

    // Process sequentially to avoid browser crashing on large files
    // Or in chunks. Let's do sequential for safety with high-res.
    for (let i = 0; i < total; i++) {
      const pageNum = i + 1;
      try {
        // Determine scale
        let scale = settings.customScale;
        if (settings.preset !== ResolutionPreset.CUSTOM) {
          // We need the original page width to calculate scale
          const page = await pdfDocRef.current.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1 });
          scale = calculateScaleForPreset(viewport.width, settings.preset);
        }

        const result = await renderPageToImage(
          pdfDocRef.current,
          pageNum,
          scale,
          settings.format,
          settings.quality
        );
        
        const url = URL.createObjectURL(result.blob);

        setPages(prev => {
          const newArr = [...prev];
          newArr[i] = {
            ...newArr[i],
            blob: result.blob,
            url: url,
            width: result.width,
            height: result.height,
            status: 'done'
          };
          return newArr;
        });

      } catch (err) {
        console.error(`Error page ${pageNum}`, err);
        setPages(prev => {
          const newArr = [...prev];
          newArr[i] = { ...newArr[i], status: 'error' };
          return newArr;
        });
      }

      setProgress(((i + 1) / total) * 100);
    }

    setIsProcessing(false);
  };

  const handleReset = () => {
    if (confirm("Clear all data and start over?")) {
      setDocInfo(null);
      setPages([]);
      setIsProcessing(false);
      setProgress(0);
      pdfDocRef.current = null;
    }
  };

  const downloadSingle = (page: RenderedPage) => {
    if (!page.blob || !docInfo) return;
    saveAs(page.blob, `${docInfo.name}_page_${page.pageNumber}.${settings.format}`);
  };

  const downloadAll = async () => {
    if (!docInfo || pages.length === 0) return;
    
    const zip = new JSZip();
    const folder = zip.folder(docInfo.name);
    
    if (!folder) return;

    pages.forEach(page => {
      if (page.blob) {
        folder.file(`page_${page.pageNumber}.${settings.format}`, page.blob);
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${docInfo.name}_images.zip`);
  };

  return (
    <div className="min-h-screen bg-lain-bg text-lain-text selection:bg-lain-accent selection:text-white pb-20">
      
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-lain-accent to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-lain-accent/20">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <h1 className="text-xl font-bold tracking-tight font-sans">
              Lain's <span className="text-lain-accent">PDF2PNG</span>
            </h1>
          </div>
          
          {docInfo && (
             <div className="flex items-center space-x-4">
               <div className="hidden md:flex flex-col items-end mr-4">
                 <span className="text-sm font-bold">{docInfo.name}</span>
                 <span className="text-xs text-lain-muted">{docInfo.pageCount} Pages</span>
               </div>
               <button 
                onClick={handleReset}
                className="p-2 text-zinc-400 hover:text-red-400 transition-colors rounded-full hover:bg-zinc-800"
                title="Reset"
               >
                 <Trash2 className="w-5 h-5" />
               </button>
             </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Upload State */}
        {!docInfo ? (
          <div className="max-w-2xl mx-auto mt-20 space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-400 to-zinc-600">
                Transform PDFs to <br/> Ultra-HD Images.
              </h2>
              <p className="text-zinc-400 text-lg max-w-lg mx-auto">
                Client-side rendering. No file size limits. 
                Complete privacy. Supports 4K and custom scaling.
              </p>
            </div>
            <DropZone onFileLoaded={handleFileLoaded} />
          </div>
        ) : (
          /* Editor State */
          <div className="space-y-8">
            
            {/* Controls */}
            <SettingsPanel 
              settings={settings} 
              onChange={setSettings} 
              disabled={isProcessing}
            />

            {/* Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
              <div className="flex items-center space-x-4 w-full md:w-auto">
                {isProcessing ? (
                   <div className="flex items-center space-x-3 w-full md:w-64">
                     <Loader className="w-5 h-5 text-lain-accent animate-spin" />
                     <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                       <div 
                        className="h-full bg-lain-accent transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                       />
                     </div>
                     <span className="text-xs font-mono text-lain-accent">{Math.round(progress)}%</span>
                   </div>
                ) : (
                  <div className="text-sm text-zinc-400 font-mono flex items-center">
                    <Layers className="w-4 h-4 mr-2" />
                    Ready to render {docInfo.pageCount} pages
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                <button
                  onClick={startConversion}
                  disabled={isProcessing}
                  className={`
                    flex-1 md:flex-none px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center
                    ${isProcessing 
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                      : 'bg-lain-accent text-white hover:bg-violet-600 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-95'
                    }
                  `}
                >
                  <Zap className="w-4 h-4 mr-2 fill-current" />
                  {pages[0].status === 'done' ? 'Re-Render' : 'Start Processing'}
                </button>

                {pages.some(p => p.status === 'done') && (
                  <button
                    onClick={downloadAll}
                    className="flex-1 md:flex-none px-6 py-2.5 bg-white text-black rounded-lg font-bold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center active:scale-95"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download ZIP
                  </button>
                )}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {pages.map((page) => (
                <PageCard 
                  key={page.pageNumber} 
                  page={page} 
                  onDownload={() => downloadSingle(page)} 
                />
              ))}
            </div>

          </div>
        )}
      </main>

      <footer className="fixed bottom-0 w-full text-center py-4 text-[10px] text-zinc-600 font-mono bg-black/80 backdrop-blur-sm border-t border-zinc-900 pointer-events-none">
        <p>POWERED BY THE WIRED • LOCAL PROCESSING ONLY</p>
      </footer>
    </div>
  );
}

export default App;
