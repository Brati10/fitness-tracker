import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import Navigation from "./Navigation";

import { useTraining } from "../context/TrainingContext";

function PageHeader({ title, showBack = true, backTo }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    activeWorkout,
    timerEndTime,
    timerActive,
    stopTimer,
    discardTraining,
  } = useTraining();
  const [timeLeft, setTimeLeft] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Timer-Berechnung
  useEffect(() => {
    if (!timerActive || !timerEndTime) {
      setTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((timerEndTime - now) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        stopTimer();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [timerEndTime, timerActive, stopTimer]);

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const completedExercises =
    activeWorkout?.exercises.filter((ex) => ex.sets.some((s) => s.completed))
      .length || 0;

  const isTrainingPage = location.pathname === "/workout";

  return (
    <div className="sticky top-0 z-50">
      {/* Training Banner - nur wenn Training aktiv UND nicht auf /workout */}
      {activeWorkout && !isTrainingPage && (
        <div className="bg-blue-600 dark:bg-blue-700 text-white p-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            {/* Training Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">💪</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-sm">
                    {activeWorkout.name}
                  </p>
                  <p className="text-xs opacity-90">
                    {completedExercises}/{activeWorkout.exercises.length}{" "}
                    Übungen
                    {timerActive && ` · ⏱️ ${formatTime(timeLeft)}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => navigate("/workout")}
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm font-medium"
              >
                Fortsetzen
              </button>
              <button
                onClick={discardTraining}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-medium"
              >
                Verwerfen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={handleBack}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-xl"
              >
                ←
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {title}
            </h1>
          </div>

          {/* Burger Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center text-2xl shadow-lg"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Navigation Sidebar */}
      <Navigation isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}

export default PageHeader;
