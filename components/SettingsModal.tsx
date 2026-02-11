import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Key } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  musicVolume: number;
  onMusicVolumeChange: (val: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  musicVolume, 
  onMusicVolumeChange 
}) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) setApiKey(stored);
  }, [isOpen]);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    if (val.trim()) {
      localStorage.setItem('gemini_api_key', val.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };
  
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-neutral-900 border border-neutral-700 w-full max-w-sm p-6 rounded-xl shadow-2xl relative"
        >
          <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            
            {/* API Key Input */}
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
                  <Key size={16} />
                  <span>Gemini API Key</span>
               </div>
               <input 
                 type="password"
                 value={apiKey}
                 onChange={handleApiKeyChange}
                 placeholder="Enter your API Key..."
                 className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
               />
               <p className="text-xs text-neutral-500">
                 Saved to local storage. Required if no environment key is set.
               </p>
            </div>

            {/* Music Volume Control */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-medium text-neutral-300">
                <div className="flex items-center gap-2">
                  {musicVolume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  <span>Music Volume</span>
                </div>
                <span className="text-neutral-500">{Math.round(musicVolume * 100)}%</span>
              </div>
              
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01"
                value={musicVolume}
                onChange={(e) => onMusicVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400"
              />
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-neutral-800 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-neutral-100 hover:bg-white text-black font-bold text-sm rounded-full transition-colors shadow-lg shadow-white/10"
            >
                Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};