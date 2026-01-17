import { createContext, useContext, useState, useEffect } from "react";

const TrainingContext = createContext();

export const useTraining = () => {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error("useTraining must be used within TrainingProvider");
  }
  return context;
};

export const TrainingProvider = ({ children }) => {
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [timerEndTime, setTimerEndTime] = useState(null);
  const [timerActive, setTimerActive] = useState(false);

  // Training starten
  const startTraining = (workoutData) => {
    setActiveWorkout(workoutData);
  };

  // Training beenden/speichern
  const finishTraining = () => {
    setActiveWorkout(null);
    setTimerEndTime(null);
    setTimerActive(false);
  };

  // Training verwerfen
  const discardTraining = () => {
    if (
      window.confirm("Training wirklich verwerfen? Alle Daten gehen verloren!")
    ) {
      setActiveWorkout(null);
      setTimerEndTime(null);
      setTimerActive(false);
      return true;
    }
    return false;
  };

  // Timer starten
  const startTimer = (durationSeconds) => {
    const endTime = new Date(Date.now() + durationSeconds * 1000);
    setTimerEndTime(endTime);
    setTimerActive(true);
  };

  // Timer stoppen
  const stopTimer = () => {
    setTimerEndTime(null);
    setTimerActive(false);
  };

  // Timer Zeit anpassen
  const adjustTimer = (seconds) => {
    if (timerEndTime) {
      setTimerEndTime(new Date(timerEndTime.getTime() + seconds * 1000));
    }
  };

  const value = {
    activeWorkout,
    setActiveWorkout,
    startTraining,
    finishTraining,
    discardTraining,
    timerEndTime,
    timerActive,
    startTimer,
    stopTimer,
    adjustTimer,
  };

  return (
    <TrainingContext.Provider value={value}>
      {children}
    </TrainingContext.Provider>
  );
};
