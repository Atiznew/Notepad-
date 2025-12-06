import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import Editor from './components/Editor';
import { Note, Folder } from './types';
import { Menu } from 'lucide-react';

const SYSTEM_FOLDERS: Folder[] = [
  { id: 'all', name: 'All Notes', type: 'system' },
  { id: 'favorites', name: 'Favorites', type: 'system' },
  { id: 'trash', name: 'Trash', type: 'system' }
];

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Responsive State
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isMobile = windowWidth < 768;

  // Load Initial Data
  useEffect(() => {
    const saved = localStorage.getItem('lumina_notes');
    if (saved) {
      setNotes(JSON.parse(saved));
    } else {
      // Default Welcome Note
      const welcomeNote: Note = {
        id: 'welcome-1',
        title: 'Welcome to Lumina',
        content: '# Welcome to Lumina Notes\n\nThis is your new professional workspace.\n\n## Features\n- **AI Powered**: Click the "AI Assist" button to summarize, fix grammar, or continue writing.\n- **Markdown Support**: Toggle Preview mode to see rich text.\n- **Organized**: Use Favorites and Trash to manage your workflow.\n\nStart typing to create your own thoughts!',
        folderId: 'all',
        isFavorite: false,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: []
      };
      setNotes([welcomeNote]);
    }
  }, []);

  // Save Data
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('lumina_notes', JSON.stringify(notes));
    }
  }, [notes]);

  const createNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      folderId: 'all', // For simplicity, all new notes go to 'all' implicitly, or we could use custom folders later
      isFavorite: false,
      isDeleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: []
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const deleteNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    if (note.isDeleted) {
      // Permanent delete
      setNotes(prev => prev.filter(n => n.id !== id));
      setSelectedNoteId(null);
    } else {
      // Move to trash
      updateNote(id, { isDeleted: true, folderId: 'trash' });
      if (selectedFolderId !== 'trash') {
        setSelectedNoteId(null); // Deselect if we are not in trash view
      }
    }
  };

  const filteredNotes = notes.filter(note => {
    if (selectedFolderId === 'favorites') return note.isFavorite && !note.isDeleted;
    if (selectedFolderId === 'trash') return note.isDeleted;
    return !note.isDeleted; // 'all' and custom folders show non-deleted
  }).sort((a, b) => b.updatedAt - a.updatedAt);

  const activeNote = notes.find(n => n.id === selectedNoteId);

  // Layout Logic
  // Mobile: 
  //   Step 1: List View (Sidebar + NoteList). 
  //   Step 2: Editor View (Covering everything).
  // Desktop: Sidebar | NoteList | Editor

  return (
    <div className="flex h-full w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* Mobile Toggle Overlay for Sidebar */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <Sidebar 
        folders={SYSTEM_FOLDERS}
        selectedFolderId={selectedFolderId}
        onSelectFolder={(id) => {
           setSelectedFolderId(id);
           setSelectedNoteId(null);
        }}
        onCreateNote={createNote}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Mobile Header (when editor not active) */}
        {isMobile && !selectedNoteId && (
           <button 
             onClick={() => setSidebarOpen(true)}
             className="absolute top-4 left-4 z-30 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md text-gray-700 dark:text-gray-200"
           >
             <Menu size={20} />
           </button>
        )}

        {/* Note List Panel */}
        {/* On Mobile: Hidden if note is selected */}
        {(!isMobile || !selectedNoteId) && (
          <div className={`${isMobile ? 'w-full' : 'w-auto'} h-full flex`}>
             <NoteList 
               notes={filteredNotes} 
               selectedNoteId={selectedNoteId}
               onSelectNote={setSelectedNoteId}
               folderName={SYSTEM_FOLDERS.find(f => f.id === selectedFolderId)?.name || 'Notes'}
             />
          </div>
        )}

        {/* Editor Panel */}
        {/* On Mobile: Full screen if note selected. On Desktop: Flex 1 */}
        {selectedNoteId ? (
          activeNote ? (
            <div className={`flex-1 h-full z-10 ${isMobile ? 'absolute inset-0 bg-white' : ''}`}>
              <Editor 
                note={activeNote}
                onUpdate={updateNote}
                onDelete={deleteNote}
                isMobile={isMobile}
                onBack={() => setSelectedNoteId(null)}
              />
            </div>
          ) : (
             <div className="flex-1 flex items-center justify-center text-gray-400">Note not found</div>
          )
        ) : (
          !isMobile && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                 <div className="w-8 h-8 border-2 border-gray-400 rounded-lg"></div>
              </div>
              <p className="font-medium">Select a note to view</p>
            </div>
          )
        )}

      </div>
    </div>
  );
};

export default App;
