import React, { useRef, useState, useMemo, useCallback, memo } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { AlchemyElement, WorkspaceElement } from '../types';
import { Trash2, Undo2, Redo2, Loader2 } from 'lucide-react';
import { soundService } from '../services/soundService';

interface WorkspaceProps {
  instances: WorkspaceElement[];
  setInstances: React.Dispatch<React.SetStateAction<WorkspaceElement[]>>;
  onCombine: (idA: string, idB: string) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onHistorySave: () => void;
}

// Reusable card component - Memoized to prevent re-renders of static visual parts
const WorkspaceCard: React.FC<{ 
  element: AlchemyElement; 
  isGhost?: boolean; 
  isTarget?: boolean;
  isLoading?: boolean;
  isDragging?: boolean;
}> = memo(({ element, isGhost, isTarget, isLoading, isDragging }) => {
  const color = element.color || '#737373';
  
  return (
    <div 
      className={`
        flex items-center px-4 py-3 rounded-md border-2 
        ${isLoading 
          ? 'bg-neutral-900 border-transparent' 
          : 'bg-neutral-800'}
        ${isGhost ? 'opacity-30 border-dashed grayscale bg-neutral-900' : 'shadow-md'}
        ${isTarget ? 'ring-2 ring-white/50 scale-105 z-50' : (isLoading || isGhost ? '' : 'hover:border-opacity-100 border-opacity-80')}
        text-white min-w-[120px] justify-center backdrop-blur-sm overflow-hidden relative transition-all duration-200
      `}
      style={{ 
        borderColor: isTarget ? '#ffffff' : (isLoading ? color : color),
        borderStyle: isLoading ? 'solid' : undefined,
        boxShadow: isTarget 
          ? `0 0 20px ${color}80` 
          : (isLoading 
              ? `0 0 15px ${color}40`
              : (isDragging ? `0 15px 30px -5px ${color}66` : (isGhost ? undefined : `0 4px 6px -1px ${color}20`)))
      }}
    >
        {/* Loading Overlay */}
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] z-20 rounded-md">
                <Loader2 className="w-5 h-5 animate-spin text-white drop-shadow-md" />
            </div>
        )}

        {/* Background tint */}
        {!isLoading && !isGhost && (
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ backgroundColor: color }} 
          />
        )}
        
        {/* Content opacity reduced when loading */}
        <span className={`text-3xl mr-3 relative z-10 transition-opacity ${isGhost || isLoading ? 'opacity-40' : 'drop-shadow-md'}`}>{element.emoji}</span>
        <span className={`font-medium select-none text-shadow-sm relative z-10 transition-opacity ${isLoading ? 'opacity-40' : ''}`}>{element.name}</span>
    </div>
  );
});
WorkspaceCard.displayName = 'WorkspaceCard';

// Memoized Draggable Item
// This is critical for performance. It only updates if specific props change.
const DraggableItem: React.FC<{
  element: WorkspaceElement;
  containerRef: React.RefObject<HTMLDivElement>;
  onDragStart: (id: string) => void;
  onDrag: (id: string, offset: { x: number, y: number }) => void;
  onDragEnd: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, element: WorkspaceElement) => void;
  zIndex: number;
  isTarget: boolean;
  isDragging: boolean;
}> = memo(({ 
  element, 
  containerRef, 
  onDragStart, 
  onDrag, 
  onDragEnd, 
  zIndex,
  isTarget,
  isDragging
}) => {
  return (
    <motion.div
      drag
      dragMomentum={false} 
      dragElastic={0.1}
      dragConstraints={containerRef}
      onDragStart={() => onDragStart(element.instanceId)}
      onDrag={(e, info) => onDrag(element.instanceId, info.offset)}
      onDragEnd={(e, info) => onDragEnd(e, info, element)}
      whileHover={{ scale: isTarget ? 1.15 : 1.05 }}
      initial={{ x: element.x, y: element.y, scale: 0.5, opacity: 0 }}
      animate={{ 
        x: element.x, 
        y: element.y, 
        scale: isDragging ? 1.1 : (isTarget ? 1.15 : (element.isLoading ? 0.95 : 1)),
        opacity: 1,
        rotate: element.isLoading ? [0, 2, -2, 0] : 0 
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        mass: 0.8,
        rotate: { repeat: element.isLoading ? Infinity : 0, duration: 0.3 } 
      }}
      style={{ 
        position: 'absolute', 
        zIndex,
        touchAction: 'none'
      }}
      className="cursor-grab active:cursor-grabbing"
      onMouseEnter={() => soundService.play('hover')}
    >
      <WorkspaceCard 
        element={element} 
        isTarget={isTarget} 
        isLoading={element.isLoading} 
        isDragging={isDragging}
      />
    </motion.div>
  );
}, (prev, next) => {
  // Custom comparison for performance
  return (
    prev.element.x === next.element.x &&
    prev.element.y === next.element.y &&
    prev.element.isLoading === next.element.isLoading &&
    prev.zIndex === next.zIndex &&
    prev.isTarget === next.isTarget &&
    prev.isDragging === next.isDragging
  );
});
DraggableItem.displayName = 'DraggableItem';


