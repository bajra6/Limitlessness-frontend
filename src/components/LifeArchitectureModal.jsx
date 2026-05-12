import React, { useState } from 'react';
import { X, Plus, CheckCircle2, Circle } from 'lucide-react';

export default function LifeArchitectureModal({ isOpen, onClose, lifeGoals, setLifeGoals }) {
  const [selectedPathway, setSelectedPathway] = useState(Object.keys(lifeGoals)[0] || null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSteps, setNewSteps] = useState('');

  const handleAddPathway = () => {
    if (!newTitle.trim() || !newSteps.trim()) return;

    const steps = newSteps.split('\n').filter(step => step.trim()).map(step => ({
      stepname: step.trim(),
      completed: false
    }));

    const newGoalId = `goal_${Date.now()}`;
    const updatedGoals = {
      ...lifeGoals,
      [newGoalId]: {
        goal: newTitle.trim(),
        progress: 0,
        steps
      }
    };

    setLifeGoals(updatedGoals);
    setNewTitle('');
    setNewSteps('');
    setIsAdding(false);
    setSelectedPathway(newGoalId);
  };

  const handleToggleStep = (goalId, stepIndex) => {
    const updated = { ...lifeGoals };
    const goal = updated[goalId];
    const step = goal.steps[stepIndex];
    step.completed = !step.completed;

    const completedSteps = goal.steps.filter(s => s.completed).length;
    goal.progress = (completedSteps / goal.steps.length) * 100;

    setLifeGoals(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900/95 border border-white/10 rounded-xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">My Journey</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isAdding ? (
            /* Add New Pathway Form */
            <div className="p-6 h-full flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-4">Add New Pathway</h3>
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Pathway Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="Enter pathway title..."
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Steps (one per line)</label>
                  <textarea
                    value={newSteps}
                    onChange={(e) => setNewSteps(e.target.value)}
                    className="w-full h-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none resize-none"
                    placeholder="Enter each step on a new line..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPathway}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                >
                  Submit
                </button>
              </div>
            </div>
          ) : (
            /* Pathways and Tasks View */
            <div className="flex h-full">
              {/* Left Side: Pathways List (35%) */}
              <div className="w-[35%] border-r border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/10">
                  <button
                    onClick={() => setIsAdding(true)}
                    className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-lg transition"
                  >
                    <Plus size={18} />
                    <span>Add New Pathway</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                  {Object.entries(lifeGoals).map(([goalId, goal]) => (
                    <div
                      key={goalId}
                      onClick={() => setSelectedPathway(goalId)}
                      className={`p-4 rounded-lg border transition cursor-pointer ${
                        selectedPathway === goalId
                          ? 'bg-indigo-950/30 border-indigo-500/40'
                          : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <p className="font-medium text-white mb-2">{goal.goal}</p>
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <p className="mono-text text-xs text-zinc-400 mt-1">{goal.progress.toFixed(0)}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Tasks List (65%) */}
              <div className="w-[65%] flex flex-col">
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedPathway ? lifeGoals[selectedPathway].goal : 'Select a Pathway'}
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                  {selectedPathway && lifeGoals[selectedPathway] ? (
                    <div className="space-y-3">
                      {lifeGoals[selectedPathway].steps.map((step, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleToggleStep(selectedPathway, idx)}
                          className={`p-3 rounded-lg border transition cursor-pointer ${
                            step.completed
                              ? 'bg-indigo-950/30 border-indigo-500/40'
                              : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm ${step.completed ? 'text-indigo-300 line-through' : 'text-white'}`}>
                                {step.stepname}
                              </p>
                            </div>
                            <div>
                              {step.completed ? (
                                <CheckCircle2 size={18} className="text-indigo-400" />
                              ) : (
                                <Circle size={18} className="text-zinc-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-400 text-center mt-8">Select a pathway to view tasks</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}