import React, { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../api';
import { X, Plus, CheckCircle2, Circle, Pencil, Trash2, Trophy } from 'lucide-react';

const fieldClass = 'w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none';
const buttonClass = 'px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-50';

export default function LifeArchitectureModal({ isOpen, onClose, setLifeGoals, userId }) {
  const [journeys, setJourneys] = useState([]);
  const [selectedJourneyId, setSelectedJourneyId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSteps, setNewSteps] = useState('');
  const [draft, setDraft] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [celebration, setCelebration] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const journeysRef = useRef(journeys);
  const savingRef = useRef(false);
  const sessionRef = useRef(0);
  journeysRef.current = journeys;

  const syncLifeGoals = list => {
    setLifeGoals(Object.fromEntries(list.filter(journey => !journey.archivedAt).map(journey => [journey._id, {
      goalName: journey.goalName, progress: journey.progress, steps: journey.steps
    }])));
  };

  useEffect(() => {
    const session = ++sessionRef.current;
    if (!isOpen) return;
    let cancelled = false;
    setJourneys([]);
    setSelectedJourneyId(null);
    setIsAdding(false);
    setNewTitle('');
    setNewSteps('');
    setDraft(null);
    setShowArchived(false);
    setCelebration(null);
    setError('');
    setIsLoading(true);
    const fetchJourneys = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/journeys?userId=${encodeURIComponent(userId)}&includeArchived=true`);
        if (!response.ok) throw new Error('Unable to load journeys. Please try again.');
        const data = await response.json();
        if (cancelled || session !== sessionRef.current) return;
        const list = data.journeys || [];
        setJourneys(list);
        syncLifeGoals(list);
        setSelectedJourneyId(list.find(journey => !journey.archivedAt)?._id || null);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchJourneys();
    return () => { cancelled = true; ++sessionRef.current; };
  }, [isOpen, userId]);

  const requestJourney = async (method, body) => {
    const response = await fetch(`${API_BASE}/api/journeys`, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, ...body })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to save journey. Please try again.');
    return data.journey;
  };

  const applyJourney = (journey, isNew) => {
    const current = journeysRef.current;
    const list = current.some(item => item._id === journey._id)
      ? current.map(item => item._id === journey._id ? journey : item)
      : [...current, journey];
    journeysRef.current = list;
    setJourneys(list);
    syncLifeGoals(list);
    if (journey.archivedAt) {
      setCelebration(journey);
      setShowArchived(true);
      setSelectedJourneyId(journey._id);
    } else if (isNew) {
      setSelectedJourneyId(journey._id);
    }
  };

  const save = async (method, body) => {
    if (isLoading || savingRef.current) return;
    savingRef.current = true;
    const session = sessionRef.current;
    setError('');
    setIsLoading(true);
    try {
      const journey = await requestJourney(method, body);
      if (session !== sessionRef.current) return;
      if (method === 'PUT' && journey._id !== body.journeyId) {
        throw new Error('The server returned a different journey. Reload before trying again.');
      }
      applyJourney(journey, method === 'POST');
      setDraft(null);
      setIsAdding(false);
      setNewTitle('');
      setNewSteps('');
    } catch (err) {
      if (session === sessionRef.current) setError(err.message);
    } finally {
      savingRef.current = false;
      if (session === sessionRef.current) setIsLoading(false);
    }
  };

  const visibleJourneys = journeys.filter(journey => Boolean(journey.archivedAt) === showArchived);
  const selectedJourney = visibleJourneys.find(journey => journey._id === selectedJourneyId);
  const deletePathway = async () => {
    if (!selectedJourney || isLoading || savingRef.current) return;
    const journeyId = selectedJourney._id;
    if (!window.confirm(`Delete "${selectedJourney.goalName}" and all its steps? This cannot be undone.`)) return;
    savingRef.current = true;
    const session = sessionRef.current;
    setIsLoading(true);
    setError('');
    try {
      await requestJourney('DELETE', { journeyId });
      if (session !== sessionRef.current) return;
      const list = journeysRef.current.filter(journey => journey._id !== journeyId);
      journeysRef.current = list;
      setJourneys(list);
      syncLifeGoals(list);
      setSelectedJourneyId(list.find(journey => Boolean(journey.archivedAt) === showArchived)?._id || null);
      setCelebration(current => current?._id === journeyId ? null : current);
    } catch (err) {
      if (session === sessionRef.current) setError(err.message);
    } finally {
      savingRef.current = false;
      if (session === sessionRef.current) setIsLoading(false);
    }
  };
  const validDraft = draft && draft.goalName.trim() && draft.steps.length > 0 && draft.steps.every(step => step.text.trim());
  const draftProgress = draft?.steps.length ? draft.steps.filter(step => step.isCompleted).length / draft.steps.length * 100 : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div role="dialog" aria-modal="true" aria-label="My Journey" className="bg-zinc-900/95 border border-white/10 rounded-xl w-full max-w-6xl h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">My Journey</h2>
          <button onClick={onClose} disabled={isLoading} aria-label="Close journeys" className="text-zinc-400 hover:text-white disabled:opacity-50"><X size={24} /></button>
        </div>
        {error && <div role="alert" className="mx-4 mt-4 p-3 rounded-lg bg-red-900/40 border border-red-500 text-red-200 text-sm">{error}</div>}
        {celebration && (
          <div role="status" className="mx-4 mt-4 p-4 rounded-lg bg-indigo-950/60 border border-indigo-400/40 flex items-center gap-3">
            <Trophy size={28} className="text-yellow-400 animate-bounce motion-reduce:animate-none" />
            <div className="flex-1"><p className="font-semibold text-white">Journey complete! You did it!</p><p className="text-sm text-indigo-200">{celebration.goalName} reached 100% and is saved in your archive.</p></div>
            <button onClick={() => { setShowArchived(true); setSelectedJourneyId(celebration._id); setDraft(null); setCelebration(null); }} className="text-sm text-indigo-300 hover:text-white">View archive</button>
            <button onClick={() => setCelebration(null)} aria-label="Dismiss celebration" className="text-zinc-400 hover:text-white"><X size={18} /></button>
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-hidden">
          {isAdding ? (
            <form onSubmit={event => {
              event.preventDefault();
              const steps = newSteps.split('\n').filter(step => step.trim()).map(text => ({ text: text.trim() }));
              if (newTitle.trim() && steps.length) save('POST', { goalName: newTitle.trim(), steps });
            }} className="p-6 h-full flex flex-col overflow-y-auto custom-scrollbar">
              <h3 className="text-lg font-semibold text-white mb-4">Add New Pathway</h3>
              <label htmlFor="new-pathway-title" className="text-sm text-zinc-300 mb-2">Pathway Title</label>
              <input id="new-pathway-title" required disabled={isLoading} value={newTitle} onChange={event => setNewTitle(event.target.value)} className={fieldClass} placeholder="Enter pathway title..." />
              <label htmlFor="new-pathway-steps" className="text-sm text-zinc-300 mt-4 mb-2">Steps (one per line)</label>
              <textarea id="new-pathway-steps" required disabled={isLoading} value={newSteps} onChange={event => setNewSteps(event.target.value)} className={`${fieldClass} min-h-[160px] flex-1 resize-none`} placeholder="Enter each step on a new line..." />
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" disabled={isLoading} onClick={() => setIsAdding(false)} className="px-4 py-2 bg-zinc-700 text-white rounded-lg">Cancel</button>
                <button disabled={isLoading || !newTitle.trim() || !newSteps.trim()} className={buttonClass}>{isLoading ? 'Saving...' : 'Submit'}</button>
              </div>
            </form>
          ) : (
            <div className="flex h-full">
              <div className="w-[35%] border-r border-white/10 flex flex-col min-h-0">
                <div className="p-4 border-b border-white/10 space-y-3">
                  <button disabled={isLoading || Boolean(draft)} onClick={() => { setIsAdding(true); setShowArchived(false); setError(''); }} className={`${buttonClass} w-full flex items-center justify-center gap-2`}><Plus size={18} />Add New Pathway</button>
                  <div className="flex gap-2">
                    {[false, true].map(archived => (
                      <button key={String(archived)} disabled={isLoading || Boolean(draft)} onClick={() => {
                        setShowArchived(archived);
                        setSelectedJourneyId(journeys.find(journey => Boolean(journey.archivedAt) === archived)?._id || null);
                        setError('');
                      }} className={`flex-1 text-sm rounded-lg py-2 disabled:opacity-50 ${showArchived === archived ? 'bg-indigo-950 text-indigo-200' : 'text-zinc-400 hover:text-white'}`}>{archived ? 'Archive' : 'Active'}</button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                  {visibleJourneys.map(journey => (
                    <button key={journey._id} disabled={isLoading || Boolean(draft)} onClick={() => { setSelectedJourneyId(journey._id); setError(''); }} className={`w-full text-left p-4 rounded-lg border transition disabled:opacity-50 ${selectedJourneyId === journey._id ? 'bg-indigo-950/30 border-indigo-500/40' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}`}>
                      <p className="font-medium text-white mb-2 break-words">{journey.goalName}</p>
                      <div className="w-full bg-zinc-800 rounded-full h-2"><div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${journey.progress}%` }} /></div>
                      <p className="mono-text text-xs text-zinc-400 mt-1">{journey.progress.toFixed(0)}%</p>
                    </button>
                  ))}
                  {!visibleJourneys.length && <p className="text-zinc-400 text-sm">{isLoading ? 'Loading journeys...' : showArchived ? 'No archived journeys yet.' : 'No active journeys. Add a new pathway.'}</p>}
                </div>
              </div>
              <div className="w-[65%] flex flex-col min-h-0">
                <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white break-words">{draft ? 'Edit Pathway' : selectedJourney?.goalName || 'Select a Journey'}</h3>
                  {selectedJourney && !draft && (
                    <div className="flex items-center gap-1 shrink-0">
                      {!showArchived && <button aria-label="Edit journey" title="Edit journey" disabled={isLoading} onClick={() => { setDraft({ goalName: selectedJourney.goalName, steps: selectedJourney.steps.map(step => ({ ...step, key: step._id })) }); setError(''); }} className="text-zinc-400 hover:text-indigo-300 p-2 disabled:opacity-50"><Pencil size={18} /></button>}
                      <button aria-label="Delete pathway" title="Delete pathway" disabled={isLoading} onClick={deletePathway} className="text-zinc-400 hover:text-red-400 p-2 disabled:opacity-50"><Trash2 size={18} /></button>
                    </div>
                  )}
                </div>
                {draft ? (
                  <form key={selectedJourneyId} onSubmit={event => { event.preventDefault(); if (validDraft) save('PUT', { journeyId: selectedJourneyId, goalName: draft.goalName, steps: draft.steps.map(({ _id, text }) => ({ _id, text })) }); }} className="flex-1 min-h-0 flex flex-col">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                      <label htmlFor="edit-pathway-title" className="block text-sm text-zinc-300">Pathway Title</label>
                      <input id="edit-pathway-title" required disabled={isLoading} value={draft.goalName} onChange={event => setDraft({ ...draft, goalName: event.target.value })} className={fieldClass} />
                      <p className="text-sm text-zinc-300">Steps · {draftProgress.toFixed(0)}% complete</p>
                      <div className="w-full bg-zinc-800 rounded-full h-2"><div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${draftProgress}%` }} /></div>
                      <p className="text-xs text-zinc-400">Existing steps keep their completion status. New steps start incomplete. Completing every remaining step archives this pathway.</p>
                      {draft.steps.map((step, index) => (
                        <div key={step.key} className="flex items-center gap-2">
                          {step.isCompleted ? <CheckCircle2 size={18} className="text-indigo-400 shrink-0" aria-label="Completed" /> : <Circle size={18} className="text-zinc-600 shrink-0" aria-label="Incomplete" />}
                          <input aria-label={`Step ${index + 1}`} required disabled={isLoading} value={step.text} onChange={event => setDraft({ ...draft, steps: draft.steps.map((item, i) => i === index ? { ...item, text: event.target.value } : item) })} className={fieldClass} />
                          <button type="button" aria-label={`Remove step ${index + 1}`} disabled={isLoading} onClick={() => setDraft({ ...draft, steps: draft.steps.filter((_, i) => i !== index) })} className="text-zinc-400 hover:text-red-400 p-2"><Trash2 size={18} /></button>
                        </div>
                      ))}
                      <button type="button" disabled={isLoading} onClick={() => setDraft({ ...draft, steps: [...draft.steps, { key: crypto.randomUUID(), text: '', isCompleted: false }] })} className="flex items-center gap-2 text-indigo-300 hover:text-indigo-200"><Plus size={18} />Add step</button>
                      {!draft.steps.length && <p className="text-sm text-amber-300">Add at least one step to save this pathway.</p>}
                    </div>
                    <div className="p-4 border-t border-white/10 flex justify-end gap-3">
                      <button type="button" disabled={isLoading} onClick={() => { setDraft(null); setError(''); }} className="px-4 py-2 bg-zinc-700 text-white rounded-lg">Cancel</button>
                      <button disabled={isLoading || !validDraft} className={buttonClass}>{isLoading ? 'Saving...' : 'Save changes'}</button>
                    </div>
                  </form>
                ) : (
                  <div key={selectedJourneyId || 'empty'} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    {selectedJourney ? <>
                      {showArchived && <p className="text-sm text-indigo-300 flex items-center gap-2"><Trophy size={18} />Completed · Archived {new Date(selectedJourney.archivedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' }).replaceAll('/', '-')}</p>}
                      {selectedJourney.steps.map((step, index) => (
                        <button key={`${selectedJourney._id}:${step._id || index}`} disabled={isLoading || showArchived} onClick={() => save('PUT', { journeyId: selectedJourney._id, stepId: step._id, stepIndex: index, isCompleted: !step.isCompleted })} className={`w-full text-left p-3 rounded-lg border flex items-start justify-between gap-3 transition disabled:cursor-default ${step.isCompleted ? 'bg-indigo-950/30 border-indigo-500/40' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}`}>
                          <span className={`text-sm break-words ${step.isCompleted ? 'text-indigo-300 line-through' : 'text-white'}`}>{step.text}</span>
                          {step.isCompleted ? <CheckCircle2 size={18} className="text-indigo-400 shrink-0" /> : <Circle size={18} className="text-zinc-600 shrink-0" />}
                        </button>
                      ))}
                    </> : <p className="text-zinc-400 text-center mt-8">Select a pathway to view tasks</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