export const Workspace: React.FC<WorkspaceProps> = ({ 
  instances, 
  setInstances, 
  onCombine, 
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onHistorySave
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{ id: string; x: number; y: number } | null>(null);

  // Use callback to keep reference stable
  const updatePosition = useCallback((id: string, x: number, y: number) => {
    setInstances((prev) =>
      prev.map((el) => (el.instanceId === id ? { ...el, x, y } : el))
    );
  }, [setInstances]);

  const handleDragStart = useCallback((id: string) => {
    setDraggedId(id);
    soundService.play('pop');
    // We can't access "instances" directly here if we want this callback stable without re-creating
    // But since we need the current instance position, we rely on the component re-render for initial state,
    // which is fine as drag start happens once.
    // However, for best performance, we just set the ID.
  }, []);

  const handleDrag = useCallback((id: string, offset: { x: number, y: number }) => {
    // We need to look up the element. Since "instances" changes, this function changes.
    // To make this perfectly efficient we would need a ref for instances, but for now
    // the DraggableItem memoization handles the heavy lifting of preventing child re-renders.
    const el = instances.find(i => i.instanceId === id);
    if (el) {
      setDragState({ id, x: el.x + offset.x, y: el.y + offset.y });
    }
  }, [instances]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, element: WorkspaceElement) => {
    setDraggedId(null);
    setDragState(null);
    
    const parent = containerRef.current?.getBoundingClientRect();
    if (!parent) return;

    // Calculate absolute position relative to container
    const x = element.x + info.offset.x;
    const y = element.y + info.offset.y;

    const HIT_RADIUS = 40; 
    
    let combined = false;

    // Find a target
    for (const target of instances) {
      if (target.instanceId === element.instanceId) continue; 
      if (target.isLoading) continue; 

      const dist = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2));
      
      if (dist < HIT_RADIUS) {
        onCombine(element.instanceId, target.instanceId);
        combined = true;
        break; 
      }
    }

    if (!combined) {
      if (info.offset.x !== 0 || info.offset.y !== 0) {
        onHistorySave();
        updatePosition(element.instanceId, x, y);
        soundService.play('click');
      }
    }
  }, [instances, onCombine, onHistorySave, updatePosition]);

  // Calculate target based on current drag position
  const targetId = useMemo(() => {
    if (!dragState) return null;
    const { id, x, y } = dragState;
    const HIT_RADIUS = 40;
    
    let closestId: string | null = null;
    let minDist = Infinity;

    // Optimize loop: only run if we are actually dragging
    if (!dragState) return null;

    for (const target of instances) {
      if (target.instanceId === id || target.isLoading) continue;

      const dist = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2));
      if (dist < HIT_RADIUS && dist < minDist) {
        minDist = dist;
        closestId = target.instanceId;
      }
    }
    return closestId;
  }, [dragState, instances]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full bg-[#1e1e1e] overflow-hidden"
      style={{ 
        backgroundImage: 'radial-gradient(#2a2a2a 1px, transparent 1px)', 
        backgroundSize: '24px 24px' 
      }}
    >
      {/* Floating Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button 
          onClick={onUndo}
          disabled={!canUndo}
          onMouseEnter={() => canUndo && soundService.play('hover')}
          className={`p-3 rounded-full shadow-lg border border-neutral-700 transition-colors
            ${canUndo 
              ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white' 
              : 'bg-neutral-900 text-neutral-700 cursor-not-allowed'}`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={20} />
        </button>
        <button 
          onClick={onRedo}
          disabled={!canRedo}
          onMouseEnter={() => canRedo && soundService.play('hover')}
          className={`p-3 rounded-full shadow-lg border border-neutral-700 transition-colors
            ${canRedo
              ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white' 
              : 'bg-neutral-900 text-neutral-700 cursor-not-allowed'}`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={20} />
        </button>
        <div className="w-px h-10 bg-neutral-800 mx-1"></div>
        <button 
          onClick={onClear}
          onMouseEnter={() => soundService.play('hover')}
          className="p-3 bg-neutral-800 text-neutral-400 rounded-full hover:bg-red-900/50 hover:text-red-400 transition-colors shadow-lg border border-neutral-700"
          title="Clear Workspace"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {instances.map((el) => (
        <React.Fragment key={el.instanceId}>
          {/* Ghost Element (stays at original position when dragging) */}
          {draggedId === el.instanceId && (
            <div 
              className="absolute pointer-events-none z-0"
              style={{ transform: `translate3d(${el.x}px, ${el.y}px, 0)` }}
            >
              <WorkspaceCard element={el} isGhost />
            </div>
          )}

          <DraggableItem
            element={el}
            containerRef={containerRef}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            zIndex={draggedId === el.instanceId ? 50 : (targetId === el.instanceId ? 40 : 1)}
            isTarget={targetId === el.instanceId}
            isDragging={draggedId === el.instanceId}
          />
        </React.Fragment>
      ))}

      {instances.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-neutral-500 mb-2">Workspace</h2>
            <p className="text-neutral-400">Drag items from the right to start creating.</p>
          </div>
        </div>
      )}
    </div>
  );
};