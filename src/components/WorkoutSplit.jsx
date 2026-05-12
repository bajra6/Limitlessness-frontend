import React, { useState } from 'react';
import WorkoutSplitModal from './WorkoutSplitModal';

export default function WorkoutSplit({ workoutData, setWorkoutData, currentDate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="glass-tile p-6 flex flex-col items-center justify-center h-full cursor-pointer hover:bg-zinc-900/60 transition"
      >
        <h3 className="text-2xl font-bold text-white mb-2">Workout Split</h3>
        <p className="text-lg text-indigo-300 font-semibold">improvement everyday</p>
      </div>

      <WorkoutSplitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workoutData={workoutData}
        setWorkoutData={setWorkoutData}
        currentDate={currentDate}
      />
    </>
  );
}
