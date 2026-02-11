import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, Upload, Calendar } from 'lucide-react';
import { WorkspaceSnapshot } from '../types';

interface SnapshotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: WorkspaceSnapshot[];
  onSave: (name: string) => void;
  onLoad: (snapshot: WorkspaceSnapshot) => void;
  onDelete: (id: string) => void;
}

export const SnapshotsModal: React.FC<SnapshotsModalProps> = ({
  isOpen,
  onClose,
  snapshots,
  onSave,
  onLoad,
  onDelete
}) => {
  const [newName, setNewName] = useState('');

  const handleSave = () => {
    if (!newName.trim()) return;
    onSave(newName);
    setNewName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
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
          className="bg-neutral-900 border border-neutral-700 w-full max-w-md p-6 rounded-xl shadow-2xl relative flex flex-col max-h-[80vh]"
        >
          <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4 shrink-0">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Save className="w-5 h-5 text-amber-500" />
              Snapshots
            </h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Create New Snapshot */}
          <div className="mb-6 shrink-0">
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Save Current Workspace
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Name your snapshot..."
                className="flex-1 bg-neutral-800 border border-neutral-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <button
                onClick={handleSave}
                disabled={!newName.trim()}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2
                  ${newName.trim() 
                    ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'}`}
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </div>

          {/* List Snapshots */}
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 sticky top-0 bg-neutral-900 py-1 z-10">
              Saved Snapshots
            </label>
            
            {snapshots.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                <p>No snapshots saved yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {snapshots.map((snapshot) => (
                  <div 
                    key={snapshot.id}
                    className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-3 hover:border-neutral-600 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-white">{snapshot.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(snapshot.timestamp).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>{snapshot.elements.length} items</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => onDelete(snapshot.id)}
                        className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-700 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Snapshot"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => onLoad(snapshot)}
                      className="w-full mt-2 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 text-sm rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload size={14} />
                      Load Snapshot
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};