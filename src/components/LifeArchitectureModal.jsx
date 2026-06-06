import React, { useState, useEffect } from 'react';
import { X, Plus, CheckCircle2, Circle } from 'lucide-react';

export default function LifeArchitectureModal({ isOpen, onClose, lifeGoals, setLifeGoals, userId }) {
  const [journeys, setJourneys] = useState([]);
  const [selectedJourneyId, setSelectedJourneyId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSteps, setNewSteps] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const syncLifeGoals = (journeysList) => {
    const updatedGoals = {};
    journeysList.forEach(journey => {
      updatedGoals[journey._id] = {
        goalName: journey.goalName,
        progress: journey.progress,
        steps: journey.steps.map(step => ({
          text: step.text,
          isCompleted: step.isCompleted
        }))
      };
    });
    setLifeGoals(updatedGoals);
  };

  useEffect(() => {
    if (!isOpen) {
      setJourneys([]);
      setSelectedJourneyId(null);
      setError('');
      setIsLoading(false);
      return;
    }

    const fetchJourneys = async () => {
      setError('');
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/journeys?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch journeys');
        }

        const data = await response.json();
        const fetchedJourneys = data.journeys || [];
        setJourneys(fetchedJourneys);
        syncLifeGoals(fetchedJourneys);

        if (fetchedJourneys.length > 0) {
          setSelectedJourneyId(fetchedJourneys[0]._id);
        } else if (Object.keys(lifeGoals).length > 0) {
          const initialJourneyId = Object.keys(lifeGoals)[0];
          setSelectedJourneyId(initialJourneyId);
          setJourneys(Object.entries(lifeGoals).map(([goalId, goal]) => ({
            _id: goalId,
            goalName: goal.goalName || goal.goal,
            progress: goal.progress || 0,
            steps: goal.steps || []
          })));
        }
      } catch (fetchError) {
        console.error('Failed to load journeys:', fetchError);
        setError('Unable to load journeys. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJourneys();
  }, [isOpen, userId]);

  const createJourney = async (goalName, steps) => {
    const response = await fetch('http://localhost:5000/api/journeys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, goalName, steps })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create journey');
    }

    return data.journey;
  };

  const handleAddPathway = async () => {
    if (!newTitle.trim() || !newSteps.trim()) return;

    const steps = newSteps
      .split('\n')
      .filter(step => step.trim())
      .map(step => ({
        text: step.trim(),
        isCompleted: false
      }));

    try {
      setIsLoading(true);
      const newJourney = await createJourney(newTitle.trim(), steps);
      const updatedJourneys = [...journeys, newJourney];
      setJourneys(updatedJourneys);
      syncLifeGoals(updatedJourneys);
      setNewTitle('');
      setNewSteps('');
      setIsAdding(false);
      setSelectedJourneyId(newJourney._id);
    } catch (submitError) {
      console.error('Could not create journey:', submitError);
      setError('Unable to create pathway. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateJourneyStep = async (journeyId, stepIndex, isCompleted) => {
    const response = await fetch('http://localhost:5000/api/journeys', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ journeyId, stepIndex, isCompleted })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update step');
    }

    return data.journey;
  };

  const handleToggleStep = async (journeyId, stepIndex) => {
    const journey = journeys.find(journeyItem => journeyItem._id === journeyId);
    if (!journey) return;

    try {
      setIsLoading(true);
      const updatedJourney = await updateJourneyStep(journeyId, stepIndex, !journey.steps[stepIndex]?.isCompleted);
      const updatedJourneys = journeys.map(item =>
        item._id === journeyId ? updatedJourney : item
      );
      setJourneys(updatedJourneys);
      syncLifeGoals(updatedJourneys);
    } catch (updateError) {
      console.error('Could not update journey step:', updateError);
      setError('Unable to update step. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedJourney = journeys.find(journey => journey._id === selectedJourneyId);

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
                <div className="flex-1 min-h-[220px]">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Steps (one per line)</label>
                  <textarea
                    value={newSteps}
                    onChange={(e) => setNewSteps(e.target.value)}
                    className="w-full h-60 overflow-y-auto custom-scrollbar bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none resize-none"
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
                  {error && (
                    <div className="p-3 rounded-lg bg-red-900/40 border border-red-500 text-red-200 text-sm">
                      {error}
                    </div>
                  )}
                  {isLoading ? (
                    <div className="text-zinc-400 text-sm">Loading journeys...</div>
                  ) : journeys.length > 0 ? (
                    journeys.map(journey => (
                      <div
                        key={journey._id}
                        onClick={() => setSelectedJourneyId(journey._id)}
                        className={`p-4 rounded-lg border transition cursor-pointer ${
                          selectedJourneyId === journey._id
                            ? 'bg-indigo-950/30 border-indigo-500/40'
                            : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <p className="font-medium text-white mb-2">{journey.goalName}</p>
                        <div className="w-full bg-zinc-800 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all"
                            style={{ width: `${journey.progress}%` }}
                          />
                        </div>
                        <p className="mono-text text-xs text-zinc-400 mt-1">{journey.progress.toFixed(0)}%</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-400 text-sm">No journeys available.</p>
                  )}
                </div>
              </div>

              {/* Right Side: Tasks List (65%) */}
              <div className="w-[65%] flex flex-col">
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedJourney ? selectedJourney.goalName : 'Select a Journey'}
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                  {isLoading ? (
                    <p className="text-zinc-400">Loading journey details...</p>
                  ) : selectedJourney ? (
                    <div className="space-y-3">
                      {selectedJourney.steps.map((step, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleToggleStep(selectedJourney._id, idx)}
                          className={`p-3 rounded-lg border transition cursor-pointer ${
                            step.isCompleted
                              ? 'bg-indigo-950/30 border-indigo-500/40'
                              : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm ${step.isCompleted ? 'text-indigo-300 line-through' : 'text-white'}`}>
                                {step.text}
                              </p>
                            </div>
                            <div>
                              {step.isCompleted ? (
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