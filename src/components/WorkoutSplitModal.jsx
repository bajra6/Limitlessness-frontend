import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export default function WorkoutSplitModal({ isOpen, onClose, workoutData, setWorkoutData, currentDate }) {
  const [exercises, setExercises] = useState(() => {
    const today = workoutData[currentDate] || {};
    const defaultExercises = [
      'Bench Press',
      'Squats',
      'Deadlifts',
      'Rows',
      'Pull-ups',
      'Overhead Press'
    ];
    
    // Map existing data or create empty ones
    return defaultExercises.map(name => {
      const existing = Object.entries(today).find(([_, data]) => data.weight === name || _ === name);
      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name,
        weight: existing ? existing[1].weight : '',
        reps: existing ? existing[1].reps : ''
      };
    });
  });

  const handleExerciseNameChange = (id, newName) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, name: newName } : ex));
  };

  const handleWeightChange = (id, newWeight) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, weight: newWeight } : ex));
  };

  const handleRepsChange = (id, newReps) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, reps: newReps } : ex));
  };

  const handleAddExercise = () => {
    const newId = `exercise-${Date.now()}`;
    setExercises([...exercises, { id: newId, name: '', weight: '', reps: '' }]);
  };

  const handleRemoveExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleSave = () => {
    const updated = { ...workoutData };
    updated[currentDate] = {};
    exercises.forEach(ex => {
      if (ex.name.trim()) {
        updated[currentDate][ex.name] = { weight: ex.weight, reps: ex.reps };
      }
    });
    setWorkoutData(updated);
    // Reset form to default exercises
    setExercises([
      { id: 'bench-press', name: 'Bench Press', weight: '', reps: '' },
      { id: 'squats', name: 'Squats', weight: '', reps: '' },
      { id: 'deadlifts', name: 'Deadlifts', weight: '', reps: '' },
      { id: 'rows', name: 'Rows', weight: '', reps: '' },
      { id: 'pullups', name: 'Pull-ups', weight: '', reps: '' },
      { id: 'overhead-press', name: 'Overhead Press', weight: '', reps: '' }
    ]);
  };

  if (!isOpen) return null;

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
            <h3 className="text-lg font-semibold text-white mb-4">Today's Workout</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {exercises.map((ex) => (
                <div key={ex.id} className="bg-zinc-800/50 p-4 rounded-lg border border-white/10 space-y-3">
                  <div className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={ex.name}
                      onChange={(e) => handleExerciseNameChange(ex.id, e.target.value)}
                      placeholder="Exercise name"
                      className="flex-1 bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded text-sm outline-none focus:border-indigo-500/50"
                    />
                    <button
                      onClick={() => handleRemoveExercise(ex.id)}
                      className="p-2 hover:bg-red-600/20 text-red-400 rounded transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={ex.weight}
                      onChange={(e) => handleWeightChange(ex.id, e.target.value)}
                      placeholder="Weight (e.g., 135 lbs)"
                      className="bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded text-sm outline-none focus:border-indigo-500/50"
                    />
                    <input
                      type="text"
                      value={ex.reps}
                      onChange={(e) => handleRepsChange(ex.id, e.target.value)}
                      placeholder="Reps (e.g., 10, 8, 6)"
                      className="bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded text-sm outline-none focus:border-indigo-500/50"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddExercise}
              className="mt-4 w-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Exercise
            </button>
          </div>

          {/* Right Half: History */}
          <div className="flex-1 flex flex-col overflow-hidden border-l border-white/10 pl-6">
            <h3 className="text-lg font-semibold text-white mb-4">Previous Records</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                {Object.entries(workoutData)
                  .sort(([dateA], [dateB]) => {
                    const a = new Date(dateA.split('-').reverse().join('-'));
                    const b = new Date(dateB.split('-').reverse().join('-'));
                    return b - a;
                  })
                  .slice(0, 10)
                  .map(([date, data]) => (
                    <div key={date} className="bg-zinc-800/50 p-4 rounded-lg border border-white/10">
                      <p className="mono-text text-xs text-zinc-400 mb-3">{date}</p>
                      <div className="space-y-2">
                        {Object.entries(data).map(([name, { weight, reps }]) => (
                          <div key={name} className="text-xs">
                            <p className="text-white font-medium">{name}</p>
                            <p className="mono-text text-zinc-500">
                              {weight} × {reps}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                {Object.keys(workoutData).length === 0 && (
                  <p className="text-zinc-400 text-sm text-center py-8">No workout records</p>
                )}
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
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition"
          >
            Save Workout
          </button>
        </div>
      </div>
    </div>
  );
}
