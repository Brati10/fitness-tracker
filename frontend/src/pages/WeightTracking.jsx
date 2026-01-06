import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { weightApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

import PageHeader from "../components/PageHeader";

function WeightTracking() {
  const [measurements, setMeasurements] = useState([]);
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

  const { user } = useAuth();
  const userId = user?.id;

  // Messungen laden beim Start
  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    try {
      const response = await weightApi.getUserMeasurements(userId);
      setMeasurements(response.data);
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const measurementData = {
        user: { id: userId },
        date: formData.date,
        weight: parseFloat(formData.weight),
        bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
        muscleMass: formData.muscleMass
          ? parseFloat(formData.muscleMass)
          : null,
        boneMass: formData.boneMass ? parseFloat(formData.boneMass) : null,
        metabolicAge: formData.metabolicAge
          ? parseInt(formData.metabolicAge)
          : null,
        waterPercentage: formData.waterPercentage
          ? parseFloat(formData.waterPercentage)
          : null,
        visceralFat: formData.visceralFat
          ? parseInt(formData.visceralFat)
          : null,
      };

      await weightApi.create(measurementData);

      // Formular zurücksetzen
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

      // Liste neu laden
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto px-2">
        <PageHeader title="Gewichtstracking" showBack backTo="/" />

        {/* Link zu Statistiken */}
        <Link
          to="/weight/statistics"
          className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center font-semibold py-2 px-4 rounded mb-4"
        >
          📊 Statistiken anzeigen
        </Link>

        {/* Formular */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h2 className="text-xl font-semibold mb-4">Neue Messung</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
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
              <label className="block text-sm font-medium mb-1">
                Gewicht (kg) *
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
              <label className="block text-sm font-medium mb-1">
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
              <label className="block text-sm font-medium mb-1">
                Muskelmasse (kg)
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
              <label className="block text-sm font-medium mb-1">
                Knochenmasse (kg)
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
              <label className="block text-sm font-medium mb-1">
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
              <label className="block text-sm font-medium mb-1">
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
              <label className="block text-sm font-medium mb-1">
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
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Verlauf</h2>

          {measurements.length === 0 ? (
            <p className="text-gray-500">Noch keine Messungen vorhanden.</p>
          ) : (
            <div className="space-y-2">
              {measurements.map((m) => (
                <div key={m.id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{m.weight} kg</span>
                    <span className="text-sm text-gray-500">
                      {new Date(m.date).toLocaleDateString("de-DE")}
                    </span>
                  </div>
                  {m.bodyFat && (
                    <span className="text-sm text-gray-600">
                      Körperfett: {m.bodyFat}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WeightTracking;
