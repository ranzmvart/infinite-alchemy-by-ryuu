import React, { memo } from 'react';
import { AlchemyElement } from '../types';

interface ElementCardProps {
  element: AlchemyElement;
  onClick?: () => void;
  className?: string;
  isDragging?: boolean;
}

export const ElementCard: React.FC<ElementCardProps> = memo(({ element, onClick, className = '', isDragging = false }) => {
  const color = element.color || '#525252';
  
  return (
    <div
      onClick={onClick}
      style={{ 
        boxShadow: isDragging ? `0 10px 25px -5px ${color}66` : '0 2px 5px rgba(0,0,0,0.2)',
        borderLeft: `4px solid ${color}`
      }}
      className={`
        relative flex flex-col justify-between p-3 rounded-md
        select-none transition-all duration-200 cursor-grab active:cursor-grabbing
        ${isDragging ? 'scale-110 rotate-2 z-50 bg-neutral-800' : 'hover:bg-neutral-800 hover:translate-x-1 bg-neutral-900'}
        text-white overflow-hidden border border-neutral-800
        ${className}
      `}
    >
      <div className="flex justify-between items-start">
         <span className="text-3xl filter drop-shadow-md">{element.emoji}</span>
      </div>
      
      <span className="font-medium text-xs md:text-sm tracking-wide mt-2 truncate text-neutral-300 group-hover:text-white transition-colors">
        {element.name}
      </span>
    </div>
  );
});

ElementCard.displayName = 'ElementCard';