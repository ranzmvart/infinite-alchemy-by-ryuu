import React, { useState, useEffect, useCallback } from 'react';
import { AlchemyElement, WorkspaceElement, WorkspaceSnapshot } from './types';
import { INITIAL_ELEMENTS } from './constants';
import { Sidebar } from './components/Sidebar';
import { Workspace } from './components/Workspace';
import { DiscoveryOverlay } from './components/DiscoveryOverlay';
import { SettingsModal } from './components/SettingsModal';
import { SnapshotsModal } from './components/SnapshotsModal';
import { IntroScreen } from './components/IntroScreen';
import { combineElements, hasValidKey } from './services/alchemyService';
import { soundService } from './services/soundService';
import { Loader2, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Simple UUID generator fallback
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  // Game State
  const [hasEntered, setHasEntered] = useState(false);

  const [library, setLibrary] = useState<AlchemyElement[]>(INITIAL_ELEMENTS);
  
  // Initialize workspace with Time element as requested
  // Position updated to be safe for mobile screens
  const [workspaceInstances, setWorkspaceInstances] = useState<WorkspaceElement[]>([
    {
      id: 'time',
      name: 'Time',
      emoji: '⏳',
      description: 'The indefinite continued progress of existence and events.',
      color: '#a8a29e',
      instanceId: 'initial-time',
      x: 100, 
      y: 150,
    }
  ]);
  
  // History State
  const [history, setHistory] = useState<WorkspaceElement[][]>([]);
  const [future, setFuture] = useState<WorkspaceElement[][]>([]);

  const [newDiscovery, setNewDiscovery] = useState<AlchemyElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.2); // Default volume

  // Snapshots State
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [snapshots, setSnapshots] = useState<WorkspaceSnapshot[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const savedLibrary = localStorage.getItem('alchemy_library');
    if (savedLibrary) {
      setLibrary(JSON.parse(savedLibrary));
    }

    const savedVol = localStorage.getItem('alchemy_music_volume');
    if (savedVol) {
      const vol = parseFloat(savedVol);
      setMusicVolume(vol);
      // We don't set volume on service yet, wait for entry
    }

    const savedSnapshots = localStorage.getItem('alchemy_snapshots');
    if (savedSnapshots) {
      setSnapshots(JSON.parse(savedSnapshots));
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('alchemy_library', JSON.stringify(library));
  }, [library]);

  const handleEnterGame = () => {
    soundService.resumeContext();
    soundService.startAmbientMusic();
    soundService.setMusicVolume(musicVolume);
    soundService.play('success'); // Play a sound on entry
    setHasEntered(true);
  };

  const handleVolumeChange = (vol: number) => {
    setMusicVolume(vol);
    soundService.setMusicVolume(vol);
    localStorage.setItem('alchemy_music_volume', vol.toString());
  };

  // --- Snapshot Management ---
  const handleSaveSnapshot = (name: string) => {
    const newSnapshot: WorkspaceSnapshot = {
      id: generateId(),
      name,
      timestamp: Date.now(),
      elements: workspaceInstances
    };
    const updated = [newSnapshot, ...snapshots];
    setSnapshots(updated);
    localStorage.setItem('alchemy_snapshots', JSON.stringify(updated));
    soundService.play('success');
  };

  const handleLoadSnapshot = (snapshot: WorkspaceSnapshot) => {
    saveHistory(); // Save current state before overwriting
    setWorkspaceInstances(snapshot.elements);
    soundService.play('discovery'); 
    setShowSnapshots(false);
  };

  const handleDeleteSnapshot = (id: string) => {
    const updated = snapshots.filter(s => s.id !== id);
    setSnapshots(updated);
    localStorage.setItem('alchemy_snapshots', JSON.stringify(updated));
    soundService.play('clear');
  };

  // --- History Management ---

  const saveHistory = useCallback(() => {
    setHistory(prev => [...prev, workspaceInstances]);
    setFuture([]); // Clear future on new action
  }, [workspaceInstances]);

  const handleUndo = useCallback(() => {
    if (history.length === 0 || isProcessing) return;
    
    soundService.play('undo');
    
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    
    setFuture(prev => [workspaceInstances, ...prev]);
    setHistory(newHistory);
    setWorkspaceInstances(previous);
  }, [history, workspaceInstances, isProcessing]);

  const handleRedo = useCallback(() => {
    if (future.length === 0 || isProcessing) return;

    soundService.play('undo'); // Reuse undo sound for redo

    const next = future[0];
    const newFuture = future.slice(1);

    setHistory(prev => [...prev, workspaceInstances]);
    setFuture(newFuture);
    setWorkspaceInstances(next);
  }, [future, workspaceInstances, isProcessing]);

  // Keyboard Shortcuts
  useEffect(() => {
    if (!hasEntered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Z or Cmd+Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      // Check for Ctrl+Y or Cmd+Y (Redo on Windows usually)
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, hasEntered]);


  // --- Actions ---

  const handleSpawnElement = (element: AlchemyElement) => {
    saveHistory();
    soundService.play('pop');
    
    // Randomize spawn slightly, keep within visible bounds logic could be added
    // For now, simple random offset
    const newInstance: WorkspaceElement = {
      ...element,
      instanceId: generateId(),
      x: 50 + Math.random() * 50,
      y: 50 + Math.random() * 50,
    };
    setWorkspaceInstances((prev) => [...prev, newInstance]);
  };

  const handleClearWorkspace = () => {
    if (workspaceInstances.length === 0) return;
    saveHistory();
    soundService.play('clear');
    setWorkspaceInstances([]);
  };

  const handleCombine = useCallback(async (idA: string, idB: string) => {
    if (isProcessing) return; 
    
    // Save history before starting combination sequence
    saveHistory();
    soundService.play('click'); // Initial engagement sound

    // Find the elements
    const instA = workspaceInstances.find(i => i.instanceId === idA);
    const instB = workspaceInstances.find(i => i.instanceId === idB);

    if (!instA || !instB) return;

    // Visual Feedback: Set them to loading state
    setWorkspaceInstances(prev => prev.map(el => 
      (el.instanceId === idA || el.instanceId === idB) ? { ...el, isLoading: true } : el
    ));

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // API Call
      const result = await combineElements(instA, instB);

      if (result.success && result.element) {
        const newElement = result.element;
        
        // Check if it's actually new to the library
        const isNewDiscovery = !library.some(l => l.name === newElement.name);
        
        if (isNewDiscovery) {
          soundService.play('discovery');
          setLibrary(prev => [...prev, newElement]);
          setNewDiscovery(newElement);
        } else {
          soundService.play('success');
        }

        // Calculate midpoint for new spawn
        const midX = (instA.x + instB.x) / 2;
        const midY = (instA.y + instB.y) / 2;

        // Remove old instances, Add new one
        setWorkspaceInstances(prev => {
          const filtered = prev.filter(el => el.instanceId !== idA && el.instanceId !== idB);
          return [...filtered, {
            ...newElement,
            instanceId: generateId(),
            x: midX,
            y: midY
          }];
        });
      } else {
        // Handle Failure
        
        // Check if we have a valid key (either global, env, or local)
        const hasKey = hasValidKey();
        
        if (!hasKey) {
            setErrorMsg("Missing API Key");
            setShowSettings(true); // Auto open settings
        }

        // We revert the loading state
        setWorkspaceInstances(prev => prev.map(el => 
          (el.instanceId === idA || el.instanceId === idB) ? { ...el, isLoading: false } : el
        ));
      }
    } catch (e) {
      console.error(e);
      setWorkspaceInstances(prev => prev.map(el => 
        (el.instanceId === idA || el.instanceId === idB) ? { ...el, isLoading: false } : el
      ));
    } finally {
      setIsProcessing(false);
    }
  }, [workspaceInstances, isProcessing, library, saveHistory]);

  return (
    <>
      <AnimatePresence mode="wait">
        {!hasEntered && (
          <IntroScreen key="intro" onEnter={handleEnterGame} />
        )}
      </AnimatePresence>

      <div className={`flex flex-col md:flex-row w-screen h-screen overflow-hidden bg-neutral-900 text-white font-sans transition-opacity duration-1000 ${hasEntered ? 'opacity-100' : 'opacity-0'}`}>
        {/* Workspace Area (Top on Mobile, Left on Desktop) */}
        <div className="flex-grow h-full relative order-1 md:order-1">
          <Workspace 
            instances={workspaceInstances} 
            setInstances={setWorkspaceInstances}
            onCombine={handleCombine}
            onClear={handleClearWorkspace}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={history.length > 0}
            canRedo={future.length > 0}
            onHistorySave={saveHistory}
          />
          
          {/* Loading Indicator for API */}
          {isProcessing && (
            <div className="absolute top-4 right-4 bg-neutral-800/80 backdrop-blur px-4 py-2 rounded-full flex items-center text-sm text-amber-500 shadow-lg pointer-events-none z-50 border border-amber-500/20">
              <Loader2 className="animate-spin mr-2 w-4 h-4" />
              Creating...
            </div>
          )}

          {/* Error Toast */}
          <AnimatePresence>
            {errorMsg && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-20 right-4 bg-red-900/90 backdrop-blur px-4 py-3 rounded-lg flex items-center text-sm text-white shadow-xl z-50 border border-red-500/50 max-w-xs"
                >
                    <AlertCircle className="mr-2 w-5 h-5 flex-shrink-0" />
                    <div>
                        <p className="font-bold">Cannot Combine</p>
                        <p className="text-xs opacity-90">Please add your API Key in Settings.</p>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar (Bottom on Mobile, Right on Desktop) */}
        <div className="w-full md:w-80 h-[35vh] md:h-full flex-shrink-0 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] md:shadow-[-5px_0_15px_rgba(0,0,0,0.5)] order-2 md:order-2 border-t md:border-t-0 md:border-l border-neutral-800">
          <Sidebar 
            library={library} 
            onElementClick={handleSpawnElement} 
            onOpenSettings={() => {
              soundService.play('click');
              setShowSettings(true);
            }}
            onOpenSnapshots={() => {
              soundService.play('click');
              setShowSnapshots(true);
            }}
          />
        </div>

        {/* Discovery Modal */}
        {newDiscovery && (
          <DiscoveryOverlay 
            element={newDiscovery} 
            onClose={() => {
              soundService.play('click');
              setNewDiscovery(null);
            }} 
          />
        )}

        {/* Settings Modal */}
        <SettingsModal 
          isOpen={showSettings}
          onClose={() => {
            soundService.play('click');
            setShowSettings(false);
            setErrorMsg(null);
          }}
          musicVolume={musicVolume}
          onMusicVolumeChange={handleVolumeChange}
        />

        {/* Snapshots Modal */}
        <SnapshotsModal
          isOpen={showSnapshots}
          onClose={() => {
            soundService.play('click');
            setShowSnapshots(false);
          }}
          snapshots={snapshots}
          onSave={handleSaveSnapshot}
          onLoad={handleLoadSnapshot}
          onDelete={handleDeleteSnapshot}
        />
      </div>
    </>
  );
}