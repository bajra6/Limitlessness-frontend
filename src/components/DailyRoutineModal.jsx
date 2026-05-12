import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

export default function DailyRoutineModal({ isOpen, onClose, routine, setRoutine, currentDate }) {
  const [todayRoutine, setTodayRoutine] = useState({});
  const [habitInputs, setHabitInputs] = useState({ activity: '', points: 0 });

  // Initialize today's routine - copy from previous day if no entry exists
  useEffect(() => {
    if (isOpen) {
      let currentRoutine = routine[currentDate] || {};

      // If no entry for today, copy from previous day
      if (Object.keys(currentRoutine).length === 0) {
        const dates = Object.keys(routine).sort().reverse();
        for (const date of dates) {
          if (date !== currentDate && routine[date]) {
            currentRoutine = { ...routine[date] };
            // Reset completedToday for the new day
            Object.keys(currentRoutine).forEach(id => {
              currentRoutine[id] = { ...currentRoutine[id], completedToday: false };
            });
            break;
          }
        }
      }

      setTodayRoutine(currentRoutine);
    }
  }, [isOpen, routine, currentDate]);

  const handleToggleHabit = (habitId) => {
    const updated = { ...todayRoutine };
    updated[habitId] = { ...updated[habitId], completedToday: !updated[habitId].completedToday };
    setTodayRoutine(updated);

    // Update the main routine state
    const mainUpdated = { ...routine };
    if (!mainUpdated[currentDate]) {
      mainUpdated[currentDate] = {};
    }
    mainUpdated[currentDate] = updated;
    setRoutine(mainUpdated);
  };

  const handleAddHabit = () => {
    if (habitInputs.activity.trim()) {
      const newId = Date.now().toString();
      const newHabit = {
        activity: habitInputs.activity,
        points: parseInt(habitInputs.points) || 0,
        completedToday: false
      };

      const updated = { ...todayRoutine, [newId]: newHabit };
      setTodayRoutine(updated);

      // Update main routine
      const mainUpdated = { ...routine };
      if (!mainUpdated[currentDate]) {
        mainUpdated[currentDate] = {};
      }
      mainUpdated[currentDate] = updated;
      setRoutine(mainUpdated);

      setHabitInputs({ activity: '', points: 0 });
    }
  };

  const handleRemoveHabit = (habitId) => {
    const updated = { ...todayRoutine };
    delete updated[habitId];
    setTodayRoutine(updated);

    // Update main routine
    const mainUpdated = { ...routine };
    if (mainUpdated[currentDate]) {
      mainUpdated[currentDate] = updated;
    }
    setRoutine(mainUpdated);
  };

  // Calculate weekly and monthly progress
  const calculateProgress = () => {
    const today = new Date(currentDate.split('-').reverse().join('-'));
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const weekData = {};
    const monthData = {};

    // Collect data for each habit
    Object.keys(todayRoutine).forEach(habitId => {
      const habit = todayRoutine[habitId];
      weekData[habit.activity] = { completed: 0, total: 0 };
      monthData[habit.activity] = { completed: 0, total: 0 };
    });

    // Go through all routine entries
    Object.entries(routine).forEach(([date, dayRoutine]) => {
      const entryDate = new Date(date.split('-').reverse().join('-'));

      // Check if date is in current week
      if (entryDate >= weekStart && entryDate <= today) {
        Object.values(dayRoutine).forEach(habit => {
          if (weekData[habit.activity]) {
            weekData[habit.activity].total++;
            if (habit.completedToday) {
              weekData[habit.activity].completed++;
            }
          }
        });
      }

      // Check if date is in current month
      if (entryDate >= monthStart && entryDate <= today) {
        Object.values(dayRoutine).forEach(habit => {
          if (monthData[habit.activity]) {
            monthData[habit.activity].total++;
            if (habit.completedToday) {
              monthData[habit.activity].completed++;
            }
          }
        });
      }
    });

    return { weekData, monthData };
  };

  const { weekData, monthData } = calculateProgress();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">Daily Routine Manager</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X size={24} className="text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex gap-6 p-6">
          {/* Left Half: Today's Routine Form */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <h3 className="text-lg font-semibold text-white mb-4">Today's Routine</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {Object.entries(todayRoutine).map(([id, habit]) => (
                <div key={id} className="bg-zinc-800/50 p-4 rounded-lg border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => handleToggleHabit(id)}
                        className="flex-shrink-0"
                      >
                        {habit.completedToday ? (
                          <CheckCircle2 size={20} className={habit.points < 0 ? 'text-red-400' : 'text-indigo-400'} />
                        ) : (
                          <Circle size={20} className={habit.points < 0 ? 'text-red-600' : 'text-zinc-600'} />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${habit.completedToday ? 'text-indigo-300' : 'text-white'}`}>
                          {habit.activity}
                        </p>
                        <p className={`mono-text text-xs ${habit.points < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                          {habit.points > 0 ? '+' : ''}{habit.points} points
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveHabit(id)}
                      className="p-1 hover:bg-red-600/20 text-red-400 rounded transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add new habit form */}
              <div className="bg-zinc-800/50 p-4 rounded-lg border border-white/10 space-y-3">
                <h4 className="text-sm font-medium text-white">Add New Habit</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Habit name"
                    value={habitInputs.activity}
                    onChange={(e) => setHabitInputs(prev => ({ ...prev, activity: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded text-sm outline-none focus:border-indigo-500/50"
                  />
                  <input
                    type="number"
                    placeholder="Points"
                    value={habitInputs.points}
                    onChange={(e) => setHabitInputs(prev => ({ ...prev, points: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded text-sm outline-none focus:border-indigo-500/50"
                  />
                  <button
                    onClick={handleAddHabit}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded text-sm transition flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Add Habit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Half: Progress */}
          <div className="flex-1 flex flex-col overflow-hidden border-l border-white/10 pl-6">
            <h3 className="text-lg font-semibold text-white mb-4">Progress Overview</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
              {/* Weekly Progress */}
              <div>
                <h4 className="text-md font-medium text-white mb-3">This Week</h4>
                <div className="space-y-2">
                  {Object.entries(weekData).map(([activity, data]) => {
                    const percentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                    return (
                      <div key={activity} className="bg-zinc-800/50 p-3 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-white font-medium">{activity}</p>
                          <p className="text-xs text-zinc-400">{data.completed}/{data.total}</p>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-indigo-400 mt-1">{percentage}% success rate</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Progress */}
              <div>
                <h4 className="text-md font-medium text-white mb-3">This Month</h4>
                <div className="space-y-2">
                  {Object.entries(monthData).map(([activity, data]) => {
                    const percentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                    return (
                      <div key={activity} className="bg-zinc-800/50 p-3 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-white font-medium">{activity}</p>
                          <p className="text-xs text-zinc-400">{data.completed}/{data.total}</p>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-red-400 mt-1">{percentage}% success rate</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg text-sm font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
