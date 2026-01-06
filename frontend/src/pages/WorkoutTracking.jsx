import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { exerciseApi, workoutApi, templateApi } from "../services/api";
import RestTimer from "../components/RestTimer";
import ExerciseManager from "../components/ExerciseManager";
import ExerciseSelector from "../components/ExerciseSelector";

function WorkoutTracking() {
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();

  const [exercises, setExercises] = useState([]);
  const [localWorkout, setLocalWorkout] = useState(null);
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [lastPerformances, setLastPerformances] = useState({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [expandedExercises, setExpandedExercises] = useState(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const location = useLocation();

  useEffect(() => {
    loadExercises();

    // Prüfen ob aus Vorlage gestartet
    if (location.state?.templateId) {
      loadTemplateAndStart(location.state.templateId);
    }
  }, [location]);

  const loadExercises = async () => {
    try {
      const response = await exerciseApi.getAll();
      setExercises(response.data);
    } catch (error) {
      console.error("Fehler beim Laden der Übungen:", error);
    }
  };

  const handleDeleteExercise = (exerciseIndex) => {
    const exercise = localWorkout.exercises[exerciseIndex];
    const hasCompletedSets = exercise.sets.some((s) => s.completed);

    if (hasCompletedSets) {
      // Modal anzeigen
      setDeleteConfirm({
        exerciseIndex: exerciseIndex,
        exerciseName: exercise.exerciseName,
      });
    } else {
      // Direkt löschen
      deleteExercise(exerciseIndex);
    }
  };

  const deleteExercise = (exerciseIndex) => {
    const updatedExercises = [...localWorkout.exercises];
    updatedExercises.splice(exerciseIndex, 1);

    // orderIndex aktualisieren
    updatedExercises.forEach((ex, idx) => {
      ex.orderIndex = idx;
    });

    setLocalWorkout({
      ...localWorkout,
      exercises: updatedExercises,
    });

    setDeleteConfirm(null);
  };

  const startWorkout = () => {
    const now = new Date();
    const localDateTime = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 19);

    setLocalWorkout({
      name: `Training ${new Date().toLocaleDateString("de-DE")}`,
      startTime: localDateTime,
      endTime: null,
      exercises: [],
    });
  };

  const loadTemplateAndStart = async (templateId) => {
    try {
      const response = await templateApi.getById(templateId);
      const template = response.data;

      // Training mit Vorlagen-Daten starten
      const now = new Date();
      const localDateTime = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 19);

      // Übungen aus Vorlage vorbereiten
      const exercisesFromTemplate = await Promise.all(
        template.exercises.map(async (te) => {
          // Sätze aus Vorlage oder "Letztes Mal" generieren
          const templateSets = te.setsCount || 3;
          let lastSets = [];

          // "Letztes Mal" Daten laden (synchron warten)
          try {
            const lastPerfResponse = await workoutApi.getLastPerformance(
              te.exercise.id,
              userId
            );
            if (lastPerfResponse.data && lastPerfResponse.data.sets) {
              lastSets = lastPerfResponse.data.sets.sort(
                (a, b) => a.setNumber - b.setNumber
              );

              // Für Anzeige speichern
              setLastPerformances((prev) => ({
                ...prev,
                [te.exercise.id]: lastPerfResponse.data,
              }));
            }
          } catch (error) {
            console.error("Fehler beim Laden der letzten Performance:", error);
          }

          // Anzahl Sätze = Maximum aus (Vorlage, Letztes Mal)
          const setsCount = Math.max(templateSets, lastSets.length);

          // Durchschnitt berechnen falls nötig
          let avgWeight = te.targetWeight || "";
          let avgReps = te.targetReps || "";

          if (lastSets.length > 0 && setsCount > lastSets.length) {
            const calculatedAvgWeight =
              lastSets.reduce((sum, s) => sum + (s.weight || 0), 0) /
              lastSets.length;
            const calculatedAvgReps =
              lastSets.reduce((sum, s) => sum + (s.reps || 0), 0) /
              lastSets.length;

            // Nur Nachkommastelle wenn nicht glatt
            avgWeight =
              calculatedAvgWeight % 1 === 0
                ? calculatedAvgWeight.toString()
                : calculatedAvgWeight.toFixed(1);

            avgReps = Math.round(calculatedAvgReps);
          }

          // Sätze generieren
          const sets = [];
          for (let i = 0; i < setsCount; i++) {
            const lastSet = lastSets[i]; // undefined wenn nicht vorhanden

            sets.push({
              setNumber: i + 1,
              weight: lastSet?.weight || avgWeight || "",
              reps: lastSet?.reps || avgReps || "",
              completed: false,
            });
          }

          return {
            exerciseId: te.exercise.id,
            exerciseName: te.exercise.name,
            orderIndex: te.orderIndex,
            sets: sets,
            comment: "",
          };
        })
      );

      setLocalWorkout({
        name: `${template.name} - ${new Date().toLocaleDateString("de-DE")}`,
        startTime: localDateTime,
        endTime: null,
        exercises: exercisesFromTemplate,
      });

      // State zurücksetzen damit es nicht nochmal geladen wird
      window.history.replaceState({}, document.title);
    } catch (error) {
      console.error("Fehler beim Laden der Vorlage:", error);
      alert("Fehler beim Laden der Vorlage!");
    }
  };

  const loadLastPerformance = async (exerciseId) => {
    try {
      const response = await workoutApi.getLastPerformance(exerciseId, userId);
      if (response.data) {
        setLastPerformances({
          ...lastPerformances,
          [exerciseId]: response.data,
        });
      }
    } catch (error) {
      console.error("Fehler beim Laden der letzten Performance:", error);
    }
  };

  const addExerciseToWorkout = async (exercise) => {
    let initialSets = [];

    try {
      const response = await workoutApi.getLastPerformance(exercise.id, userId);

      if (response.data && response.data.sets) {
        initialSets = response.data.sets
          .sort((a, b) => a.setNumber - b.setNumber)
          .map((set, index) => ({
            setNumber: index + 1,
            weight: set.weight,
            reps: set.reps,
            completed: false,
          }));

        // Auch für "Letztes Mal" Anzeige speichern
        setLastPerformances({
          ...lastPerformances,
          [exercise.id]: response.data,
        });
      }
    } catch (error) {
      console.error("Fehler beim Laden der letzten Performance:", error);
    }

    setLocalWorkout({
      ...localWorkout,
      exercises: [
        ...localWorkout.exercises,
        {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          orderIndex: localWorkout.exercises.length,
          sets: initialSets,
          comment: "",
        },
      ],
    });
    setShowExerciseList(false);
  };

  const toggleExercise = (exerciseId) => {
    const newExpanded = new Set(expandedExercises);
    if (newExpanded.has(exerciseId)) {
      newExpanded.delete(exerciseId);
    } else {
      newExpanded.add(exerciseId);
    }
    setExpandedExercises(newExpanded);
  };

  const addEmptySet = (exerciseIndex) => {
    const updatedExercises = [...localWorkout.exercises];
    const exercise = updatedExercises[exerciseIndex];

    exercise.sets.push({
      setNumber: exercise.sets.length + 1,
      weight: "",
      reps: "",
      completed: false,
    });

    setLocalWorkout({
      ...localWorkout,
      exercises: updatedExercises,
    });
  };

  const removeLastUncompletedSet = (exerciseIndex) => {
    const updatedExercises = [...localWorkout.exercises];
    const exercise = updatedExercises[exerciseIndex];

    // Finde letzten nicht-gecheckten Satz
    const lastUncompletedIndex = exercise.sets
      .map((set, idx) => (set.completed ? -1 : idx))
      .filter((idx) => idx >= 0)
      .pop();

    if (lastUncompletedIndex !== undefined) {
      exercise.sets.splice(lastUncompletedIndex, 1);

      // Satznummern neu durchnummerieren
      exercise.sets.forEach((set, idx) => {
        set.setNumber = idx + 1;
      });

      setLocalWorkout({
        ...localWorkout,
        exercises: updatedExercises,
      });
    }
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const updatedExercises = [...localWorkout.exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;

    setLocalWorkout({
      ...localWorkout,
      exercises: updatedExercises,
    });
  };

  const toggleSetCompleted = (exerciseIndex, setIndex) => {
    const updatedExercises = [...localWorkout.exercises];
    const set = updatedExercises[exerciseIndex].sets[setIndex];

    set.completed = !set.completed;

    setLocalWorkout({
      ...localWorkout,
      exercises: updatedExercises,
    });

    // Timer starten wenn Satz gecheckt wird
    if (set.completed) {
      setTimerKey((prev) => prev + 1);
      setTimerActive(true);
    }
  };

  const updateExerciseComment = (exerciseIndex, comment) => {
    const updatedExercises = [...localWorkout.exercises];
    updatedExercises[exerciseIndex].comment = comment;

    setLocalWorkout({
      ...localWorkout,
      exercises: updatedExercises,
    });
  };

  const handleTimerComplete = () => {
    setTimerActive(false);
  };

  const handleTimerSkip = () => {
    setTimerActive(false);
  };

  const handleBackClick = () => {
    if (localWorkout) {
      setShowCancelModal(true);
    } else {
      navigate("/");
    }
  };

  const cancelWorkout = () => {
    setLocalWorkout(null);
    setShowCancelModal(false);
    navigate("/");
  };

  const moveExercise = (fromIndex, toIndex) => {
    const updatedExercises = [...localWorkout.exercises];
    const [movedExercise] = updatedExercises.splice(fromIndex, 1);
    updatedExercises.splice(toIndex, 0, movedExercise);

    // orderIndex aktualisieren
    updatedExercises.forEach((ex, idx) => {
      ex.orderIndex = idx;
    });

    setLocalWorkout({
      ...localWorkout,
      exercises: updatedExercises,
    });
  };

  const handleFinishClick = () => {
    setShowFinishModal(true);
  };

  const finishWorkout = async () => {
    try {
      const filteredExercises = localWorkout.exercises
        .filter((ex) => ex.sets.some((s) => s.completed))
        .map((ex) => ({
          exerciseId: ex.exerciseId,
          orderIndex: ex.orderIndex,
          comment: ex.comment || null,
          sets: ex.sets.filter((s) => s.completed),
        }));

      if (filteredExercises.length === 0) {
        alert("Bitte mindestens einen Satz abschließen!");
        setShowFinishModal(false);
        return;
      }

      // Endzeit setzen
      const now = new Date();
      const endTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19);

      const workoutData = {
        userId: userId,
        name: localWorkout.name,
        startTime: localWorkout.startTime,
        endTime: endTime,
        exercises: filteredExercises,
      };

      await workoutApi.saveComplete(workoutData);

      setLocalWorkout(null);
      setShowFinishModal(false);
      navigate("/workout/history");
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Fehler beim Speichern des Trainings!");
    }
  };

  const saveAsTemplate = async () => {
    if (!templateName.trim()) {
      alert("Bitte einen Namen für die Vorlage eingeben!");
      return;
    }

    try {
      const templateData = {
        userId: userId,
        name: templateName,
        exercises: localWorkout.exercises.map((ex, index) => ({
          exerciseId: ex.exerciseId,
          orderIndex: index,
          setsCount: ex.sets.length,
          targetWeight: ex.sets.length > 0 ? ex.sets[0].weight : null,
          targetReps: ex.sets.length > 0 ? ex.sets[0].reps : null,
        })),
      };

      await templateApi.create(templateData);

      setShowSaveTemplateModal(false);
      setTemplateName("");
      alert("Vorlage erfolgreich gespeichert!");
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Fehler beim Speichern der Vorlage!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackClick}
            className="text-blue-500 hover:text-blue-700 text-2xl"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold">Training</h1>
        </div>
      </div>

      {timerActive && (
        <RestTimer
          key={timerKey}
          onComplete={handleTimerComplete}
          onSkip={handleTimerSkip}
        />
      )}

      <div className="p-4">
        {/* Kein aktives Training */}
        {!localWorkout && (
          <div className="space-y-4">
            <button
              onClick={startWorkout}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded"
            >
              Neues Training starten
            </button>

            <ExerciseManager
              exercises={exercises}
              onExerciseCreated={loadExercises}
            />
          </div>
        )}

        {/* Aktives Training */}
        {localWorkout && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">
                {localWorkout.name}
              </h2>
              <p className="text-sm text-gray-600">
                {new Date(localWorkout.startTime).toLocaleString("de-DE")}
              </p>
            </div>

            {!showExerciseList && (
              <button
                onClick={() => setShowExerciseList(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              >
                + Übung hinzufügen
              </button>
            )}

            {showExerciseList && (
              <ExerciseSelector
                exercises={exercises}
                alreadyAddedExerciseIds={localWorkout.exercises.map(
                  (ex) => ex.exerciseId
                )}
                onExerciseSelected={addExerciseToWorkout}
                onCancel={() => setShowExerciseList(false)}
              />
            )}

            {/* Übungen im Training */}
            {localWorkout.exercises.map((ex, exerciseIndex) => {
              const isExpanded = expandedExercises.has(ex.exerciseId);

              // Statistiken für zugeklappte Ansicht
              const completedSets = ex.sets.filter((s) => s.completed);
              const totalCompleted = completedSets.length;
              const avgWeight =
                totalCompleted > 0
                  ? (
                      completedSets.reduce(
                        (sum, set) => sum + parseFloat(set.weight || 0),
                        0
                      ) / totalCompleted
                    ).toFixed(1)
                  : 0;
              const avgReps =
                totalCompleted > 0
                  ? Math.round(
                      completedSets.reduce(
                        (sum, set) => sum + parseInt(set.reps || 0),
                        0
                      ) / totalCompleted
                    )
                  : 0;

              return (
                <div key={exerciseIndex} className="bg-white rounded-lg shadow">
                  {/* Header - immer sichtbar */}
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteExercise(exerciseIndex);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded flex items-center justify-center font-bold text-xl flex-shrink-0"
                        title="Übung entfernen"
                      >
                        ✕
                      </button>

                      {/* Übungs-Info - klickbar zum Auf/Zuklappen */}
                      <div
                        onClick={() => toggleExercise(ex.exerciseId)}
                        className="flex-1 cursor-pointer"
                      >
                        <h3 className="font-semibold text-lg">
                          {ex.exerciseName}
                        </h3>
                        {totalCompleted > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            {totalCompleted} Sätze · ⌀ {avgWeight}kg × {avgReps}{" "}
                            Wdh.
                          </p>
                        )}
                        {totalCompleted === 0 && (
                          <p className="text-sm text-gray-400"></p>
                        )}
                      </div>

                      {/* Reihenfolge-Buttons */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (exerciseIndex > 0) {
                              moveExercise(exerciseIndex, exerciseIndex - 1);
                            }
                          }}
                          disabled={exerciseIndex === 0}
                          className={`text-xl ${
                            exerciseIndex === 0
                              ? "text-gray-300"
                              : "text-blue-500 hover:text-blue-700"
                          }`}
                        >
                          ▲
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              exerciseIndex <
                              localWorkout.exercises.length - 1
                            ) {
                              moveExercise(exerciseIndex, exerciseIndex + 1);
                            }
                          }}
                          disabled={
                            exerciseIndex === localWorkout.exercises.length - 1
                          }
                          className={`text-xl ${
                            exerciseIndex === localWorkout.exercises.length - 1
                              ? "text-gray-300"
                              : "text-blue-500 hover:text-blue-700"
                          }`}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Details - nur wenn aufgeklappt */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t pt-4">
                      {/* Tabellen-Header */}
                      <div className="grid grid-cols-12 gap-2 mb-2 text-sm font-medium text-gray-600">
                        <div className="col-span-2 text-center">#</div>
                        <div className="col-span-4 text-center">kg</div>
                        <div className="col-span-4 text-center">Wdh.</div>
                        <div className="col-span-2 text-center">Done</div>
                      </div>

                      {/* Sätze */}
                      {ex.sets.length > 0 ? (
                        <div className="space-y-2 mb-3">
                          {ex.sets.map((set, setIndex) => (
                            <div
                              key={setIndex}
                              className="grid grid-cols-12 gap-2 items-center"
                            >
                              {/* Satznummer */}
                              <div className="col-span-2 text-center font-medium text-gray-700">
                                {set.setNumber}
                              </div>

                              {/* Gewicht */}
                              <div className="col-span-4">
                                <input
                                  type="number"
                                  step="0.5"
                                  value={set.weight}
                                  onChange={(e) =>
                                    updateSet(
                                      exerciseIndex,
                                      setIndex,
                                      "weight",
                                      e.target.value
                                    )
                                  }
                                  disabled={set.completed}
                                  className={`w-full border rounded px-2 py-2 text-center ${
                                    set.completed
                                      ? "bg-gray-100 text-gray-500"
                                      : ""
                                  }`}
                                />
                              </div>

                              {/* Wiederholungen */}
                              <div className="col-span-4">
                                <input
                                  type="number"
                                  value={set.reps}
                                  onChange={(e) =>
                                    updateSet(
                                      exerciseIndex,
                                      setIndex,
                                      "reps",
                                      e.target.value
                                    )
                                  }
                                  disabled={set.completed}
                                  className={`w-full border rounded px-2 py-2 text-center ${
                                    set.completed
                                      ? "bg-gray-100 text-gray-500"
                                      : ""
                                  }`}
                                />
                              </div>

                              {/* Checkbox */}
                              <div className="col-span-2 flex justify-center">
                                <input
                                  type="checkbox"
                                  checked={set.completed}
                                  onChange={() =>
                                    toggleSetCompleted(exerciseIndex, setIndex)
                                  }
                                  className="w-5 h-5 cursor-pointer"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          Noch keine Sätze vorhanden
                        </p>
                      )}

                      {/* Kommentar-Sektion */}
                      <div className="pt-3 border-t mt-3">
                        {/* Letzter Kommentar (falls vorhanden) */}
                        {lastPerformances[ex.exerciseId] &&
                          lastPerformances[ex.exerciseId].comment && (
                            <div className="bg-yellow-50 p-3 rounded mb-3">
                              <p className="text-xs font-medium text-yellow-800 mb-1">
                                Letzter Kommentar:
                              </p>
                              <p className="text-sm text-yellow-900">
                                {lastPerformances[ex.exerciseId].comment}
                              </p>
                            </div>
                          )}

                        {/* Neuer Kommentar */}
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Kommentar (optional):
                          </label>
                          <textarea
                            value={ex.comment || ""}
                            onChange={(e) =>
                              updateExerciseComment(
                                exerciseIndex,
                                e.target.value
                              )
                            }
                            placeholder="Notizen zu dieser Übung..."
                            rows={2}
                            className="w-full border rounded px-3 py-2 text-sm resize-none"
                          />
                        </div>
                      </div>

                      {/* Satz hinzufügen/entfernen */}
                      <div className="flex gap-2 justify-center pt-3 border-t">
                        <button
                          onClick={() =>
                            removeLastUncompletedSet(exerciseIndex)
                          }
                          className="bg-red-500 hover:bg-red-600 text-white w-12 h-12 rounded flex items-center justify-center text-2xl font-bold"
                        >
                          −
                        </button>
                        <button
                          onClick={() => addEmptySet(exerciseIndex)}
                          className="bg-green-500 hover:bg-green-600 text-white w-12 h-12 rounded flex items-center justify-center text-2xl font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Training beenden */}
            <button
              onClick={handleFinishClick}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded"
            >
              Training beenden
            </button>

            {/* Als Vorlage speichern */}
            <button
              onClick={() => setShowSaveTemplateModal(true)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded"
            >
              📋 Als Vorlage speichern
            </button>
          </div>
        )}
      </div>

      {/* Delete-Bestätigung Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Übung entfernen?</h2>
            <p className="text-gray-600 mb-2">
              Möchtest du <strong>{deleteConfirm.exerciseName}</strong> wirklich
              entfernen?
            </p>
            <p className="text-sm text-red-600 mb-6">
              Diese Übung hat bereits erledigte Sätze!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded"
              >
                Abbrechen
              </button>
              <button
                onClick={() => deleteExercise(deleteConfirm.exerciseIndex)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded"
              >
                Entfernen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abbrechen Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Training verwerfen?</h2>
            <p className="text-gray-600 mb-6">
              Das Training wurde noch nicht gespeichert. Möchtest du es wirklich
              verwerfen?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded"
              >
                Zurück
              </button>
              <button
                onClick={cancelWorkout}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded"
              >
                Verwerfen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beenden Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Training beenden?</h2>
            <p className="text-gray-600 mb-6">
              Möchtest du das Training speichern und beenden?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFinishModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded"
              >
                Abbrechen
              </button>
              <button
                onClick={finishWorkout}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template speichern Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Als Vorlage speichern</h2>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Name der Vorlage..."
              className="w-full border rounded px-3 py-2 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveTemplateModal(false);
                  setTemplateName("");
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded"
              >
                Abbrechen
              </button>
              <button
                onClick={saveAsTemplate}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutTracking;
