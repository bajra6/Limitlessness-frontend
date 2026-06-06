import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

export default function DailyRoutineModal({ isOpen, onClose, routine, userId, currentDate, refreshDashboard }) {
  const [newRoutine, setNewRoutine] = useState({ title: '', targetScore: '' });
  const [stats, setStats] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setNewRoutine({ title: '', targetScore: '' });
      setStats([]);
    } else {
      fetchRoutineStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId, currentDate]);

  const fetchRoutineStats = async () => {
    if (!userId) return;
    setIsLoadingStats(true);
    try {
      const response = await fetch(`http://localhost:5000/api/routine-logs/stats?userId=${userId}&date=${currentDate}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load stats');
      setStats(data.stats || []);
    } catch (err) {
      console.error('Failed to load routine stats', err);
      setStats([]);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleAddRoutine = async () => {
    if (!newRoutine.title.trim() || newRoutine.targetScore === '') return;
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: newRoutine.title.trim(),
          targetScore: Number(newRoutine.targetScore)
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add routine');
      setNewRoutine({ title: '', targetScore: '' });
      await refreshDashboard?.();
      await fetchRoutineStats();
    } catch (err) {
      console.error('Failed to add routine', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoutine = async (routineId) => {
    if (!routineId) return;
    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/routines/${routineId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete routine');
      await refreshDashboard?.();
      await fetchRoutineStats();
    } catch (err) {
      console.error('Failed to delete routine', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleRoutine = async (item) => {
    if (!item || !item._id) return;
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/routine-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          routineId: item._id,
          date: currentDate,
          isCompleted: !item.isCompleted
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update routine completion');
      await refreshDashboard?.();
      await fetchRoutineStats();
    } catch (err) {
      console.error('Failed to toggle routine', err);
    } finally {
      setIsSaving(false);
    }
  };

  const statsMap = stats.reduce((acc, stat) => {
    acc[stat._id] = stat;
    return acc;
  }, {});

  const todayCount = Array.isArray(routine) ? routine.filter((item) => item.isCompleted).length : 0;
  const totalCount = Array.isArray(routine) ? routine.length : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white">Daily Routine Manager</h2>
            <p className="text-sm text-zinc-400 mt-1">Click a routine to mark it complete for today.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition">
            <X size={24} className="text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex gap-6 p-6">
          <div className="w-2/5 bg-zinc-900/50 p-6 rounded-3xl border border-white/10 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-white">Routines</h3>
                <p className="text-xs text-zinc-400 mt-1">Today: {todayCount}/{totalCount} completed</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-zinc-950/70 text-zinc-300">{isSaving ? 'Saving...' : 'Live'}</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
              {Array.isArray(routine) && routine.length > 0 ? (
                routine.map((item) => (
                  <div
                    key={item._id}
                    className={`p-4 rounded-3xl border transition cursor-pointer ${
                      item.isCompleted ? 'bg-indigo-950/30 border-indigo-500/40' : 'bg-zinc-950/50 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleRoutine(item)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        {item.isCompleted ? (
                          <CheckCircle2 size={20} className="text-indigo-400" />
                        ) : (
                          <Circle size={20} className="text-zinc-500" />
                        )}
                        <div>
                          <p className={`text-sm font-medium ${item.isCompleted ? 'text-indigo-300' : 'text-white'}`}>{item.title}</p>
                          <p className="text-xs text-zinc-400">{item.targetScore > 0 ? '+' : ''}{item.targetScore} points</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRoutine(item._id)}
                        className="p-2 bg-red-600/10 hover:bg-red-600/20 text-red-300 rounded-full transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">No routines found. Add one below.</p>
              )}
            </div>

            <div className="mt-5">
              {!showAddForm ? (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Routine
                </button>
              ) : (
                <div className="bg-zinc-950/60 p-4 rounded-3xl border border-white/10 space-y-3">
                  <input
                    type="text"
                    value={newRoutine.title}
                    onChange={(e) => setNewRoutine((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Routine title"
                    className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-xl text-sm outline-none focus:border-indigo-500/50"
                  />
                  <input
                    type="number"
                    value={newRoutine.targetScore}
                    onChange={(e) => setNewRoutine((prev) => ({ ...prev, targetScore: e.target.value }))}
                    placeholder="Points"
                    className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-xl text-sm outline-none focus:border-indigo-500/50"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={async () => { await handleAddRoutine(); setShowAddForm(false); }}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-2xl text-sm font-medium transition"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => { setNewRoutine({ title: '', targetScore: '' }); setShowAddForm(false); }}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-2xl text-sm font-medium transition"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-3/5 bg-zinc-900/50 p-6 rounded-3xl border border-white/10 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-white">Progress</h3>
                <p className="text-sm text-zinc-400 mt-1">Last 1 week, 1 month, and 1 year counts for each routine.</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-zinc-950/70 text-zinc-300">{isLoadingStats ? 'Refreshing' : 'Updated'}</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
              {isLoadingStats ? (
                <p className="text-sm text-zinc-400">Loading progress...</p>
              ) : stats.length === 0 ? (
                <p className="text-sm text-zinc-500">No progress history available yet.</p>
              ) : (
                stats.map((item) => (
                  <div key={item._id} className="bg-zinc-950/60 p-4 rounded-3xl border border-white/10">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <p className="text-xs text-zinc-400">{item.targetScore > 0 ? '+' : ''}{item.targetScore} points</p>
                      </div>
                      <div className="text-xs text-zinc-400">{statsMap[item._id] ? 'Tracked' : 'No data'}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-zinc-900/80 p-3 rounded-2xl">
                        <p className="text-xs uppercase text-zinc-500">1 Week</p>
                        <p className="text-2xl font-semibold text-indigo-300 mt-2">{item.counts.week}</p>
                      </div>
                      <div className="bg-zinc-900/80 p-3 rounded-2xl">
                        <p className="text-xs uppercase text-zinc-500">1 Month</p>
                        <p className="text-2xl font-semibold text-indigo-300 mt-2">{item.counts.month}</p>
                      </div>
                      <div className="bg-zinc-900/80 p-3 rounded-2xl">
                        <p className="text-xs uppercase text-zinc-500">1 Year</p>
                        <p className="text-2xl font-semibold text-indigo-300 mt-2">{item.counts.year}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer removed — modal uses top-right close button */}
      </div>
    </div>
  );
}
