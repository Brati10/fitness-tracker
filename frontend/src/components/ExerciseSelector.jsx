import { useState } from "react";

function ExerciseSelector({
  exercises,
  onExerciseSelected,
  onCancel,
  alreadyAddedExerciseIds = [],
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (exercise) => {
    // Prüfen ob schon im Training
    if (alreadyAddedExerciseIds.includes(exercise.id)) {
      alert(
        "Diese Übung ist bereits im Training. Füge einfach mehr Sätze hinzu!"
      );
      return;
    }

    onExerciseSelected(exercise);
    setSearchTerm(""); // Suche zurücksetzen
  };

  const handleCancel = () => {
    setSearchTerm("");
    onCancel();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-3">Übung auswählen:</h3>

      {/* Suchfeld */}
      <input
        type="text"
        placeholder="Übung suchen..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-3"
        autoFocus
      />

      {/* Übungsliste */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredExercises.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Keine Übungen gefunden
          </p>
        ) : (
          filteredExercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => handleSelect(ex)}
              className="w-full text-left border rounded px-3 py-2 hover:bg-gray-50"
            >
              {ex.name}
            </button>
          ))
        )}
      </div>

      <button
        onClick={handleCancel}
        className="w-full mt-3 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded"
      >
        Abbrechen
      </button>
    </div>
  );
}

export default ExerciseSelector;
