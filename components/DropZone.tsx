import React, { useState } from 'react';
import { Upload, AlertCircle } from './icons';

interface DropZoneProps {
  onFileLoaded: (file: File) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Invalid file type. Please upload a PDF.');
      return;
    }
    setError(null);
    onFileLoaded(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`
        relative w-full h-64 border-2 border-dashed rounded-xl transition-all duration-300 ease-out flex flex-col items-center justify-center p-6
        ${isDragging 
          ? 'border-lain-accent bg-lain-accent/10 scale-[1.02] shadow-[0_0_30px_rgba(139,92,246,0.2)]' 
          : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-900'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        accept="application/pdf" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={handleInputChange}
      />
      
      <div className="flex flex-col items-center space-y-4 pointer-events-none">
        <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-lain-accent/20' : 'bg-zinc-800'}`}>
          <Upload className={`w-8 h-8 ${isDragging ? 'text-lain-accent' : 'text-zinc-400'}`} />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-lain-text">
            {isDragging ? 'Drop PDF here' : 'Drag & Drop PDF'}
          </h3>
          <p className="text-sm text-lain-muted mt-1">
            or click to browse
          </p>
        </div>
        {error && (
          <div className="flex items-center text-red-400 text-sm bg-red-950/30 px-3 py-1.5 rounded-full mt-4 animate-bounce">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
