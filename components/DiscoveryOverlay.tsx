import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlchemyElement } from '../types';

interface DiscoveryOverlayProps {
  element: AlchemyElement | null;
  onClose: () => void;
}

export const DiscoveryOverlay: React.FC<DiscoveryOverlayProps> = ({ element, onClose }) => {
  if (!element) return null;

  const color = element.color || '#f59e0b'; // Default to amber if undefined

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
      >
        <motion.div
          initial={{ scale: 0.5, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.5, y: 50 }}
          className="bg-neutral-900 border p-10 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm text-center relative overflow-hidden"
          style={{ borderColor: `${color}66`, boxShadow: `0 20px 50px -12px ${color}40` }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          {/* Background Glow */}
          <div 
            className="absolute top-0 left-0 w-full h-full radial-gradient pointer-events-none" 
            style={{ background: `radial-gradient(circle at center, ${color}20 0%, transparent 70%)` }}
          />
          
          <div className="relative z-10">
            <h2 className="font-bold tracking-widest uppercase text-sm mb-6" style={{ color: color }}>New Element Discovered</h2>
            
            <motion.div 
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="text-9xl mb-6 filter"
              style={{ filter: `drop-shadow(0 0 20px ${color}80)` }}
            >
              {element.emoji}
            </motion.div>
            
            <h1 className="text-4xl font-bold text-white mb-2">{element.name}</h1>
            <p className="text-neutral-400 text-lg leading-relaxed">{element.description}</p>
          </div>

          <button 
            onClick={onClose}
            className="mt-8 px-8 py-2 text-white font-semibold rounded-full transition-all shadow-lg z-10 hover:brightness-110"
            style={{ backgroundColor: color, boxShadow: `0 4px 12px ${color}66` }}
          >
            Awesome!
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};