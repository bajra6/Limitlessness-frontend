import React, { useState } from 'react';
import { X } from 'lucide-react';
import { formatDate } from '../utils';

export default function AchievementsModal({ isOpen, onClose, achievements, setAchievements, currentDate }) {
  const [formData, setFormData] = useState({
    achievement: '',
    date: currentDate,
    domain: '',
    difficulty: 5
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'difficulty' ? parseInt(value) : value
    }));
  };

  const handleSubmit = () => {
    if (formData.achievement.trim() && formData.domain.trim()) {
      const newAchievement = {
        achievement: formData.achievement,
        date: formData.date,
        domain: formData.domain,
        difficulty: formData.difficulty
      };
      setAchievements([...achievements, newAchievement]);
      setFormData({
        achievement: '',
        date: currentDate,
        domain: '',
        difficulty: 5
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">Achievements</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X size={24} className="text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex gap-6 p-6">
          {/* Left Half: Form */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <h3 className="text-lg font-semibold text-white mb-4">Add Achievement</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-2">Achievement</label>
                <input
                  type="text"
                  name="achievement"
                  value={formData.achievement}
                  onChange={handleInputChange}
                  placeholder="e.g., Completed Oracle Tenure"
                  className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-2">Date</label>
                <input
                  type="text"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  placeholder="DD-MM-YY"
                  className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-2">Domain</label>
                <input
                  type="text"
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  placeholder="e.g., Career, Health, Learning"
                  className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-2">
                  Difficulty: {formData.difficulty}/10
                </label>
                <input
                  type="range"
                  name="difficulty"
                  min="1"
                  max="10"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-2">
                  <span>Easy</span>
                  <span>Hard</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition"
            >
              Add Achievement
            </button>
          </div>

          {/* Right Half: Previous Achievements */}
          <div className="flex-1 flex flex-col overflow-hidden border-l border-white/10 pl-6">
            <h3 className="text-lg font-semibold text-white mb-4">Previous Achievements</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                {achievements.length === 0 ? (
                  <p className="text-zinc-400 text-sm text-center py-8">No achievements yet</p>
                ) : (
                  achievements.map((ach, idx) => (
                    <div key={idx} className="bg-zinc-800/50 p-4 rounded-lg border border-white/10">
                      <p className="text-white font-medium">{ach.achievement}</p>
                      <p className="text-xs text-zinc-400 mt-1">{ach.date}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs bg-indigo-600/30 text-indigo-300 px-2 py-1 rounded">
                          {ach.domain}
                        </span>
                        <span className="text-xs text-yellow-400">
                          Difficulty: {ach.difficulty}/10
                        </span>
                      </div>
                    </div>
                  ))
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
