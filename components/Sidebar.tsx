import React from 'react';
import { 
  Plus, 
  FileText, 
  Star, 
  Trash2, 
  Folder, 
  Search,
  Settings,
  ChevronRight,
  Menu
} from 'lucide-react';
import { Folder as FolderType } from '../types';

interface SidebarProps {
  folders: FolderType[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
  onCreateNote: () => void;
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateNote,
  isOpen,
  onToggle,
  isMobile
}) => {
  
  if (isMobile && !isOpen) {
    return null; 
  }

  const systemFolders = folders.filter(f => f.type === 'system');
  // In a real app, we'd allow custom folder creation. For this demo, we stick to system mainly.

  return (
    <div className={`
      flex flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
      h-full transition-all duration-300 ease-in-out
      ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64 shadow-2xl' : 'w-64 relative'}
    `}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-100">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
            <FileText size={18} />
          </div>
          <span>Lumina</span>
        </div>
        {isMobile && (
           <button onClick={onToggle} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800">
             <ChevronRight size={20} className="text-gray-500" />
           </button>
        )}
      </div>

      {/* New Note Button */}
      <div className="px-4 mb-6">
        <button
          onClick={() => {
            onCreateNote();
            if (isMobile) onToggle();
          }}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus size={18} />
          <span>New Note</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Library
        </div>
        
        {systemFolders.map(folder => {
          const Icon = folder.id === 'all' ? FileText :
                       folder.id === 'favorites' ? Star :
                       folder.id === 'trash' ? Trash2 : Folder;
          
          const isSelected = selectedFolderId === folder.id;

          return (
            <button
              key={folder.id}
              onClick={() => {
                onSelectFolder(folder.id);
                if (isMobile) onToggle();
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isSelected 
                  ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm border border-gray-100 dark:border-gray-700' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
              `}
            >
              <Icon size={18} className={isSelected ? 'text-primary-600' : 'text-gray-400'} />
              <span>{folder.name}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Footer Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <Settings size={14} />
          <span>v1.0.0 • Pro</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
