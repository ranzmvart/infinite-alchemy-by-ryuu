import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AlchemyElement } from '../types';
import { ElementCard } from './ElementCard';
import { Search, Info, Clock, X, Settings, Save, AlertCircle } from 'lucide-react';
import { soundService } from '../services/soundService';
import { hasValidKey } from '../services/alchemyService';

interface SidebarProps {
  library: AlchemyElement[];
  onElementClick: (element: AlchemyElement) => void;
  onOpenSettings: () => void;
  onOpenSnapshots: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ library, onElementClick, onOpenSettings, onOpenSnapshots }) => {
  const [search, setSearch] = useState('');
  const [hasKey, setHasKey] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = () => setHasKey(hasValidKey());
    checkKey();
    const interval = setInterval(checkKey, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredLibrary = useMemo(() => {
    const term = search.toLowerCase();
    return library.filter((el) =>
      el.name.toLowerCase().includes(term) ||
      el.description.toLowerCase().includes(term)
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [library, search]);

  return (
    <div className="w-full h-full flex flex-col bg-[#151515] z-20 border-l border-neutral-800">
      {/* Header / Search */}
      <div className="p-4 bg-[#151515] z-10 border-b border-neutral-800 sticky top-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search library..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#202020] text-neutral-200 pl-10 pr-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all placeholder-neutral-600 border border-transparent focus:border-neutral-700"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white">
                <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Library Grid */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-hide bg-[#1a1a1a]">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2 pb-10">
          {filteredLibrary.map((element) => (
            <div key={element.id} className="relative group" onMouseEnter={() => soundService.play('hover')}>
                <ElementCard
                  element={element}
                  onClick={() => onElementClick(element)}
                  className="w-full h-full hover:bg-neutral-800"
                />
            </div>
          ))}
          
          {filteredLibrary.length === 0 && (
            <div className="col-span-2 text-center text-neutral-600 mt-10 text-sm py-10">
              <p>No elements found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-3 bg-[#151515] border-t border-neutral-800 text-[10px] md:text-xs text-neutral-500 flex justify-between items-center shrink-0">
        <div className="font-mono">{library.length} / ∞</div>
        <div className="flex items-center gap-4">
            <button 
              onClick={onOpenSnapshots}
              className="hover:text-amber-500 transition-colors"
              title="Save/Load"
            >
              <Save size={16} />
            </button>
            
            <button
                onClick={onOpenSettings}
                className={`transition-colors relative ${!hasKey ? 'text-red-500' : 'hover:text-white'}`}
                title="Settings"
            >
                <Settings size={16} />
                {!hasKey && <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
            </button>
        </div>
      </div>
    </div>
  );
};