import { useState, useEffect } from "react";
import { weightApi, preferencesApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { displayWeight, toDbWeight } from "../utils/weightConversion";

import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";

function WeightTracking() {
  const [measurements, setMeasurements] = useState([]);
  const [userPreferences, setUserPreferences] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16),
    weight: "",
    bodyFat: "",
    muscleMass: "",
    boneMass: "",
    metabolicAge: "",
    waterPercentage: "",
    visceralFat: "",
  });
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const userId = user?.id;

  // Messungen laden beim Start
  useEffect(() => {
    loadMeasurements();
    loadUserPreferences();
  }, []);

  const loadMeasurements = async () => {
    try {
      const response = await weightApi.getUserMeasurements(userId);
      setMeasurements(response.data);
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const unit = userPreferences?.weightUnit || "kg";

    const measurementData = {
      userId: userId,
      date: formData.date,
      weight: toDbWeight(formData.weight, unit),
      bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
      muscleMass: formData.muscleMass
        ? toDbWeight(formData.muscleMass, unit)
        : null,
      boneMass: formData.boneMass ? toDbWeight(formData.boneMass, unit) : null,
      metabolicAge: formData.metabolicAge
        ? parseInt(formData.metabolicAge)
        : null,
      waterPercentage: formData.waterPercentage
        ? parseFloat(formData.waterPercentage)
        : null,
      visceralFat: formData.visceralFat
        ? parseFloat(formData.visceralFat)
        : null,
    };

    try {
      await weightApi.create(measurementData);
      setFormData({
        date: new Date(
          new Date().getTime() - new Date().getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16),
        weight: "",
        bodyFat: "",
        muscleMass: "",
        boneMass: "",
        metabolicAge: "",
        waterPercentage: "",
        visceralFat: "",
      });
      loadMeasurements();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Gewichtstracking" showBack backTo="/" />

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <p className="text-gray-600 dark:text-gray-400">Lädt...</p>
        </div>
      ) : (
        <div className="p-4">
          {/* Formular */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Neue Messung
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Datum & Zeit *
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Gewicht ({userPreferences?.weightUnit || "kg"}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Körperfett (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="bodyFat"
                  value={formData.bodyFat}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Muskelmasse ({userPreferences?.weightUnit || "kg"})
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="muscleMass"
                  value={formData.muscleMass}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Knochenmasse ({userPreferences?.weightUnit || "kg"})
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="boneMass"
                  value={formData.boneMass}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Stoffwechselalter
                </label>
                <input
                  type="number"
                  name="metabolicAge"
                  value={formData.metabolicAge}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Körperwasser (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="waterPercentage"
                  value={formData.waterPercentage}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Viszeralfett (Stufe)
                </label>
                <input
                  type="number"
                  name="visceralFat"
                  value={formData.visceralFat}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              >
                Speichern
              </button>
            </form>
          </div>

          {/* Liste */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Verlauf
            </h2>
            {measurements.length === 0 ? (
              <EmptyState message="Noch keine Messungen vorhanden." icon="⚖️" />
            ) : (
              <div className="space-y-2">
                {measurements.map((m) => (
                  <div
                    key={m.id}
                    className="bg-gray-50 dark:bg-gray-700 p-3 rounded"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(m.date).toLocaleDateString("de-DE")}
                    </p>
                    <p className="font-semibold dark:text-white">
                      {displayWeight(
                        m.weight,
                        userPreferences?.weightUnit || "kg"
                      )}{" "}
                      {userPreferences?.weightUnit || "kg"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default WeightTracking;
