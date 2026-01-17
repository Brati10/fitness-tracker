import { useState } from "react";
import {
  getEquipmentLabel,
  getMuscleGroupLabel,
} from "../utils/exerciseLabels";

function ExerciseSelector({
  exercises,
  alreadyAddedExerciseIds,
  onExerciseSelected,
  onCancel,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filteredExercises = exercises.filter((ex) => {
    // Bereits hinzugefügte ausblenden
    if (alreadyAddedExerciseIds.includes(ex.id)) return false;

    // Suchbegriff
    if (
      searchTerm &&
      !ex.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Type Filter
    if (typeFilter && ex.exerciseType !== typeFilter) {
      return false;
    }

    // Equipment Filter
    if (equipmentFilter && ex.equipmentType !== equipmentFilter) {
      return false;
    }

    // Muscle Filter
    if (muscleFilter && ex.primaryMuscleGroup !== muscleFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg dark:text-white">
          Übung hinzufügen
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl"
        >
          ✕
        </button>
      </div>

      {/* Suche */}
      <input
        type="text"
        placeholder="Übung suchen..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        autoFocus
      />

      {/* Filter */}
      <div className="grid grid-cols-3 gap-2">
        {/* Type Filter - NEU! */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
            Typ
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Alle</option>
            <option value="STRENGTH">💪 Kraft</option>
            <option value="CARDIO">🏃 Cardio</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
            Equipment
          </label>
          <select
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Alle</option>
            <option value="BARBELL">Langhantel</option>
            <option value="DUMBBELL">Kurzhantel</option>
            <option value="MACHINE">Maschine</option>
            <option value="CABLE">Seilzug</option>
            <option value="PLATE_LOADED">Plate Loaded</option>
            <option value="BODYWEIGHT">Körpergewicht</option>
            <option value="OTHER">Sonstiges</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
            Muskelgruppe
          </label>
          <select
            value={muscleFilter}
            onChange={(e) => setMuscleFilter(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Alle</option>
            <option value="CHEST">Brust</option>
            <option value="BACK">Rücken</option>
            <option value="SHOULDERS">Schultern</option>
            <option value="BICEPS">Bizeps</option>
            <option value="TRICEPS">Trizeps</option>
            <option value="LEGS">Beine</option>
            <option value="ABS">Bauch</option>
            <option value="GLUTES">Gesäß</option>
            <option value="CALVES">Waden</option>
            <option value="FOREARMS">Unterarme</option>
          </select>
        </div>
      </div>

      {/* Übungsliste */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredExercises.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            Keine Übungen gefunden
          </p>
        ) : (
          filteredExercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => onExerciseSelected(ex)}
              className="w-full text-left border dark:border-gray-600 rounded p-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
            >
              <div className="font-medium text-gray-800 dark:text-gray-200">
                {ex.name}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {/* Type Badge */}
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    ex.exerciseType === "CARDIO"
                      ? "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
                      : "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                  }`}
                >
                  {ex.exerciseType === "CARDIO" ? "🏃 Cardio" : "💪 Kraft"}
                </span>

                {ex.equipmentType && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                    {getEquipmentLabel(ex.equipmentType)}
                  </span>
                )}
                {ex.primaryMuscleGroup && (
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                    {getMuscleGroupLabel(ex.primaryMuscleGroup)}
                  </span>
                )}
                {ex.weightPerSide && (
                  <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded">
                    pro Seite
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default ExerciseSelector;
