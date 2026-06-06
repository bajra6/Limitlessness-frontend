import React from 'react';
import { CheckCircle2, Circle, Info } from 'lucide-react';

export default function DailyRoutineEngine({ routine, setRoutine, totalScore, currentDate, userId, onOpenModal, onToggleRoutine }) {
  const todayRoutine = Array.isArray(routine) ? routine : [];

  const handleToggleHabit = async (habitId) => {
    const habit = routine.find((item) => item._id === habitId);
    if (!habit) return;

    if (onToggleRoutine) {
      await onToggleRoutine(habit);
      return;
    }

    const updated = routine.map((item) => {
      if (item._id !== habitId) return item;
      return {
        ...item,
        isCompleted: !item.isCompleted
      };
    });

    setRoutine(updated);
  };

  const completedCount = todayRoutine.filter(h => h.isCompleted).length;
  const totalCount = todayRoutine.length;

  return (
    <div className="glass-tile p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-white">Daily Routine</h3>
        <button
          onClick={onOpenModal}
          className="p-1 hover:bg-white/10 rounded transition"
          title="View Progress & Edit Routines"
        >
          <Info size={16} className="text-zinc-400" />
        </button>
      </div>
      <p className="text-xs text-zinc-400 mb-4">
        {completedCount}/{totalCount} completed
      </p>

      <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
        {todayRoutine.map((habit) => (
          <div
            key={habit._id}
            onClick={() => handleToggleHabit(habit._id)}
            className={`p-3 rounded-lg border transition cursor-pointer ${
              habit.isCompleted
                ? 'bg-indigo-950/30 border-indigo-500/40'
                : habit.targetScore < 0
                ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/50'
                : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  habit.isCompleted ? 'text-indigo-300' : habit.targetScore < 0 ? 'text-red-300' : 'text-white'
                }`}>
                  {habit.title}
                </p>
                <p className={`mono-text text-xs mt-1 ${habit.targetScore < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                  {habit.targetScore > 0 ? '+' : ''}{habit.targetScore} points
                </p>
              </div>
              <div>
                {habit.isCompleted ? (
                  <CheckCircle2 size={20} className={habit.targetScore < 0 ? 'text-red-400' : 'text-indigo-400'} />
                ) : (
                  <Circle size={20} className={habit.targetScore < 0 ? 'text-red-600' : 'text-zinc-600'} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-4 mt-4">
        <p className="text-xs text-zinc-400">Score earned today</p>
        <p className="mono-text text-lg font-bold text-indigo-300 mt-1">
          {todayRoutine
            .filter(h => h.isCompleted)
            .reduce((sum, h) => sum + h.targetScore, 0)} points
        </p>
      </div>
    </div>
  );
}
