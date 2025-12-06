import React, { useState, useEffect, useRef } from 'react';
import { Note, AIActionType } from '../types';
import { 
  Sparkles, 
  Save, 
  Trash2, 
  Star, 
  MoreVertical,
  Wand2,
  Check,
  X
} from 'lucide-react';
import { performAIAction, streamAIContinuation } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface EditorProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  isMobile: boolean;
  onBack: () => void; // For mobile
}

const Editor: React.FC<EditorProps> = ({ note, onUpdate, onDelete, isMobile, onBack }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isSaving, setIsSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  
  // Debounce updates
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        setIsSaving(true);
        onUpdate(note.id, { title, content, updatedAt: Date.now() });
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 1000);

    return () => clearTimeout(handler);
  }, [title, content, note.id, note.title, note.content, onUpdate]);

  const handleAIAction = async (action: AIActionType) => {
    setAiLoading(true);
    setShowAiMenu(false);
    
    try {
      if (action === AIActionType.CONTINUE_WRITING) {
        await streamAIContinuation(content, (chunk) => {
          setContent(prev => prev + chunk);
        });
      } else {
        const result = await performAIAction(action, content);
        if (action === AIActionType.GENERATE_TITLE) {
          setTitle(result.trim());
        } else if (action === AIActionType.SUMMARIZE) {
          // Append summary to bottom
          setContent(prev => `${prev}\n\n### AI Summary\n${result}`);
        } else if (action === AIActionType.FIX_GRAMMAR) {
          setContent(result);
        } else if (action === AIActionType.MAKE_LONGER) {
          setContent(result);
        }
      }
    } catch (e) {
      alert("AI Action Failed: " + (e as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 w-full relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
         <div className="flex items-center gap-3">
           {isMobile && (
             <button onClick={onBack} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
               <X size={20} />
             </button>
           )}
           <span className="text-xs text-gray-400 font-mono">
             {isSaving ? 'Saving...' : 'Saved'}
           </span>
         </div>

         <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsPreview(!isPreview)}
              className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white text-xs font-medium bg-gray-100 dark:bg-gray-800 rounded-md"
            >
              {isPreview ? 'Edit' : 'Preview'}
            </button>
            <button 
              onClick={() => onUpdate(note.id, { isFavorite: !note.isFavorite })}
              className={`p-2 rounded-md transition-colors ${note.isFavorite ? 'text-amber-400' : 'text-gray-400 hover:text-amber-400'}`}
            >
              <Star size={18} fill={note.isFavorite ? "currentColor" : "none"} />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowAiMenu(!showAiMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md hover:opacity-90 transition-opacity shadow-sm"
              >
                {aiLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                <span className="text-sm font-medium">AI Assist</span>
              </button>
              
              {showAiMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden animation-fade-in">
                  <div className="p-1">
                    <button onClick={() => handleAIAction(AIActionType.FIX_GRAMMAR)} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                      <Check size={14} className="text-green-500" /> Fix Grammar
                    </button>
                    <button onClick={() => handleAIAction(AIActionType.CONTINUE_WRITING)} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                      <Wand2 size={14} className="text-purple-500" /> Continue Writing
                    </button>
                    <button onClick={() => handleAIAction(AIActionType.SUMMARIZE)} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                      <MoreVertical size={14} className="text-blue-500" /> Summarize
                    </button>
                    <button onClick={() => handleAIAction(AIActionType.GENERATE_TITLE)} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                      <Sparkles size={14} className="text-amber-500" /> Generate Title
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => onDelete(note.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
         </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Note"
            className="w-full text-4xl font-bold text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-700 border-none bg-transparent focus:outline-none focus:ring-0 mb-6"
          />
          
          {isPreview ? (
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing..."
              className="w-full h-[calc(100vh-250px)] resize-none text-lg text-gray-700 dark:text-gray-300 bg-transparent border-none focus:outline-none focus:ring-0 leading-relaxed editor-textarea"
              spellCheck={false}
            />
          )}
        </div>
      </div>
      
      {/* Background click handler to close menu */}
      {showAiMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowAiMenu(false)} />
      )}
    </div>
  );
};

export default Editor;
