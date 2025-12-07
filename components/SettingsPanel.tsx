import React from 'react';
import { Settings2, Monitor, Image as ImageIcon, Check } from './icons';
import { ResolutionPreset, ConvertSettings } from '../types';

interface SettingsPanelProps {
  settings: ConvertSettings;
  onChange: (settings: ConvertSettings) => void;
  disabled: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange, disabled }) => {
  
  const presets = [
    { id: ResolutionPreset.SD_1K, label: '1K FHD', desc: '1920px' },
    { id: ResolutionPreset.HD_2K, label: '2K QHD', desc: '2560px' },
    { id: ResolutionPreset.UHD_4K, label: '4K UHD', desc: '3840px' },
    { id: ResolutionPreset.ORIGINAL, label: 'Original', desc: '1.5x Scale' },
  ];

  const updateField = <K extends keyof ConvertSettings>(key: K, value: ConvertSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className={`bg-lain-card border border-zinc-800 rounded-xl p-6 transition-opacity ${disabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex items-center space-x-2 mb-6">
        <Settings2 className="w-5 h-5 text-lain-accent" />
        <h2 className="text-lg font-bold text-lain-text font-mono">Render Config</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Resolution Selector */}
        <div className="lg:col-span-2 space-y-3">
          <label className="text-xs font-semibold text-lain-muted uppercase tracking-wider flex items-center">
            <Monitor className="w-3 h-3 mr-2" /> Resolution
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => updateField('preset', preset.id)}
                className={`
                  relative p-2 rounded-lg text-left transition-all duration-200 border
                  ${settings.preset === preset.id 
                    ? 'bg-lain-accent/10 border-lain-accent shadow-[0_0_10px_rgba(139,92,246,0.15)]' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
                  }
                `}
              >
                <div className={`text-sm font-bold ${settings.preset === preset.id ? 'text-lain-accent' : 'text-zinc-300'}`}>
                  {preset.label}
                </div>
                <div className="text-[10px] text-zinc-500">{preset.desc}</div>
                {settings.preset === preset.id && (
                  <div className="absolute top-2 right-2 text-lain-accent">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Format Selector */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-lain-muted uppercase tracking-wider flex items-center">
            <ImageIcon className="w-3 h-3 mr-2" /> Format
          </label>
          <div className="flex p-1 bg-zinc-900 rounded-lg border border-zinc-800">
            {['png', 'jpeg'].map((fmt) => (
              <button
                key={fmt}
                onClick={() => updateField('format', fmt as 'png' | 'jpeg')}
                className={`
                  flex-1 py-1.5 text-sm font-medium rounded-md capitalize transition-all
                  ${settings.format === fmt 
                    ? 'bg-zinc-700 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                  }
                `}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Scale Slider (Only active for Custom, or maybe showing current scale estimate?) */}
        {/* We will just use it as a custom scale input if preset is custom */}
        <div className="space-y-3">
           <label className="text-xs font-semibold text-lain-muted uppercase tracking-wider">
            Custom Scale
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={settings.customScale}
              onChange={(e) => {
                updateField('preset', ResolutionPreset.CUSTOM);
                updateField('customScale', parseFloat(e.target.value));
              }}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-lain-accent"
            />
            <span className="text-sm font-mono text-lain-accent min-w-[3rem]">
              {settings.preset === ResolutionPreset.CUSTOM ? settings.customScale.toFixed(1) + 'x' : 'Auto'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
