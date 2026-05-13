import React, { useState } from 'react';
import { Trash2, Check } from 'lucide-react';
import { formatDate } from '../utils';

export default function TodoCommand({ todos, setTodos }) {
  const [newTask, setNewTask] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAddTask = () => {
    if (newTask.trim() && newDueDate.trim()) {
      const updated = { ...todos };
      updated.pending = [
        ...updated.pending,
        { task: newTask, dueDate: newDueDate, isCompleted: false }
      ];
      setTodos(updated);
      setNewTask('');
      setNewDueDate('');
      setShowForm(false);
    }
  };

  const handleCompleteTask = (index) => {
    const updated = { ...todos };
    const task = updated.pending[index];
    updated.completed = [task, ...updated.completed];
    updated.pending = updated.pending.filter((_, i) => i !== index);
    console.log("hukum",updated);
    setTodos(updated);
    console.log("hukum",updated);
  };

  const handleDeleteTask = (index) => {
    const updated = { ...todos };
    updated.pending = updated.pending.filter((_, i) => i !== index);
    setTodos(updated);
  };

  // Sort pending tasks by due date (ascending)
  const sortedPending = [...todos.pending].sort((a, b) => {
    const dateA = new Date(a.dueDate.split('-').reverse().join('-'));
    const dateB = new Date(b.dueDate.split('-').reverse().join('-'));
    return dateA - dateB;
  });

  return (
    <div className="glass-tile p-6 flex flex-col h-full">
      <h3 className="text-lg font-bold text-white mb-4">To-Do Command</h3>

      <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        {/* Pending Tasks */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Pending ({todos.pending.length})
          </p>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {sortedPending.map((task, idx) => (
              <div
                key={idx}
                className="bg-zinc-900/50 p-3 rounded-lg border border-white/5 hover:border-white/10 transition"
              >
                <p className="text-sm text-white mb-1">{task.task}</p>
                <p className="mono-text text-xs text-zinc-500">
                  Due: {task.dueDate}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      const actualIndex = todos.pending.findIndex(t => t.task === task.task && t.dueDate === task.dueDate);
                      handleCompleteTask(actualIndex);
                    }}
                    className="flex-1 text-xs bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 py-1 rounded transition flex items-center justify-center gap-1"
                  >
                    <Check size={14} /> Done
                  </button>
                  <button
                    onClick={() => {
                      const actualIndex = todos.pending.findIndex(t => t.task === task.task && t.dueDate === task.dueDate);
                      handleDeleteTask(actualIndex);
                    }}
                    className="px-2 text-xs bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 py-1 rounded transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Tasks */}
        {todos.completed.length > 0 && (
          <div className="border-t border-white/10 pt-2">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Completed ({todos.completed.length})
            </p>
            <div className="space-y-1 ">
              {todos.completed.map((task, idx) => (
                <div key={idx} className="text-xs text-zinc-500 line-through">
                  {task.task}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mt-4 w-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 py-2 rounded-lg text-sm transition"
      >
        {showForm ? 'Cancel' : '+ Add Task'}
      </button>

      {showForm && (
        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded text-sm outline-none focus:border-indigo-500/50"
            autoFocus
          />
          <input
            type="text"
            placeholder="Due date (DD-MM-YY)"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 rounded text-sm outline-none focus:border-indigo-500/50"
          />
          <button
            onClick={handleAddTask}
            disabled={!newTask.trim() || !newDueDate.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white py-2 rounded text-sm font-medium transition"
          >
            Add Task
          </button>
        </div>
      )}
    </div>
  );
}
