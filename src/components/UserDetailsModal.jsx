import React, { useState } from 'react';

export default function UserDetailsModal({ isOpen, userId, onSubmit }) {
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email');
      return;
    }
    if (!dob) {
      setError('Please enter your date of birth');
      return;
    }
    onSubmit({ email: trimmedEmail, dob });
    setEmail('');
    setDob('');
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-zinc-900 via-slate-900 to-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2">One more thing</h2>
        <p className="text-zinc-400 text-sm mb-6">
          User ID <span className="text-indigo-400 font-semibold">{userId}</span> is not registered yet. Please provide your details to continue.
        </p>

        {error && (
          <div className="bg-red-600/20 border border-red-500/30 text-red-300 px-3 py-2 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., john@example.com"
            className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-800 transition"
            autoFocus
          />
        </div>

        <div className="mb-6">
          <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-2">Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-800 transition [color-scheme:dark]"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
