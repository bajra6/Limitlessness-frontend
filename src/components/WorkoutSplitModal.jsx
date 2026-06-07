import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api';
import { X } from 'lucide-react';

const getTodayISO = () => new Date().toISOString().slice(0, 10);

const buildDefaultExercises = () => [
  { id: `exercise-${Date.now()}`, name: '', weight: '', reps: '' }
];

export default function WorkoutSplitModal({ isOpen, onClose, workoutHistory, setWorkoutHistory, currentDate, userId }) {
  const [exercises, setExercises] = useState(buildDefaultExercises());
  const [workoutDate, setWorkoutDate] = useState(getTodayISO());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setExercises(buildDefaultExercises());
    setWorkoutDate(getTodayISO());
    setError('');

    const fetchWorkouts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/workouts?userId=${userId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load workout history');
        }

        setWorkoutHistory(data.workouts || []);
      } catch (fetchError) {
        console.error('Failed to load workouts:', fetchError);
        setError('Unable to load previous workouts.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, [isOpen, setWorkoutHistory, userId]);

  const handleExerciseNameChange = (id, newName) => {
    setExercises(exercises.map((ex) => (ex.id === id ? { ...ex, name: newName } : ex)));
  };

  const handleWeightChange = (id, newWeight) => {
    setExercises(exercises.map((ex) => (ex.id === id ? { ...ex, weight: newWeight } : ex)));
  };

  const handleRepsChange = (id, newReps) => {
    setExercises(exercises.map((ex) => (ex.id === id ? { ...ex, reps: newReps } : ex)));
  };

  // Single-exercise mode: no add/remove handlers

  const parseSets = (weightText, repsText) => {
    const weights = weightText
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const reps = repsText
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    const count = Math.max(weights.length, reps.length);
    const sets = [];

    for (let i = 0; i < count; i += 1) {
      sets.push({
        weight: weights[i] || '',
        reps: reps[i] || ''
      });
    }

    return sets;
  };

  const handleSave = async () => {
    const validExercises = exercises
      .filter((ex) => ex.name.trim())
      .map((ex) => ({
        name: ex.name.trim(),
        sets: parseSets(ex.weight, ex.reps)
      }))
      .filter((ex) => ex.sets.length > 0);

    if (validExercises.length === 0) {
      setError('Add at least one exercise with sets.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          date: workoutDate,
          exercises: validExercises
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save workout');
      }

      // Backend returns `workouts` array for created docs
      if (Array.isArray(data.workouts) && data.workouts.length > 0) {
        setWorkoutHistory([...data.workouts, ...(workoutHistory || [])]);
      } else if (data.workout) {
        setWorkoutHistory([data.workout, ...(workoutHistory || [])]);
      }
      setExercises(buildDefaultExercises());
      setWorkoutDate(getTodayISO());
    } catch (saveError) {
      console.error('Failed to save workout:', saveError);
      setError('Unable to save workout.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Group workouts by date for display
  const groupedByDate = (workoutHistory || []).reduce((acc, w) => {
    const key = w.date || w.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(w);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">Workout Logger</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X size={24} className="text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex gap-6 p-6">
          {/* Left Half: Input Section */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Log a Workout</h3>
                <p className="text-sm text-zinc-400">Enter weights as x, x, x and reps as y, y, y per exercise.</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm text-zinc-300">Date</label>
                <input
                  type="date"
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                  className="bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {exercises.slice(0, 1).map((ex) => (
                <div key={ex.id} className="bg-zinc-800/50 p-4 rounded-lg border border-white/10 space-y-3">
                  <div className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={ex.name}
                      onChange={(e) => handleExerciseNameChange(ex.id, e.target.value)}
                      placeholder="Exercise name"
                      className="flex-1 bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded text-sm outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={ex.weight}
                      onChange={(e) => handleWeightChange(ex.id, e.target.value)}
                      placeholder="Weight sets (e.g., 135, 145, 155)"
                      className="bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded text-sm outline-none focus:border-indigo-500/50"
                    />
                    <input
                      type="text"
                      value={ex.reps}
                      onChange={(e) => handleRepsChange(ex.id, e.target.value)}
                      placeholder="Reps sets (e.g., 10, 8, 6)"
                      className="bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded text-sm outline-none focus:border-indigo-500/50"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
            >
              Save Workout
            </button>
          </div>

          {/* Right Half: History */}
          <div className="flex-1 flex flex-col overflow-hidden border-l border-white/10 pl-6">
            <h3 className="text-lg font-semibold text-white mb-4">Previous Records</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              {isLoading ? (
                <p className="text-zinc-400">Loading workout history...</p>
              ) : Object.keys(groupedByDate).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(groupedByDate)
                    .sort((a, b) => b[0].localeCompare(a[0]))
                    .map(([date, workouts]) => (
                      <div key={date} className="bg-zinc-800/50 p-4 rounded-lg border border-white/10">
                        <p className="mono-text text-xs text-zinc-400 mb-3">{date}</p>
                        <div className="space-y-3">
                          {workouts.map((w) => (
                            <div key={`${w._id}-${w.name}`} className="text-xs">
                              <p className="text-white font-medium">{w.name}</p>
                              <p className="mono-text text-zinc-500">
                                {w.sets.map((set) => `${set.weight} × ${set.reps}`).join(' | ')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-zinc-400 text-sm text-center py-8">No workout records</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer removed — save button moved to left panel */}
      </div>
    </div>
  );
}
