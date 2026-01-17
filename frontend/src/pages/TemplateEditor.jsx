import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { templateApi, exerciseApi } from "../services/api";
import PageHeader from "../components/PageHeader";
import ExerciseSelector from "../components/ExerciseSelector";

function TemplateEditor() {
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const { templateId } = useParams();

  const [templateName, setTemplateName] = useState("");
  const [templateExercises, setTemplateExercises] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  useEffect(() => {
    loadTemplate();
    loadExercises();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      const response = await templateApi.getById(templateId);
      const template = response.data;
      setTemplateName(template.name);

      // Übungen mit Daten vorbereiten
      const exercises = template.exercises.map((te) => ({
        id: te.id,
        exerciseId: te.exercise.id,
        exerciseName: te.exercise.name,
        orderIndex: te.orderIndex,
        setsCount: te.setsCount || 3,
        targetWeight: te.targetWeight || "",
        targetReps: te.targetReps || "",
      }));

      setTemplateExercises(
        exercises.sort((a, b) => a.orderIndex - b.orderIndex)
      );
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    }
  };

  const loadExercises = async () => {
    try {
      const response = await exerciseApi.getAll();
      setAllExercises(response.data);
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    }
  };

  const addExercise = (exercise) => {
    const newExercise = {
      id: Date.now(), // Temp ID
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      orderIndex: templateExercises.length,
      setsCount: 3,
      targetWeight: "",
      targetReps: "",
    };

    setTemplateExercises([...templateExercises, newExercise]);
    setShowExerciseSelector(false);
  };

  const removeExercise = (index) => {
    const updated = templateExercises.filter((_, i) => i !== index);
    // orderIndex neu setzen
    updated.forEach((ex, idx) => (ex.orderIndex = idx));
    setTemplateExercises(updated);
  };

  const updateExercise = (index, field, value) => {
    const updated = [...templateExercises];
    updated[index][field] = value;
    setTemplateExercises(updated);
  };

  const moveExercise = (fromIndex, toIndex) => {
    const updated = [...templateExercises];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    // orderIndex aktualisieren
    updated.forEach((ex, idx) => (ex.orderIndex = idx));
    setTemplateExercises(updated);
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      alert("Bitte einen Namen eingeben!");
      return;
    }

    if (templateExercises.length === 0) {
      alert("Bitte mindestens eine Übung hinzufügen!");
      return;
    }

    try {
      const templateData = {
        userId: userId,
        name: templateName,
        exercises: templateExercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          orderIndex: ex.orderIndex,
          setsCount: parseInt(ex.setsCount) || 3,
          targetWeight: ex.targetWeight ? parseFloat(ex.targetWeight) : null,
          targetReps: ex.targetReps ? parseInt(ex.targetReps) : null,
        })),
      };

      await templateApi.update(templateId, templateData);
      navigate("/templates");
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Fehler beim Speichern!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Vorlage bearbeiten" showBack backTo="/templates" />

      <div className="p-4 space-y-4">
        {/* Name */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Name der Vorlage:
          </label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="z.B. Push-Tag A"
          />
        </div>

        {/* Übung hinzufügen Button */}
        {!showExerciseSelector && (
          <button
            onClick={() => setShowExerciseSelector(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            + Übung hinzufügen
          </button>
        )}

        {/* Exercise Selector */}
        {showExerciseSelector && (
          <ExerciseSelector
            exercises={allExercises}
            alreadyAddedExerciseIds={templateExercises.map((e) => e.exerciseId)}
            onExerciseSelected={addExercise}
            onCancel={() => setShowExerciseSelector(false)}
          />
        )}

        {/* Übungen Liste */}
        {templateExercises.map((ex, index) => (
          <div
            key={ex.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg dark:text-white">
                {ex.exerciseName}
              </h3>

              <div className="flex gap-2">
                {/* Verschieben */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => index > 0 && moveExercise(index, index - 1)}
                    disabled={index === 0}
                    className={`text-xl ${
                      index === 0 ? "text-gray-300" : "text-blue-500"
                    }`}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() =>
                      index < templateExercises.length - 1 &&
                      moveExercise(index, index + 1)
                    }
                    disabled={index === templateExercises.length - 1}
                    className={`text-xl ${
                      index === templateExercises.length - 1
                        ? "text-gray-300"
                        : "text-blue-500"
                    }`}
                  >
                    ▼
                  </button>
                </div>

                {/* Löschen */}
                <button
                  onClick={() => removeExercise(index)}
                  className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded flex items-center justify-center text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Satzanzahl & Zielwerte */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Sätze
                </label>
                <input
                  type="number"
                  value={ex.setsCount}
                  onChange={(e) =>
                    updateExercise(index, "setsCount", e.target.value)
                  }
                  className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Gewicht (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={ex.targetWeight}
                  onChange={(e) =>
                    updateExercise(index, "targetWeight", e.target.value)
                  }
                  className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Wdh.
                </label>
                <input
                  type="number"
                  value={ex.targetReps}
                  onChange={(e) =>
                    updateExercise(index, "targetReps", e.target.value)
                  }
                  className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Speichern */}
        <button
          onClick={saveTemplate}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded"
        >
          Änderungen speichern
        </button>
      </div>
    </div>
  );
}

export default TemplateEditor;
