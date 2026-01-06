import { useState, useEffect } from "react";
import { workoutApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

import PageHeader from "../components/PageHeader";

function WorkoutHistory() {
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const response = await workoutApi.getUserWorkouts(userId);
      setWorkouts(response.data);
    } catch (error) {
      console.error("Fehler beim Laden der Trainings:", error);
    }
  };

  const loadWorkoutDetails = async (workoutId) => {
    try {
      const response = await workoutApi.getById(workoutId);
      setSelectedWorkout(response.data);
    } catch (error) {
      console.error("Fehler beim Laden der Details:", error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {!selectedWorkout ? (
        <>
          <PageHeader title="Trainings-Historie" showBack backTo="/" />
          <div className="p-4 space-y-3">
            {workouts.length === 0 ? (
              <p className="text-gray-500">Noch keine Trainings vorhanden.</p>
            ) : (
              workouts.map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => loadWorkoutDetails(workout.id)}
                  className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50"
                >
                  <h3 className="font-semibold text-lg">
                    {workout.name || "Training"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(workout.startTime).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>{workout.exercises?.length || 0} Übungen</span>
                    {calculateDuration(workout.startTime, workout.endTime) && (
                      <>
                        <span>•</span>
                        <span>
                          ⏱️{" "}
                          {calculateDuration(
                            workout.startTime,
                            workout.endTime
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedWorkout(null)}
                className="text-blue-500 hover:text-blue-700 text-2xl"
              >
                ←
              </button>
              <h1 className="text-2xl font-bold">Training Details</h1>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-2">
                {selectedWorkout.name || "Training"}
              </h2>
              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <p>
                  Start:{" "}
                  {new Date(selectedWorkout.startTime).toLocaleString("de-DE")}
                </p>
                {selectedWorkout.endTime && (
                  <>
                    <p>
                      Ende:{" "}
                      {new Date(selectedWorkout.endTime).toLocaleString(
                        "de-DE"
                      )}
                    </p>
                    {calculateDuration(
                      selectedWorkout.startTime,
                      selectedWorkout.endTime
                    ) && (
                      <p className="font-medium text-blue-600">
                        Dauer:{" "}
                        {calculateDuration(
                          selectedWorkout.startTime,
                          selectedWorkout.endTime
                        )}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-3">
                {selectedWorkout.exercises?.map((we) => (
                  <div key={we.id} className="border-t pt-3">
                    <h3 className="font-semibold text-lg mb-2">
                      {we.exercise.name}
                    </h3>

                    {/* Kommentar (falls vorhanden) */}
                    {we.comment && (
                      <div className="bg-yellow-50 p-3 rounded mb-3 border-l-4 border-yellow-400">
                        <p className="text-xs font-medium text-yellow-800 mb-1">
                          Kommentar:
                        </p>
                        <p className="text-sm text-yellow-900">{we.comment}</p>
                      </div>
                    )}

                    {/* Sätze */}
                    {we.sets && we.sets.length > 0 ? (
                      <div className="space-y-1">
                        {we.sets.map((set) => (
                          <div
                            key={set.id}
                            className="text-sm bg-gray-50 p-2 rounded"
                          >
                            Satz {set.setNumber}: {set.weight} kg × {set.reps}{" "}
                            Wdh.
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Keine Sätze erfasst
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default WorkoutHistory;
