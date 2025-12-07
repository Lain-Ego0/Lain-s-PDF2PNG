import React from 'react';
import { Download, Loader2, ImageOff, CheckCircle2 } from './icons';
import { RenderedPage } from '../types';

interface PageCardProps {
  page: RenderedPage;
  onDownload: () => void;
}

export const PageCard: React.FC<PageCardProps> = ({ page, onDownload }) => {
  return (
    <div className="group relative bg-lain-card rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-600 transition-all duration-300 flex flex-col">
      {/* Header / Page Number */}
      <div className="absolute top-3 left-3 z-10">
        <span className="bg-black/60 backdrop-blur-md text-white text-xs font-mono px-2 py-1 rounded border border-white/10">
          Page {page.pageNumber}
        </span>
      </div>

      {/* Status Indicators */}
      <div className="absolute top-3 right-3 z-10">
        {page.status === 'done' && (
          <span className="flex items-center bg-lain-success/20 text-lain-success backdrop-blur-md text-xs font-bold px-2 py-1 rounded border border-lain-success/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {page.width}px
          </span>
        )}
      </div>

      {/* Image Preview Area */}
      <div className="aspect-[3/4] w-full bg-[#121214] flex items-center justify-center relative overflow-hidden">
        {page.status === 'rendering' ? (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-8 h-8 text-lain-accent animate-spin mb-2" />
            <span className="text-xs text-zinc-500 font-mono">Rendering...</span>
          </div>
        ) : page.status === 'error' ? (
          <div className="flex flex-col items-center text-red-500">
            <ImageOff className="w-8 h-8 mb-2" />
            <span className="text-xs font-mono">Failed</span>
          </div>
        ) : page.url ? (
          <img 
            src={page.url} 
            alt={`Page ${page.pageNumber}`} 
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="text-zinc-700 text-xs font-mono">Waiting...</span>
        )}
        
        {/* Overlay on Hover */}
        {page.status === 'done' && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <button
              onClick={onDownload}
              className="bg-white text-black px-4 py-2 rounded-full font-bold flex items-center transform translate-y-4 group-hover:translate-y-0 transition-all hover:bg-zinc-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Save Image
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-zinc-900/50 border-t border-zinc-800 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
        <span>{page.status === 'done' ? `${page.width}x${page.height}` : '-'}</span>
        <span>{page.blob ? (page.blob.size / 1024 / 1024).toFixed(2) + ' MB' : ''}</span>
      </div>
    </div>
  );
};
