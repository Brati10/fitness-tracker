import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { templateApi } from "../services/api";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";

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
          <EmptyState
            message="Noch keine Vorlagen vorhanden. Erstelle deine erste Vorlage für wiederkehrende Trainings!"
            icon="📝"
          />
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg dark:text-white">
                  {template.name}
                </h3>
                <div className="flex gap-2">
                  {/* Bearbeiten Button */}
                  <button
                    onClick={() => navigate(`/templates/${template.id}/edit`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    ✏️ Bearbeiten
                  </button>

                  {/* Löschen Button */}
                  <button
                    onClick={() => setDeleteConfirm(template)}
                    className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded flex items-center justify-center text-lg"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {template.exercises?.length || 0} Übungen
              </p>

              <button
                onClick={() => startFromTemplate(template.id)}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded font-semibold"
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
