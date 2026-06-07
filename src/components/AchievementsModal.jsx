import React, { useState, useEffect } from 'react';
import { API_BASE } from '../api';
import { X } from 'lucide-react';
import { formatDate } from '../utils';

export default function AchievementsModal({ isOpen, onClose, currentDate, userId }) {
  const [formData, setFormData] = useState({
    title: '',
    earnedAt: currentDate
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [achievements, setAchievements] = useState([]);

  // Fetch achievements when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchAchievements();
    }
  }, [isOpen, userId]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE}/api/achievements?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setAchievements(data.achievements);
      } else {
        setError('Failed to fetch achievements');
      }
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Error fetching achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.earnedAt.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE}/api/achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          title: formData.title.trim(),
          earnedAt: formData.earnedAt.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setAchievements(data.achievements);
        setFormData({
          title: '',
          earnedAt: currentDate
        });
      } else {
        setError('Failed to add achievement');
      }
    } catch (err) {
      console.error('Error adding achievement:', err);
      setError('Error adding achievement');
    } finally {
      setLoading(false);
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
            {error && (
              <div className="bg-red-600/20 border border-red-500/30 text-red-300 px-3 py-2 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="e.g., Completed Oracle Tenure"
                  className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-indigo-500/50 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-2">Earned At (DD-MM-YY)</label>
                <input
                  type="text"
                  name="earnedAt"
                  value={formData.earnedAt}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="DD-MM-YY"
                  className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded-lg text-sm outline-none focus:border-indigo-500/50 disabled:opacity-50"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white py-2 rounded-lg text-sm font-medium transition"
            >
              {loading ? 'Adding...' : 'Add Achievement'}
            </button>
          </div>

          {/* Right Half: Achievements List */}
          <div className="flex-1 flex flex-col overflow-hidden border-l border-white/10 pl-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Achievements</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                {loading && achievements.length === 0 ? (
                  <p className="text-zinc-400 text-sm text-center py-8">Loading achievements...</p>
                ) : achievements.length === 0 ? (
                  <p className="text-zinc-400 text-sm text-center py-8">No achievements yet. Add your first one!</p>
                ) : (
                  achievements.map((ach, idx) => (
                    <div key={ach._id || idx} className="bg-zinc-800/50 p-4 rounded-lg border border-yellow-500/20">
                      <p className="text-white font-medium">{ach.title}</p>
                      <p className="text-xs text-zinc-400 mt-1">Earned: {ach.earnedAt}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
