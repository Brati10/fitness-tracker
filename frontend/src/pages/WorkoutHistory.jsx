import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { workoutApi, preferencesApi } from "../services/api";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import { displayWeightWithLabel } from "../utils/weightConversion";
import { formatDateTime } from "../utils/dateFormat";

function WorkoutHistory() {
  const { user } = useAuth();
  const userId = user?.id;

  const [workouts, setWorkouts] = useState([]);
  const [userPreferences, setUserPreferences] = useState(null);
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  const [timeFilter, setTimeFilter] = useState("recent"); // 'recent', '1month', '3months', '6months', 'all'

  useEffect(() => {
    loadWorkouts();
    loadUserPreferences();
  }, []);

  const loadWorkouts = async () => {
    try {
      const response = await workoutApi.getUserWorkouts(userId);
      setWorkouts(response.data);
    } catch (error) {
      console.error("Fehler beim Laden:", error);
      alert("Fehler beim Laden der Trainings!");
    }
  };

  const loadUserPreferences = async () => {
    try {
      const response = await preferencesApi.getUserPreferences(userId);
      setUserPreferences(response.data);
    } catch (error) {
      console.error("Fehler beim Laden der Preferences:", error);
    }
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return null;

    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;

    if (diffMs <= 0) return null;

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const getFilteredWorkouts = () => {
    if (timeFilter === "recent") {
      return workouts.slice(0, 6);
    }

    if (timeFilter === "all") {
      return workouts;
    }

    const now = new Date();
    let startDate = new Date();

    switch (timeFilter) {
      case "1month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3months":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(now.getMonth() - 6);
        break;
      default:
        return workouts;
    }

    return workouts.filter((w) => new Date(w.startTime) >= startDate);
  };

  const toggleWorkout = (workoutId) => {
    if (expandedWorkout === workoutId) {
      setExpandedWorkout(null);
    } else {
      setExpandedWorkout(workoutId);
    }
  };

  const filteredWorkouts = getFilteredWorkouts();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Trainings-Historie" showBack backTo="/" />

      <div className="p-4 space-y-4">
        {/* Filter */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Zeitraum:
          </label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="recent">Letzte 6 Trainings</option>
            <option value="1month">Letzter Monat</option>
            <option value="3months">Letzte 3 Monate</option>
            <option value="6months">Letzte 6 Monate</option>
            <option value="all">Alle</option>
          </select>
        </div>

        {/* Workouts */}
        {filteredWorkouts.length === 0 ? (
          <EmptyState message="Noch keine Trainings vorhanden." icon="💪" />
        ) : (
          filteredWorkouts.map((workout) => {
            const isExpanded = expandedWorkout === workout.id;
            const duration = calculateDuration(
              workout.startTime,
              workout.endTime
            );
            const totalExercises = workout.exercises?.length || 0;

            return (
              <div
                key={workout.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow"
              >
                {/* Header - klickbar */}
                <div
                  onClick={() => toggleWorkout(workout.id)}
                  className="p-4 cursor-pointer transition rounded-t-lg hover:opacity-90"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                        {workout.name || "Training"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {formatDateTime(workout.startTime)}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{totalExercises} Übungen</span>
                        {duration && (
                          <>
                            <span>•</span>
                            <span>⏱️ {duration}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details - nur wenn aufgeklappt */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t dark:border-gray-700">
                    <div className="space-y-4 mt-4">
                      {workout.exercises?.map((we) => (
                        <div
                          key={we.id}
                          className="border-l-4 border-blue-500 pl-3"
                        >
                          <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-2">
                            {we.exercise.name}
                          </h4>

                          {/* Kommentar */}
                          {we.comment && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded mb-3 border-l-4 border-yellow-400">
                              <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                                Kommentar:
                              </p>
                              <p className="text-sm text-yellow-900 dark:text-yellow-200">
                                {we.comment}
                              </p>
                            </div>
                          )}

                          {/* Sätze */}
                          {we.sets && we.sets.length > 0 ? (
                            <div className="space-y-1">
                              {we.sets.map((set) => (
                                <div
                                  key={set.id}
                                  className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded"
                                >
                                  <span className="text-gray-700 dark:text-gray-300">
                                    Satz {set.setNumber}:{" "}
                                    {we.exercise.exerciseType === "CARDIO" ? (
                                      // CARDIO: Zeit & Distanz
                                      <>
                                        {(() => {
                                          const mins = Math.floor(
                                            (set.durationSeconds || 0) / 60
                                          );
                                          const secs =
                                            (set.durationSeconds || 0) % 60;
                                          return `⏱️ ${mins}:${secs.toString().padStart(2, "0")}`;
                                        })()}
                                        {set.distanceKm &&
                                          ` • 📏 ${set.distanceKm.toFixed(2)} km`}
                                        {set.distanceKm &&
                                          set.durationSeconds &&
                                          (() => {
                                            const paceSeconds =
                                              set.durationSeconds /
                                              set.distanceKm;
                                            const paceMins = Math.floor(
                                              paceSeconds / 60
                                            );
                                            const paceSecs = Math.round(
                                              paceSeconds % 60
                                            );
                                            return ` • 🏃 ${paceMins}:${paceSecs.toString().padStart(2, "0")}/km`;
                                          })()}
                                      </>
                                    ) : (
                                      // STRENGTH: Gewicht & Wiederholungen
                                      <>
                                        {displayWeightWithLabel(
                                          set.weight,
                                          userPreferences?.weightUnit || "kg"
                                        )}{" "}
                                        × {set.reps} Wdh.
                                      </>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Keine Sätze erfasst
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default WorkoutHistory;
