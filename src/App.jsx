import React, { useState, useEffect } from 'react';
import { API_BASE } from './api';
import AgeMatrix from './components/AgeMatrix';
import WorkoutSplit from './components/WorkoutSplit';
import DailyRoutineEngine from './components/DailyRoutineEngine';
import TodoCommand from './components/TodoCommand';
import LifeArchitecture from './components/LifeArchitecture';
import AchievementsLog from './components/AchievementsLog';
import AchievementsModal from './components/AchievementsModal';
import RawNotes from './components/RawNotes';
import RawNotesModal from './components/RawNotesModal';
import DailyRoutineModal from './components/DailyRoutineModal';
import LifeArchitectureModal from './components/LifeArchitectureModal';
import UserIdPromptModal from './components/UserIdPromptModal';
import UserDetailsModal from './components/UserDetailsModal';

export default function App() {
  const [userId, setUserId] = useState(null);
  const [showUserIdPrompt, setShowUserIdPrompt] = useState(false);
  const [showUserDetailsPrompt, setShowUserDetailsPrompt] = useState(false);
  const [initialUserId, setInitialUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');

  // Modal States
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [isLifeArchitectureModalOpen, setIsLifeArchitectureModalOpen] = useState(false);

  // Total Score State
  const [totalScore, setTotalScore] = useState(0);

  // User Birthdate (for Age Matrix)
  const [birthDate, setBirthDate] = useState('2000-00-00T00:00:00');

  // Routine State - list of routines from backend
  const [routine, setRoutine] = useState([]);

  // Todos State - from backend
  const [todos, setTodos] = useState({ pending: [], completed: [] });

  // Life Goals State - maps _id -> { goalName, progress, steps }
  const [lifeGoals, setLifeGoals] = useState({});

  // Achievements State - array of { title, earnedAt }
  const [achievements, setAchievements] = useState([]);

  // Achievement Count State
  const [achievementCount, setAchievementCount] = useState(0);

  // Notes State - object with _id as key and content as value
  const [notes, setNotes] = useState({});

  // Notes Count State
  const [notesCount, setNotesCount] = useState(0);

  // Workout history state from backend
  const [workoutHistory, setWorkoutHistory] = useState([]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
      try {
const response = await fetch(`${API_BASE}/api/dashboard?userId=${userId}`);
        const data = await response.json();

        // Update todos
        setTodos(data.todos);

        setBirthDate(data?.user?.dob || '2000-00-00T00:00:00');

        // Update achievements count (if needed - currently just a count)
        setAchievements(data.achievements || []);
        setAchievementCount(data.achievementCount || 0);

        // Update dashboard score from historical completed routines
        setTotalScore(data.totalScore || 0);

        // Update notes
        setNotes(data.notes || {});
        setNotesCount(data.noteCount || 0);

        // Update journeys/life goals - transform from backend format
        const goalsMap = {};
        data.journeys.forEach((journey, idx) => {
          goalsMap[journey._id] = {
            goalName: journey.goalName,
            progress: journey.progress,
            steps: journey.steps.map(step => ({
              text: step.text,
              isCompleted: step.isCompleted
            }))
          };
        });
        setLifeGoals(goalsMap);

        // Update routines directly from backend format
        setRoutine(data.routines || []);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setLoading(false);
      }
  };

  const handleToggleRoutine = async (habit) => {
    if (!habit || !habit._id) return;

    const updatedCompletion = !habit.isCompleted;
    try {
      const response = await fetch(`${API_BASE}/api/routine-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          routineId: habit._id,
          date: currentDate,
          isCompleted: updatedCompletion
        })
      });
      if (!response.ok) {
        throw new Error('Failed to update routine log');
      }
      const data = await response.json();
      setTotalScore(data.totalScore || 0);
      await fetchDashboardData();
    } catch (err) {
      console.error('Routine toggle failed', err);
    }
  };

  const checkUserExists = async (userIdToCheck) => {
    try {
      const response = await fetch(`${API_BASE}/api/users/check?userId=${userIdToCheck}`);
      const data = await response.json();
      if (data.exists) {
        setUserId(userIdToCheck);
        setLoading(true);
      } else {
        setInitialUserId(userIdToCheck);
        setShowUserDetailsPrompt(true);
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to check user:', err);
      setUserId(userIdToCheck);
      setLoading(true);
    }
  };

  // Initialize userId from localStorage and setup date
  useEffect(() => {
    // Get today's date in DD-MM-YY format
    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getFullYear()).slice(-2)}`;
    setCurrentDate(todayStr);

    // Check localStorage for userId
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      checkUserExists(storedUserId);
    } else {
      setShowUserIdPrompt(true);
      setLoading(false);
    }
  }, []);

  // Handle first prompt: userId only
  const handleUserIdSubmit = (newUserId) => {
    localStorage.setItem('userId', newUserId);
    setShowUserIdPrompt(false);
    setLoading(true);
    checkUserExists(newUserId);
  };

  // Handle second prompt: email + dob
  const handleUserDetailsSubmit = async ({ email, dob }) => {
    try {
      await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: initialUserId, email, dob })
      });
    } catch (err) {
      console.error('Failed to create user:', err);
    }

    setShowUserDetailsPrompt(false);
    setUserId(initialUserId);
    setLoading(true);
  };

  // Fetch dashboard data when userId is set
  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950 p-6 flex flex-col overflow-hidden">
      <UserIdPromptModal
        isOpen={showUserIdPrompt}
        onSubmit={handleUserIdSubmit}
      />

      <UserDetailsModal
        isOpen={showUserDetailsPrompt}
        userId={initialUserId}
        onSubmit={handleUserDetailsSubmit}
      />

      {loading && (
        <div className="flex items-center justify-center h-full">
          <p className="text-white">Loading dashboard...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Header - Limitlessness + Score */}
          <div className="mb-4 flex-shrink-0 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/favicon.png" alt="Limitlessness" className="w-8 h-8 rounded-md object-cover" />
              <h1 className="text-2xl font-bold text-white">Limitlessness</h1>
            </div>
            <p className="mono-text text-sm text-indigo-400">
              Score: <span className="font-bold">{totalScore}</span>
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden" style={{gridTemplateRows: '2fr 1fr'}}>
        {/* Row 1 */}
        {/* Tile 1: Age Matrix */}
        <div className="overflow-hidden">
          <AgeMatrix birthDate={birthDate} />
        </div>

        {/* Tile 2: Daily Routine */}
        <div className="overflow-hidden">
          <DailyRoutineEngine
            routine={routine}
            setRoutine={setRoutine}
            totalScore={totalScore}
            currentDate={currentDate}
            userId={userId}
            onOpenModal={() => setIsRoutineModalOpen(true)}
            onToggleRoutine={handleToggleRoutine}
          />
        </div>

        {/* Tile 3: To-Do Command */}
        <div className="overflow-hidden">
          <TodoCommand todos={todos} setTodos={setTodos} userId={userId} />
        </div>

        {/* Row 2 */}
        {/* Tile 4: Workout Split */}
        <div className="overflow-hidden">
          <WorkoutSplit
            workoutHistory={workoutHistory}
            setWorkoutHistory={setWorkoutHistory}
            currentDate={currentDate}
            userId={userId}
          />
        </div>

        {/* Tile 5: Achievements (top) and Raw Notes (bottom) */}
        <div className="grid grid-rows-2 gap-4 overflow-hidden">
          {/* Achievements */}
          <div className="overflow-hidden">
            <AchievementsLog
              achievementsCount={achievementCount}
              onOpen={() => setIsAchievementsModalOpen(true)}
            />
          </div>

          {/* Raw Notes */}
          <div className="overflow-hidden">
            <RawNotes notesCount={notesCount} onOpen={() => setIsNotesModalOpen(true)} />
          </div>
        </div>

        {/* Tile 6: Life Architecture */}
        <div className="overflow-hidden">
          <LifeArchitecture 
            lifeGoals={lifeGoals} 
            setLifeGoals={setLifeGoals}
            onOpen={() => setIsLifeArchitectureModalOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => {
          setIsAchievementsModalOpen(false);
          fetchDashboardData();
        }}
        currentDate={currentDate}
        userId={userId}
      />
      <RawNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => {
          setIsNotesModalOpen(false);
          fetchDashboardData();
        }}
        userId={userId}
      />
      <DailyRoutineModal
        isOpen={isRoutineModalOpen}
        onClose={() => setIsRoutineModalOpen(false)}
        routine={routine}
        userId={userId}
        currentDate={currentDate}
        refreshDashboard={fetchDashboardData}
      />
      <LifeArchitectureModal
        isOpen={isLifeArchitectureModalOpen}
        onClose={() => setIsLifeArchitectureModalOpen(false)}
        lifeGoals={lifeGoals}
        setLifeGoals={setLifeGoals}
        userId={userId}
      />
        </>
      )}
    </div>
  );
}
