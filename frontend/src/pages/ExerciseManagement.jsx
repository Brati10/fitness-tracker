import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { exerciseApi } from "../services/api";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import {
  getEquipmentLabel,
  getMuscleGroupLabel,
} from "../utils/exerciseLabels";

function ExerciseManagement() {
  const { user } = useAuth();
  const userId = user?.id;
  const [exercises, setExercises] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    exerciseType: "STRENGTH",
    weightPerSide: false,
    equipmentType: "",
    primaryMuscleGroup: "",
  });

  // Zugriffsprüfung
  if (user?.role !== "TRUSTED_USER" && user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PageHeader title="Übungen verwalten" showBack backTo="/" />
        <div className="flex items-center justify-center p-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
            <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
              Keine Berechtigung!
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Nur Trusted Users und Admins können Übungen erstellen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const equipmentTypes = [
    { value: "", label: "-- Wählen --" },
    { value: "BARBELL", label: "Langhantel" },
    { value: "DUMBBELL", label: "Kurzhantel" },
    { value: "MACHINE", label: "Maschine" },
    { value: "CABLE", label: "Seilzug" },
    { value: "PLATE_LOADED", label: "Plate Loaded" },
    { value: "BODYWEIGHT", label: "Körpergewicht" },
    { value: "OTHER", label: "Sonstiges" },
  ];

  const muscleGroups = [
    { value: "", label: "-- Wählen --" },
    { value: "CHEST", label: "Brust" },
    { value: "BACK", label: "Rücken" },
    { value: "SHOULDERS", label: "Schultern" },
    { value: "BICEPS", label: "Bizeps" },
    { value: "TRICEPS", label: "Trizeps" },
    { value: "LEGS", label: "Beine" },
    { value: "ABS", label: "Bauch" },
    { value: "GLUTES", label: "Gesäß" },
    { value: "CALVES", label: "Waden" },
    { value: "FOREARMS", label: "Unterarme" },
  ];

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const response = await exerciseApi.getAll();
      setExercises(response.data);
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    }
  };

  const createExercise = async (e) => {
    e.preventDefault();

    const exerciseData = {
      userId: userId,
      name: formData.name,
      exerciseType: formData.exerciseType,
    };

    // Nur bei STRENGTH:
    if (formData.exerciseType === "STRENGTH") {
      exerciseData.weightPerSide = formData.weightPerSide;

      if (formData.equipmentType) {
        exerciseData.equipmentType = formData.equipmentType;
      }
      if (formData.primaryMuscleGroup) {
        exerciseData.primaryMuscleGroup = formData.primaryMuscleGroup;
      }
    }

    try {
      await exerciseApi.create(exerciseData);
      setFormData({
        name: "",
        exerciseType: "STRENGTH",
        weightPerSide: false,
        equipmentType: "",
        primaryMuscleGroup: "",
      });
      loadExercises();
    } catch (error) {
      console.error("Fehler beim Erstellen:", error);
      alert("Übung existiert bereits oder keine Berechtigung!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Übungen verwalten" showBack backTo="/" />

      <div className="p-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 dark:text-white">
            Neue Übung erstellen
          </h2>

          <form onSubmit={createExercise} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Übungsname *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="z.B. Bankdrücken"
                required
                className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Exercise Type */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Typ *
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, exerciseType: "STRENGTH" })
                  }
                  className={`flex-1 py-2 px-4 rounded font-semibold transition ${
                    formData.exerciseType === "STRENGTH"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  💪 Kraft
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, exerciseType: "CARDIO" })
                  }
                  className={`flex-1 py-2 px-4 rounded font-semibold transition ${
                    formData.exerciseType === "CARDIO"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  🏃 Cardio
                </button>
              </div>
            </div>

            {/* Nur bei STRENGTH anzeigen */}
            {formData.exerciseType === "STRENGTH" && (
              <>
                {/* Equipment Type */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Equipment
                  </label>
                  <select
                    value={formData.equipmentType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        equipmentType: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {equipmentTypes.map((eq) => (
                      <option key={eq.value} value={eq.value}>
                        {eq.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Primary Muscle Group */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Hauptmuskelgruppe
                  </label>
                  <select
                    value={formData.primaryMuscleGroup}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primaryMuscleGroup: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {muscleGroups.map((mg) => (
                      <option key={mg.value} value={mg.value}>
                        {mg.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Weight Per Side */}
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.weightPerSide}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weightPerSide: e.target.checked,
                      })
                    }
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span>Gewicht pro Seite (z.B. Kurzhanteln)</span>
                </label>
              </>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold"
            >
              Übung erstellen
            </button>
          </form>

          {/* Übungsliste */}
          <div className="mt-6 space-y-2">
            <h3 className="font-medium text-sm text-gray-600 dark:text-gray-400">
              Alle Übungen ({exercises.length}):
            </h3>
            {exercises.length === 0 ? (
              <EmptyState message="Noch keine Übungen vorhanden." icon="🏋️" />
            ) : (
              <div className="space-y-2">
                {exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="bg-gray-100 dark:bg-gray-700 p-3 rounded"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">
                          {ex.name}
                        </h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {/* Exercise Type Badge */}
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              ex.exerciseType === "CARDIO"
                                ? "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
                                : "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                            }`}
                          >
                            {ex.exerciseType === "CARDIO"
                              ? "🏃 Cardio"
                              : "💪 Kraft"}
                          </span>

                          {ex.equipmentType && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                              {getEquipmentLabel(ex.equipmentType)}
                            </span>
                          )}
                          {ex.primaryMuscleGroup && (
                            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                              {getMuscleGroupLabel(ex.primaryMuscleGroup)}
                            </span>
                          )}
                          {ex.weightPerSide && (
                            <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                              pro Seite
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExerciseManagement;
