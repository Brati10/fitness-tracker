import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTraining } from "../context/TrainingContext";
import {
  exerciseApi,
  workoutApi,
  templateApi,
  preferencesApi,
} from "../services/api";
import ExerciseSelector from "../components/ExerciseSelector";
import PageHeader from "../components/PageHeader";
import { displayWeight } from "../utils/weightConversion";
import { DEFAULT_SETS_COUNT } from "../utils/constants";

function WorkoutTracking() {
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();

  const {
    activeWorkout,
    setActiveWorkout,
    startTraining,
    finishTraining,
    discardTraining,
    timerActive,
    timerEndTime,
    startTimer,
    stopTimer,
    adjustTimer,
  } = useTraining();

  const localWorkout = activeWorkout;
  const setLocalWorkout = setActiveWorkout;

  const [exercises, setExercises] = useState([]);
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [lastPerformances, setLastPerformances] = useState({});
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [expandedExercises, setExpandedExercises] = useState(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templates, setTemplates] = useState([]);
  const [userPreferences, setUserPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    loadExercises();
    loadTemplates();
    loadUserPreferences();

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
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await templateApi.getUserTemplates(userId);
      setTemplates(response.data);
    } catch (error) {
      console.error("Fehler beim Laden der Vorlagen:", error);
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
      now.getTime() - now.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 19);

    const newWorkout = {
      name: `Training ${new Date().toLocaleDateString("de-DE")}`,
      startTime: localDateTime,
      endTime: null,
      exercises: [],
    };

    startTraining(newWorkout);
  };

  const loadTemplateAndStart = async (templateId) => {
    try {
      const response = await templateApi.getById(templateId);
      const template = response.data;

      // Training mit Vorlagen-Daten starten
      const now = new Date();
      const localDateTime = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 19);

      // Übungen aus Vorlage vorbereiten
      const exercisesFromTemplate = await Promise.all(
        template.exercises.map(async (te) => {
          // Sätze aus Vorlage oder "Letztes Mal" generieren
          const templateSets = te.setsCount || DEFAULT_SETS_COUNT;
          let lastSets = [];

          // "Letztes Mal" Daten laden (synchron warten)
          try {
            const lastPerfResponse = await workoutApi.getLastPerformance(
              te.exercise.id,
              userId,
            );
            if (lastPerfResponse.data && lastPerfResponse.data.sets) {
              lastSets = lastPerfResponse.data.sets.sort(
                (a, b) => a.setNumber - b.setNumber,
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
          let avgDuration = te.targetDurationSeconds || null;
          let avgDistance = te.targetDistanceKm || null;

          if (te.exercise.exerciseType === "CARDIO") {
            // CARDIO: Durchschnitt aus letzten Sätzen
            if (lastSets.length > 0 && setsCount > lastSets.length) {
              const calculatedAvgDuration =
                lastSets.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) /
                lastSets.length;
              const calculatedAvgDistance =
                lastSets.reduce((sum, s) => sum + (s.distanceKm || 0), 0) /
                lastSets.length;

              avgDuration = Math.round(calculatedAvgDuration);
              avgDistance =
                calculatedAvgDistance > 0
                  ? parseFloat(calculatedAvgDistance.toFixed(2))
                  : null;
            }
          } else {
            // STRENGTH: Durchschnitt aus letzten Sätzen
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
          }

          // Sätze generieren
          const sets = [];
          for (let i = 0; i < setsCount; i++) {
            const lastSet = lastSets[i]; // undefined wenn nicht vorhanden

            if (te.exercise.exerciseType === "CARDIO") {
              // CARDIO Sätze
              sets.push({
                setNumber: i + 1,
                durationSeconds:
                  lastSet?.durationSeconds || avgDuration || null,
                distanceKm: lastSet?.distanceKm || avgDistance || null,
                reps: null,
                weight: null,
                completed: false,
              });
            } else {
              // STRENGTH Sätze
              sets.push({
                setNumber: i + 1,
                weight: lastSet?.weight || avgWeight || "",
                reps: lastSet?.reps || avgReps || "",
                durationSeconds: null,
                distanceKm: null,
                completed: false,
              });
            }
          }

          return {
            exerciseId: te.exercise.id,
            exerciseName: te.exercise.name,
            exerciseType: te.exercise.exerciseType,
            weightPerSide: te.exercise.weightPerSide || false,
            equipmentType: te.exercise.equipmentType,
            orderIndex: te.orderIndex,
            sets: sets,
            comment: "",
          };
        }),
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

  const addExerciseToWorkout = async (exercise) => {
    let initialSets = [];

    try {
      const response = await workoutApi.getLastPerformance(exercise.id, userId);

      if (response.data && response.data.sets) {
        initialSets = response.data.sets
          .sort((a, b) => a.setNumber - b.setNumber)
          .map((set, index) => ({
            setNumber: index + 1,
            // STRENGTH Felder:
            weight: set.weight,
            reps: set.reps,
            // CARDIO Felder:
            durationSeconds: set.durationSeconds,
            distanceKm: set.distanceKm,
            completed: false,
          }));

        // Auch für Kommentar-Anzeige speichern
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
          exerciseType: exercise.exerciseType,
          weightPerSide: exercise.weightPerSide || false,
          equipmentType: exercise.equipmentType,
          orderIndex: localWorkout.exercises.length,
          sets: initialSets,
          comment: "",
        },
      ],
    });
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

    const newSet = {
      setNumber: exercise.sets.length + 1,
      completed: false,
    };

    // STRENGTH vs CARDIO
    if (exercise.exerciseType === "CARDIO") {
      newSet.durationSeconds = null;
      newSet.distanceKm = null;
      newSet.weight = null;
      newSet.reps = null;
    } else {
      newSet.weight = "";
      newSet.reps = "";
      newSet.durationSeconds = null;
      newSet.distanceKm = null;
    }

    exercise.sets.push(newSet);

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

    // Wenn Satz gecheckt wird und Gewicht leer → 0 setzen
    if (
      set.completed &&
      (set.weight === "" || set.weight === null || set.weight === undefined)
    ) {
      set.weight = 0;
    }

    setLocalWorkout({
      ...localWorkout,
      exercises: updatedExercises,
    });

    // Timer starten wenn Satz gecheckt wird
    if (set.completed) {
      const restTime = userPreferences?.defaultRestTime || 60;
      startTimer(restTime);
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

      finishTraining();
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
        exercises: localWorkout.exercises.map((ex, index) => {
          const exerciseData = {
            exerciseId: ex.exerciseId,
            orderIndex: index,
            setsCount: ex.sets.length,
          };

          // STRENGTH: targetWeight & targetReps
          if (ex.exerciseType !== "CARDIO" && ex.sets.length > 0) {
            exerciseData.targetWeight = ex.sets[0].weight;
            exerciseData.targetReps = ex.sets[0].reps;
          }

          // CARDIO: targetDuration & targetDistance
          if (ex.exerciseType === "CARDIO" && ex.sets.length > 0) {
            exerciseData.targetDurationSeconds = ex.sets[0].durationSeconds;
            exerciseData.targetDistanceKm = ex.sets[0].distanceKm;
          }

          return exerciseData;
        }),
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
      <PageHeader title="Training" showBack backTo="/" />

      {loading && !localWorkout && (
        <div className="flex items-center justify-center p-8">
          <p className="text-gray-600 dark:text-gray-400">Lädt...</p>
        </div>
      )}

      {timerActive && timerEndTime && (
        <div className="fixed top-16 left-0 right-0 bg-blue-500 text-white p-3 shadow-lg z-40">
          <RestTimerContent
            endTime={timerEndTime}
            onAdjust={adjustTimer}
            onSkip={stopTimer}
          />
        </div>
      )}

      <div className="p-4">
        {/* Kein aktives Training */}
        {!localWorkout && (
          <div className="space-y-4">
            {/* Vorlagen */}
            {templates.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-3">
                  Trainingsvorlagen
                </h2>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => loadTemplateAndStart(template.id)}
                      className="w-full text-left border-2 border-blue-500 rounded-lg px-4 py-3 hover:bg-blue-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {template.exercises?.length || 0} Übungen
                          </p>
                        </div>
                        <span className="text-2xl">▶️</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Freies Training Button */}
            <button
              onClick={startWorkout}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-4 rounded-lg text-lg shadow"
            >
              ➕ Freies Training starten
            </button>

            {/* Info-Text */}
            <p className="text-center text-sm text-gray-500">
              Starte ein freies Training oder wähle eine Vorlage
            </p>
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
                  (ex) => ex.exerciseId,
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
                        0,
                      ) / totalCompleted
                    ).toFixed(1)
                  : 0;
              const avgReps =
                totalCompleted > 0
                  ? Math.round(
                      completedSets.reduce(
                        (sum, set) => sum + parseInt(set.reps || 0),
                        0,
                      ) / totalCompleted,
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
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {totalCompleted} Sätze · ⌀{" "}
                            {ex.exerciseType === "CARDIO" ? (
                              // Cardio: Zeit (Summe), Distanz (Summe) & Pace (Durchschnitt)
                              <>
                                {(() => {
                                  const totalDuration = completedSets.reduce(
                                    (sum, s) => sum + (s.durationSeconds || 0),
                                    0,
                                  );
                                  const totalDistance = completedSets.reduce(
                                    (sum, s) => sum + (s.distanceKm || 0),
                                    0,
                                  );
                                  const mins = Math.floor(totalDuration / 60);
                                  const secs = Math.round(totalDuration % 60);

                                  // Pace berechnen (Durchschnitt über alle Sets)
                                  let paceDisplay = "";
                                  if (totalDistance > 0 && totalDuration > 0) {
                                    const paceSeconds =
                                      totalDuration / totalDistance;
                                    const paceMins = Math.floor(
                                      paceSeconds / 60,
                                    );
                                    const paceSecs = Math.round(
                                      paceSeconds % 60,
                                    );
                                    paceDisplay = ` • 🏃 ${paceMins}:${paceSecs
                                      .toString()
                                      .padStart(2, "0")}/km`;
                                  }

                                  return (
                                    <>
                                      ⏱️ {mins}:
                                      {secs.toString().padStart(2, "0")}
                                      {totalDistance > 0 &&
                                        ` • 📏 ${totalDistance.toFixed(2)} km`}
                                      {paceDisplay}
                                    </>
                                  );
                                })()}
                              </>
                            ) : (
                              // Strength: Gewicht & Wiederholungen
                              <>
                                {avgWeight === 0
                                  ? "Körpergewicht"
                                  : `${displayWeight(
                                      avgWeight,
                                      userPreferences?.weightUnit || "kg",
                                    )} ${
                                      userPreferences?.weightUnit || "kg"
                                    }`}{" "}
                                × {avgReps} Wdh.
                              </>
                            )}
                          </p>
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
                      <div
                        className={`grid gap-2 mb-2 text-sm font-medium text-gray-600 dark:text-gray-400 ${
                          ex.exerciseType === "CARDIO"
                            ? "grid-cols-10"
                            : ex.equipmentType === "BODYWEIGHT"
                              ? "grid-cols-6"
                              : "grid-cols-12"
                        }`}
                      >
                        <div className="col-span-2 text-center">#</div>

                        {/* Bei Cardio: Zeit & Distanz statt Gewicht/Wdh */}
                        {ex.exerciseType === "CARDIO" ? (
                          <>
                            <div className="col-span-4 text-center">
                              Zeit (Min:Sek)
                            </div>
                            <div className="col-span-3 text-center">
                              Distanz (km)
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="col-span-3 text-center">Wdh.</div>

                            {/* kg/lbs nur wenn NICHT Bodyweight */}
                            {ex.equipmentType !== "BODYWEIGHT" && (
                              <>
                                <div className="col-span-3 text-center">
                                  <div>kg</div>
                                  {ex.weightPerSide && (
                                    <div className="text-[10px] font-normal text-gray-500 dark:text-gray-500">
                                      (pro Seite)
                                    </div>
                                  )}
                                </div>
                                <div className="col-span-3 text-center">
                                  <div>lbs</div>
                                  {ex.weightPerSide && (
                                    <div className="text-[10px] font-normal text-gray-500 dark:text-gray-500">
                                      (pro Seite)
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </>
                        )}

                        <div className="col-span-1 text-center">✓</div>
                      </div>

                      {/* Sätze */}
                      {ex.sets.length > 0 ? (
                        <div className="space-y-2 mb-3">
                          {ex.sets.map((set, setIndex) => (
                            <div
                              key={setIndex}
                              className={`grid gap-2 items-center ${
                                ex.exerciseType === "CARDIO"
                                  ? "grid-cols-10"
                                  : ex.equipmentType === "BODYWEIGHT"
                                    ? "grid-cols-6"
                                    : "grid-cols-12"
                              }`}
                            >
                              {/* Satznummer */}
                              <div className="col-span-2 text-center font-medium text-gray-700 dark:text-gray-300">
                                {set.setNumber}
                              </div>

                              {/* CARDIO: Zeit & Distanz */}
                              {ex.exerciseType === "CARDIO" ? (
                                <>
                                  {/* Zeit Input */}
                                  <div className="col-span-4">
                                    <div className="col-span-4 flex gap-1">
                                      {/* Minuten */}
                                      <input
                                        type="number"
                                        value={
                                          set.durationSeconds
                                            ? Math.floor(
                                                set.durationSeconds / 60,
                                              )
                                            : ""
                                        }
                                        onChange={(e) => {
                                          const mins =
                                            parseInt(e.target.value) || 0;
                                          const secs = set.durationSeconds
                                            ? set.durationSeconds % 60
                                            : 0;
                                          updateSet(
                                            exerciseIndex,
                                            setIndex,
                                            "durationSeconds",
                                            mins * 60 + secs,
                                          );
                                        }}
                                        onFocus={(e) => e.target.select()}
                                        placeholder="Min"
                                        min="0"
                                        disabled={set.completed}
                                        className={`w-1/2 border rounded px-2 py-2 text-center text-sm ${
                                          set.completed
                                            ? "bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                                            : ""
                                        }`}
                                      />
                                      {/* Sekunden */}
                                      <input
                                        type="number"
                                        value={
                                          set.durationSeconds
                                            ? set.durationSeconds % 60
                                            : ""
                                        }
                                        onChange={(e) => {
                                          const mins = set.durationSeconds
                                            ? Math.floor(
                                                set.durationSeconds / 60,
                                              )
                                            : 0;
                                          const secs =
                                            parseInt(e.target.value) || 0;
                                          updateSet(
                                            exerciseIndex,
                                            setIndex,
                                            "durationSeconds",
                                            mins * 60 + secs,
                                          );
                                        }}
                                        onFocus={(e) => e.target.select()}
                                        placeholder="Sek"
                                        min="0"
                                        max="59"
                                        disabled={set.completed}
                                        className={`w-1/2 border rounded px-2 py-2 text-center text-sm ${
                                          set.completed
                                            ? "bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                                            : ""
                                        }`}
                                      />
                                    </div>
                                  </div>

                                  {/* Distanz Input */}
                                  <div className="col-span-3">
                                    <input
                                      type="text"
                                      inputMode="decimal"
                                      value={set.distanceKm || ""}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (
                                          value === "" ||
                                          /^[0-9.,]*$/.test(value)
                                        ) {
                                          const normalized = value.replace(
                                            ",",
                                            ".",
                                          );
                                          updateSet(
                                            exerciseIndex,
                                            setIndex,
                                            "distanceKm",
                                            normalized,
                                          );
                                        }
                                      }}
                                      onBlur={(e) => {
                                        const value = e.target.value.replace(
                                          ",",
                                          ".",
                                        );
                                        if (value === "") {
                                          updateSet(
                                            exerciseIndex,
                                            setIndex,
                                            "distanceKm",
                                            "",
                                          );
                                        } else {
                                          const numValue = parseFloat(value);
                                          if (!isNaN(numValue)) {
                                            updateSet(
                                              exerciseIndex,
                                              setIndex,
                                              "distanceKm",
                                              parseFloat(numValue.toFixed(2)),
                                            );
                                          }
                                        }
                                      }}
                                      onFocus={(e) => e.target.select()}
                                      placeholder="0.00"
                                      disabled={set.completed}
                                      className={`w-full border rounded px-2 py-2 text-center text-sm ${
                                        set.completed
                                          ? "bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                                          : ""
                                      }`}
                                    />
                                  </div>
                                </>
                              ) : (
                                /* STRENGTH: Wiederholungen & Gewicht */
                                <>
                                  {/* Wiederholungen */}
                                  <div className="col-span-3">
                                    <input
                                      type="number"
                                      value={set.reps}
                                      onChange={(e) =>
                                        updateSet(
                                          exerciseIndex,
                                          setIndex,
                                          "reps",
                                          e.target.value,
                                        )
                                      }
                                      onFocus={(e) => e.target.select()}
                                      disabled={set.completed}
                                      className={`w-full border rounded px-2 py-2 text-center ${
                                        set.completed
                                          ? "bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                                          : ""
                                      }`}
                                    />
                                  </div>

                                  {/* Gewicht - nur wenn NICHT Bodyweight */}
                                  {ex.equipmentType !== "BODYWEIGHT" && (
                                    <>
                                      {/* Gewicht KG */}
                                      <div className="col-span-3">
                                        <input
                                          type="text"
                                          inputMode="decimal"
                                          value={
                                            set.weight === null ||
                                            set.weight === undefined ||
                                            set.weight === ""
                                              ? ""
                                              : set.weight === 0
                                                ? "0"
                                                : set.weight
                                          }
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            if (
                                              value === "" ||
                                              /^[0-9.,]*$/.test(value)
                                            ) {
                                              const normalized = value.replace(
                                                ",",
                                                ".",
                                              );
                                              updateSet(
                                                exerciseIndex,
                                                setIndex,
                                                "weight",
                                                normalized,
                                              );
                                            }
                                          }}
                                          onBlur={(e) => {
                                            const value =
                                              e.target.value.replace(",", ".");
                                            if (value === "") {
                                              updateSet(
                                                exerciseIndex,
                                                setIndex,
                                                "weight",
                                                0,
                                              );
                                            } else {
                                              const numValue =
                                                parseFloat(value);
                                              if (!isNaN(numValue)) {
                                                updateSet(
                                                  exerciseIndex,
                                                  setIndex,
                                                  "weight",
                                                  parseFloat(
                                                    numValue.toFixed(2),
                                                  ),
                                                );
                                              }
                                            }
                                          }}
                                          onFocus={(e) => e.target.select()}
                                          disabled={set.completed}
                                          className={`w-full border rounded px-2 py-2 text-center text-sm ${
                                            set.completed
                                              ? "bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                                              : ""
                                          }`}
                                        />
                                      </div>

                                      {/* Gewicht LBS */}
                                      <div className="col-span-3">
                                        <input
                                          type="text"
                                          inputMode="decimal"
                                          value={
                                            set.weight === null ||
                                            set.weight === undefined ||
                                            set.weight === ""
                                              ? ""
                                              : set.weight === 0
                                                ? "0"
                                                : Math.round(
                                                    set.weight * 2.20462 * 10,
                                                  ) / 10
                                          }
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            if (
                                              value === "" ||
                                              /^[0-9.,]*$/.test(value)
                                            ) {
                                              const normalized = value.replace(
                                                ",",
                                                ".",
                                              );
                                              const lbsValue =
                                                parseFloat(normalized);
                                              if (!isNaN(lbsValue)) {
                                                const kgValue =
                                                  lbsValue * 0.453592;
                                                updateSet(
                                                  exerciseIndex,
                                                  setIndex,
                                                  "weight",
                                                  parseFloat(
                                                    kgValue.toFixed(2),
                                                  ),
                                                );
                                              } else if (normalized === "") {
                                                updateSet(
                                                  exerciseIndex,
                                                  setIndex,
                                                  "weight",
                                                  "",
                                                );
                                              }
                                            }
                                          }}
                                          onBlur={(e) => {
                                            const value =
                                              e.target.value.replace(",", ".");
                                            if (value === "") {
                                              updateSet(
                                                exerciseIndex,
                                                setIndex,
                                                "weight",
                                                0,
                                              );
                                            } else {
                                              const lbsValue =
                                                parseFloat(value);
                                              if (!isNaN(lbsValue)) {
                                                const kgValue =
                                                  lbsValue * 0.453592;
                                                updateSet(
                                                  exerciseIndex,
                                                  setIndex,
                                                  "weight",
                                                  parseFloat(
                                                    kgValue.toFixed(2),
                                                  ),
                                                );
                                              }
                                            }
                                          }}
                                          onFocus={(e) => e.target.select()}
                                          disabled={set.completed}
                                          className={`w-full border rounded px-2 py-2 text-center text-sm ${
                                            set.completed
                                              ? "bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                                              : ""
                                          }`}
                                        />
                                      </div>
                                    </>
                                  )}
                                </>
                              )}

                              {/* Checkbox */}
                              <div className="col-span-1 flex justify-center">
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
                                e.target.value,
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

            {/* Training verwerfen */}
            <button
              onClick={() => {
                if (discardTraining()) {
                  navigate("/");
                }
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded"
            >
              🗑️ Training verwerfen
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

function RestTimerContent({ endTime, onAdjust, onSkip }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onSkip();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [endTime, onSkip]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-between max-w-md mx-auto">
      <button
        onClick={() => onAdjust(-10)}
        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded font-bold"
      >
        -10s
      </button>

      <div className="text-center">
        <div className="text-2xl font-bold">{formatTime(timeLeft)}</div>
        <div className="text-xs">Pausenzeit</div>
      </div>

      <button
        onClick={() => onAdjust(10)}
        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded font-bold"
      >
        +10s
      </button>

      <button
        onClick={onSkip}
        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
      >
        Skip
      </button>
    </div>
  );
}
