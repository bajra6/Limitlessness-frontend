import React from 'react';
import { FileText } from 'lucide-react';

export default function RawNotes({ notes, onOpen }) {
  const noteCount = Object.keys(notes).length;

  return (
    <div
      onClick={onOpen}
      className="glass-tile p-6 flex items-center justify-between h-full cursor-pointer hover:bg-white/5 transition"
    >
      <div className="flex items-center gap-3">
        <FileText size={24} className="text-blue-400" />
        <h3 className="text-lg font-bold text-white">Raw Notes</h3>
      </div>
      <div className="text-right">
        <p className="mono-text text-3xl font-bold text-blue-400">
          {noteCount}
        </p>
      </div>
    </div>
  );
}
