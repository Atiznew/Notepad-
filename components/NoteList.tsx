import React, { useMemo, useState } from 'react';
import { Note } from '../types';
import { Search, Archive } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  folderName: string;
}

const NoteList: React.FC<NoteListProps> = ({ 
  notes, 
  selectedNoteId, 
  onSelectNote,
  folderName
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes;
    const lowerQ = searchQuery.toLowerCase();
    return notes.filter(n => 
      n.title.toLowerCase().includes(lowerQ) || 
      n.content.toLowerCase().includes(lowerQ)
    );
  }, [notes, searchQuery]);

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-full md:w-80 lg:w-96 flex-shrink-0">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 capitalize">{folderName}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Archive size={48} className="mb-2 opacity-20" />
            <p className="text-sm">No notes found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredNotes.map(note => (
              <li key={note.id}>
                <button
                  onClick={() => onSelectNote(note.id)}
                  className={`
                    w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                    ${selectedNoteId === note.id ? 'bg-primary-50 dark:bg-gray-800 border-l-4 border-primary-500' : 'border-l-4 border-transparent'}
                  `}
                >
                  <h3 className={`font-semibold text-sm mb-1 truncate ${selectedNoteId === note.id ? 'text-primary-700 dark:text-primary-400' : 'text-gray-800 dark:text-gray-200'}`}>
                    {note.title || 'Untitled Note'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
                    {note.content.substring(0, 60) || 'No content...'}
                  </p>
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                      {formatDate(note.updatedAt)}
                    </span>
                    {note.isFavorite && (
                      <span className="text-amber-400 text-[10px]">★</span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NoteList;
