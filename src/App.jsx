import React, { useState, useEffect } from 'react';
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

export default function App() {
  const userId = 'testuser123'; // In production, get from auth context
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

  // Workout State - will keep as is for now (not from dashboard API)
  const [workoutData, setWorkoutData] = useState({
    "05-05-26": {
      "Pike Pushups": { weight: "BW", reps: "12, 10, 8" },
      "Diamond Pushups": { weight: "BW", reps: "15, 12, 12" }
    },
    "04-05-26": {
      "Bench Press": { weight: "185 lbs", reps: "8, 6, 5" },
      "Squats": { weight: "245 lbs", reps: "10, 8, 6" }
    },
    "03-05-26": {
      "Deadlifts": { weight: "315 lbs", reps: "5, 3, 2" },
      "Rows": { weight: "185 lbs", reps: "8, 8, 8" }
    }
  });

  // Fetch dashboard data on mount
  useEffect(() => {
    // Get today's date in DD-MM-YY format
    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getFullYear()).slice(-2)}`;
    setCurrentDate(todayStr);

    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/dashboard?userId=${userId}`);
        const data = await response.json();

        // Update todos
        setTodos(data.todos);

        setBirthDate(data?.user?.dob || '2000-00-00T00:00:00');

        // Update achievements count (if needed - currently just a count)
        setAchievements(data.achievements || []);
        setAchievementCount(data.achievementCount || 0);

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

    fetchDashboardData();
  }, [userId]);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950 p-6 flex flex-col overflow-hidden">
      {loading && (
        <div className="flex items-center justify-center h-full">
          <p className="text-white">Loading dashboard...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Header - Limitlessness + Score */}
          <div className="mb-4 flex-shrink-0 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Limitlessness</h1>
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
            setTotalScore={setTotalScore}
            currentDate={currentDate}
            onOpenModal={() => setIsRoutineModalOpen(true)}
          />
        </div>

        {/* Tile 3: To-Do Command */}
        <div className="overflow-hidden">
          <TodoCommand todos={todos} setTodos={setTodos} />
        </div>

        {/* Row 2 */}
        {/* Tile 4: Workout Split */}
        <div className="overflow-hidden">
          <WorkoutSplit
            workoutData={workoutData}
            setWorkoutData={setWorkoutData}
            currentDate={currentDate}
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
        onClose={() => setIsAchievementsModalOpen(false)}
        achievements={achievements}
        setAchievements={setAchievements}
        currentDate={currentDate}
      />
      <RawNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        notes={notes}
        setNotes={setNotes}
      />
      <DailyRoutineModal
        isOpen={isRoutineModalOpen}
        onClose={() => setIsRoutineModalOpen(false)}
        routine={routine}
        setRoutine={setRoutine}
        currentDate={currentDate}
      />
      <LifeArchitectureModal
        isOpen={isLifeArchitectureModalOpen}
        onClose={() => setIsLifeArchitectureModalOpen(false)}
        lifeGoals={lifeGoals}
        setLifeGoals={setLifeGoals}
      />
        </>
      )}
    </div>
  );
}
