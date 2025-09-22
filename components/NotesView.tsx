import React, { useState, useMemo } from 'react';
import { Note } from '../types';
import { PlusCircleIcon, PinIcon, TrashIcon, XCircleIcon } from './Icons';

const NOTE_COLORS = ['#FFF9C4', '#B3E5FC', '#C8E6C9', '#FFCDD2', '#E1BEE7', '#F0F4C3'];
const NOTE_TEXT_COLORS = ['#5D4037', '#01579B', '#1B5E20', '#B71C1C', '#4A148C', '#33691E'];

interface NoteModalProps {
  note: Note | Partial<Note>;
  onSave: (note: Note) => void;
  onClose: () => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ note: initialNote, onSave, onClose }) => {
  const [note, setNote] = useState<Note | Partial<Note>>(initialNote);

  const handleSave = () => {
    if (!note.title?.trim()) return;
    const finalNote: Note = {
      id: note.id || `note-${Date.now()}`,
      title: note.title,
      content: note.content || '',
      color: note.color || NOTE_COLORS[0],
      isPinned: note.isPinned || false,
      lastModified: new Date().toISOString(),
    };
    onSave(finalNote);
  };
  
  const textColor = useMemo(() => {
    const color = note.color || NOTE_COLORS[0];
    const index = NOTE_COLORS.indexOf(color);
    return NOTE_TEXT_COLORS[index] || 'var(--color-text-primary)';
  }, [note.color]);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start sm:items-center justify-center p-4 pt-12 sm:pt-4 animate-fade-in" onClick={onClose}>
        <div className="glass-card w-full max-w-2xl flex flex-col rounded-2xl h-auto max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()} style={{backgroundColor: note.color || 'var(--color-primary)'}}>
            <div className="p-6 flex-grow overflow-y-auto">
                <input
                    type="text"
                    placeholder="Título de la nota..."
                    value={note.title || ''}
                    onChange={e => setNote({ ...note, title: e.target.value })}
                    className="text-2xl font-bold bg-transparent w-full focus:outline-none mb-4 placeholder:opacity-60"
                    style={{ color: textColor }}
                />
                <textarea
                    placeholder="Escribe tu nota aquí..."
                    value={note.content || ''}
                    onChange={e => setNote({ ...note, content: e.target.value })}
                    rows={15}
                    className="text-base bg-transparent w-full focus:outline-none resize-none placeholder:opacity-60"
                    style={{ color: textColor }}
                />
            </div>
            <div className="p-4 bg-black/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-t border-black/10">
                <div className="flex gap-2 flex-wrap justify-center">
                    {NOTE_COLORS.map((color) => (
                        <button
                            key={color}
                            onClick={() => setNote({ ...note, color })}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-transform ${note.color === color ? 'border-black/50 scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                            aria-label={`Color ${color}`}
                        />
                    ))}
                </div>
                <div className="flex gap-2 self-stretch sm:self-auto">
                    <button onClick={onClose} className="btn btn-secondary flex-1 sm:flex-none">Cancelar</button>
                    <button onClick={handleSave} className="btn btn-primary flex-1 sm:flex-none">Guardar</button>
                </div>
            </div>
        </div>
    </div>
  );
};


interface NotesViewProps {
  notes: Note[];
  onUpdateNotes: (notes: Note[]) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ notes, onUpdateNotes }) => {
  const [editingNote, setEditingNote] = useState<Note | Partial<Note> | null>(null);

  const handleSaveNote = (noteToSave: Note) => {
    const existing = notes.find(n => n.id === noteToSave.id);
    let updatedNotes;
    if (existing) {
      updatedNotes = notes.map(n => (n.id === noteToSave.id ? noteToSave : n));
    } else {
      updatedNotes = [noteToSave, ...notes];
    }
    onUpdateNotes(updatedNotes);
    setEditingNote(null);
  };
  
  const handleDeleteNote = (id: string) => {
    onUpdateNotes(notes.filter(n => n.id !== id));
  };
  
  const handleTogglePin = (id: string) => {
      const updatedNotes = notes.map(n => n.id === id ? {...n, isPinned: !n.isPinned} : n);
      onUpdateNotes(updatedNotes);
  };
  
  const sortedNotes = useMemo(() => {
      return [...notes].sort((a,b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      });
  }, [notes]);

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[--color-text-primary]">Mis Notas</h1>
          <p className="text-[--color-text-secondary]">Tu espacio personal para ideas y recordatorios.</p>
        </div>
        <button onClick={() => setEditingNote({})} className="btn btn-primary self-stretch sm:self-auto">
          <PlusCircleIcon className="w-5 h-5"/> <span className="hidden sm:inline">Crear Nota</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedNotes.map(note => {
            const textColor = NOTE_TEXT_COLORS[NOTE_COLORS.indexOf(note.color)] || 'var(--color-text-primary)';
            return (
                <div 
                    key={note.id} 
                    className="rounded-lg shadow-md flex flex-col justify-between break-inside-avoid-column cursor-pointer transform hover:-translate-y-1 transition-transform"
                    style={{ backgroundColor: note.color, color: textColor }}
                    onClick={() => setEditingNote(note)}
                >
                    <div className="p-5">
                        <h3 className="font-bold text-lg mb-2">{note.title}</h3>
                        <p className="text-sm opacity-80 whitespace-pre-wrap">{note.content.substring(0, 150)}{note.content.length > 150 ? '...' : ''}</p>
                    </div>
                    <div className="p-3 flex justify-between items-center bg-black/5">
                        <span className="text-xs opacity-60">
                            {new Date(note.lastModified).toLocaleDateString('es-AR')}
                        </span>
                        <div className="flex items-center">
                            <button onClick={(e) => { e.stopPropagation(); handleTogglePin(note.id); }} className={`p-1 rounded-full hover:bg-black/20 ${note.isPinned ? 'opacity-100' : 'opacity-50'}`} title="Fijar nota">
                                <PinIcon className="w-5 h-5" isFilled={note.isPinned} />
                            </button>
                             <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="p-1 rounded-full hover:bg-black/20 opacity-50 hover:opacity-100" title="Eliminar nota">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )
        })}
      </div>
      
      {editingNote && (
          <NoteModal 
            note={editingNote}
            onSave={handleSaveNote}
            onClose={() => setEditingNote(null)}
          />
      )}
    </div>
  );
};