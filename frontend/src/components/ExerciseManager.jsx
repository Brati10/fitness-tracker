import { useState } from "react";
import { exerciseApi } from "../services/api";

function ExerciseManager({ exercises, onExerciseCreated }) {
  const [newExerciseName, setNewExerciseName] = useState("");

  const createExercise = async (e) => {
    e.preventDefault();
    try {
      await exerciseApi.create({ name: newExerciseName });
      setNewExerciseName("");
      onExerciseCreated(); // Callback zum Neuladen
    } catch (error) {
      console.error("Fehler beim Erstellen:", error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-3">Übungen verwalten</h2>

      <form onSubmit={createExercise} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newExerciseName}
            onChange={(e) => setNewExerciseName(e.target.value)}
            placeholder="Neue Übung..."
            required
            className="flex-1 border rounded px-3 py-2 text-base"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white w-12 h-12 rounded flex items-center justify-center text-2xl flex-shrink-0"
            title="Übung anlegen"
          >
            +
          </button>
        </div>
      </form>

      <div className="space-y-2">
        <h3 className="font-medium text-sm text-gray-600">
          Verfügbare Übungen:
        </h3>
        {exercises.length === 0 ? (
          <p className="text-gray-500 text-sm">Noch keine Übungen vorhanden.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {exercises.map((ex) => (
              <span
                key={ex.id}
                className="bg-gray-100 px-3 py-1 rounded text-sm"
              >
                {ex.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExerciseManager;
