import React, { useState } from 'react';

export default function LifeArchitecture({ lifeGoals, setLifeGoals, onOpen }) {
  const [expandedGoal, setExpandedGoal] = useState(Object.keys(lifeGoals)[0]);

  const handleToggleStep = (goalId, stepIndex) => {
    const updated = { ...lifeGoals };
    const goal = updated[goalId];
    const step = goal.steps[stepIndex];
    step.isCompleted = !step.isCompleted;

    // Recalculate progress
    const completedSteps = goal.steps.filter(s => s.isCompleted).length;
    goal.progress = goal.steps.length > 0 ? (completedSteps / goal.steps.length) * 100 : 0;

    setLifeGoals(updated);
  };

  return (
    <div className="glass-tile p-6 flex flex-col h-full overflow-y-hidden cursor-pointer" onClick={onOpen}>
      <h3 className="text-lg font-bold text-white mb-4">My Journey</h3>

      <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
        {Object.entries(lifeGoals).map(([goalId, goal]) => (
          <div key={goalId} className="bg-zinc-900/50 hover:bg-zinc-900/70 p-4 rounded-lg transition">
            <p className="font-medium text-white mb-2">{goal.goalName}</p>
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
  );
}
