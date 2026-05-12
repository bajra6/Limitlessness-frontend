import React from 'react';
import { Trophy } from 'lucide-react';

export default function AchievementsLog({ achievements, onOpen }) {
  return (
    <div
      onClick={onOpen}
      className="glass-tile p-6 flex items-center justify-between h-full cursor-pointer hover:bg-white/5 transition"
    >
      <div className="flex items-center gap-3">
        <Trophy size={24} className="text-yellow-400" />
        <h3 className="text-lg font-bold text-white">Achievements</h3>
      </div>
      <div className="text-right">
        <p className="mono-text text-3xl font-bold text-yellow-400">
          {achievements.length}
        </p>
        <p className="text-xs text-zinc-400 mt-1">total</p>
      </div>
    </div>
  );
}
