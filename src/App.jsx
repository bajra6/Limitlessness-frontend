import React, { useState } from 'react';
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
  const currentDate = "06-05-26";

  // Modal States
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [isLifeArchitectureModalOpen, setIsLifeArchitectureModalOpen] = useState(false);

  // Total Score State
  const [totalScore, setTotalScore] = useState(1250);

  // Routine State
  const [routine, setRoutine] = useState({
    "06-05-26": {
      1: { activity: "Deep Work (2 hrs)", points: 50, completedToday: false },
      2: { activity: "Read 10 Pages", points: 20, completedToday: true },
      3: { activity: "No Sugar", points: 30, completedToday: false },
      4: { activity: "Skip Workout", points: -40, completedToday: false }
    }
  });

  // Todos State
  const [todos, setTodos] = useState({
    pending: [
      { task: "Review Stochastic Calculus Notes", setdate: "04-05-26", duedate: "08-05-26" },
      { task: "Deploy Command Center", setdate: "05-05-26", duedate: "10-05-26" },
      { task: "Complete LeetCode problems", setdate: "06-05-26", duedate: "06-05-26" }
    ],
    completed: [
      { task: "Setup React Vite Project", setdate: "05-05-26", duedate: "06-05-26" }
    ]
  });

  // Life Goals State
  const [lifeGoals, setLifeGoals] = useState({
    "goal_1": {
      goal: "Transition to Quant Role",
      progress: 50,
      steps: [
        { stepname: "Build Backtesting Engine", duedate: "01-06-26", completed: false },
        { stepname: "Master Black-Scholes", duedate: "15-05-26", completed: true }
      ]
    }
  });

  // Achievements State
  const [achievements, setAchievements] = useState([
    { achievement: "Completed Oracle Tenure", date: "01-06-25" },
    { achievement: "Accepted into IISc", date: "01-08-25" }
  ]);

  // Notes State
  const [notes, setNotes] = useState({
    "06-05-26 09:00:00": "Focus on the builder identity. Output > Input.",
    "05-05-26 21:30:00": "Felt stagnant today. Need to stick to the workout protocol."
  });

  // Workout State
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

  return (
    <div className="h-screen w-full bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950 p-6 flex flex-col overflow-hidden">
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
          <AgeMatrix />
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
              achievements={achievements}
              onOpen={() => setIsAchievementsModalOpen(true)}
            />
          </div>

          {/* Raw Notes */}
          <div className="overflow-hidden">
            <RawNotes notes={notes} onOpen={() => setIsNotesModalOpen(true)} />
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
    </div>
  );
}
