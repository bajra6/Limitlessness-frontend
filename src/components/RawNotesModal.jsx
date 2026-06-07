import React, { useState, useEffect } from 'react';
import { API_BASE } from '../api';
import { X, Plus, ArrowLeft } from 'lucide-react';
import { formatDateTime, formatDate } from '../utils';

export default function RawNotesModal({ isOpen, onClose, userId }) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  // Fetch notes on modal open
  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE}/api/notes?userId=${userId}`);
      const data = await response.json();
      
      // Transform array format to object format for backward compatibility
      const notesMap = {};
      if (Array.isArray(data.notes)) {
        data.notes.forEach(note => {
          // Use MongoDB _id as unique key
          const noteId = note._id;
          notesMap[noteId] = {
            title: note.title,
            content: note.content,
            date: note.date || formatDate(new Date(note.createdAt)),
            timestamp: noteId
          };
        });
      }
      setNotes(notesMap);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      setError('Failed to load notes');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (formData.title.trim() && formData.content.trim()) {
      try {
        setError('');
        const now = new Date();
        const response = await fetch(`${API_BASE}/api/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            title: formData.title,
            content: formData.content,
            date: formatDate(now)
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create note');
        }

        // Refresh notes list
        await fetchNotes();
        setFormData({ title: '', content: '' });
        setIsAddingNote(false);
      } catch (err) {
        console.error('Failed to create note:', err);
        setError('Failed to create note');
      }
    }
  };

  const notesList = Object.entries(notes)
    .map(([timestamp, note]) => {
      // Handle both string format (legacy) and object format (new)
      const noteObj = typeof note === 'string' ? { title: 'Untitled', content: note, date: timestamp.split(' ')[0], timestamp } : note;
      return [timestamp, noteObj];
    })
    .sort(([dateA], [dateB]) => {
      const a = new Date(dateA.split(' ')[0].split('-').reverse().join('-'));
      const b = new Date(dateB.split(' ')[0].split('-').reverse().join('-'));
      return b - a;
    });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            {selectedNote && (
              <button
                onClick={() => setSelectedNote(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <ArrowLeft size={20} className="text-zinc-400" />
              </button>
            )}
            <h2 className="text-2xl font-bold text-white">
              {selectedNote ? selectedNote.title : 'Raw Notes'}
            </h2>
          </div>
          <div className="flex gap-3 items-center">
            {!isAddingNote && !selectedNote && (
              <button
                onClick={() => setIsAddingNote(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
              >
                <Plus size={16} /> Add Note
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <X size={24} className="text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        {selectedNote ? (
          // View single note
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-2">{selectedNote.title}</h3>
              <p className="text-xs text-zinc-500 mb-4">{selectedNote.date}</p>
              <p className="text-white whitespace-pre-wrap leading-relaxed">{selectedNote.content}</p>
            </div>
          </div>
        ) : isAddingNote ? (
          // Add note mode
          <div className="flex-1 overflow-hidden flex gap-6 p-6">
            {/* Left Half: Previous Notes */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <h3 className="text-lg font-semibold text-white mb-4">Previous Notes</h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-3">
                  {notesList.length === 0 ? (
                    <p className="text-zinc-400 text-sm text-center py-8 col-span-2">No notes yet</p>
                  ) : (
                    notesList.map(([timestamp, note]) => (
                      <div
                        key={timestamp}
                        onClick={() => setSelectedNote(note)}
                        className="bg-zinc-800/50 p-3 rounded-lg border border-white/10 cursor-pointer hover:border-indigo-500/50 hover:bg-zinc-800/70 transition min-h-24"
                      >
                        <p className="text-white font-medium text-sm">{note.title || 'Untitled'}</p>
                        <p className="text-zinc-400 text-xs mt-2 line-clamp-2">{note.content}</p>
                        <p className="text-xs text-zinc-500 mt-2">{note.date}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Half: Form */}
            <div className="flex-1 flex flex-col overflow-hidden border-l border-white/10 pl-6">
              <h3 className="text-lg font-semibold text-white mb-4">New Note</h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Note title"
                    className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-2">Content</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write your note..."
                    className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-indigo-500/50 resize-none h-48"
                  />
                </div>

                <div className="text-xs text-zinc-400">
                  Date: {formatDate(new Date())} (auto-filled)
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setIsAddingNote(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        ) : (
          // List view with Google Keep style
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="grid grid-cols-3 gap-4 auto-rows-max">
              {notesList.length === 0 ? (
                <p className="text-zinc-400 text-sm text-center py-8 col-span-3">No notes yet</p>
              ) : (
                notesList.map(([timestamp, note]) => {
                  const contentLines = note.content.split('\n').length;
                  const isLongNote = contentLines > 5 || note.content.length > 200;
                  const colSpan = isLongNote ? 'col-span-2' : '';

                  return (
                    <div
                      key={timestamp}
                      onClick={() => setSelectedNote(note)}
                      className={`bg-zinc-800/50 p-4 rounded-lg border border-white/10 cursor-pointer hover:border-indigo-500/50 hover:bg-zinc-800/70 transition min-h-32 ${colSpan}`}
                    >
                      <p className="text-white font-medium text-sm mb-2">{note.title || 'Untitled'}</p>
                      <p className="text-zinc-400 text-xs line-clamp-4">{note.content}</p>
                      <p className="text-xs text-zinc-500 mt-3">{note.date}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
