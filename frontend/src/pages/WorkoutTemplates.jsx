import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { templateApi } from "../services/api";
import PageHeader from "../components/PageHeader";

function WorkoutTemplates() {
  const { user } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await templateApi.getUserTemplates(userId);
      setTemplates(response.data);
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    }
  };

  const handleDelete = async (templateId) => {
    try {
      await templateApi.delete(templateId);
      setDeleteConfirm(null);
      loadTemplates();
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
    }
  };

  const startFromTemplate = (templateId) => {
    navigate("/workout", { state: { templateId } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Trainingsvorlagen" showBack backTo="/" />

      <div className="p-4 space-y-3">
        {templates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Noch keine Vorlagen vorhanden.</p>
            <p className="text-sm text-gray-400">
              Erstelle ein Training und speichere es als Vorlage!
            </p>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{template.name}</h3>
                <button
                  onClick={() => setDeleteConfirm(template)}
                  className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded flex items-center justify-center text-lg"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {template.exercises?.length || 0} Übungen
              </p>

              <button
                onClick={() => startFromTemplate(template.id)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold"
              >
                Training mit dieser Vorlage starten
              </button>
            </div>
          ))
        )}
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Vorlage löschen?</h2>
            <p className="text-gray-600 mb-6">
              Möchtest du die Vorlage <strong>{deleteConfirm.name}</strong>{" "}
              wirklich löschen?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutTemplates;
