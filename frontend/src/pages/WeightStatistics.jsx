import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { weightApi, preferencesApi } from "../services/api";
import { displayWeight } from "../utils/weightConversion";
import { formatShortDate } from "../utils/dateFormat";
import {
  MS_PER_DAY,
  DAYS_IN_MONTH,
  DAYS_IN_3_MONTHS,
  DAYS_IN_6_MONTHS,
} from "../utils/constants";
import PageHeader from "../components/PageHeader";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function WeightStatistics() {
  const { user } = useAuth();
  const userId = user?.id;
  const [measurements, setMeasurements] = useState([]);
  const [userPreferences, setUserPreferences] = useState(null);
  const [dateRange, setDateRange] = useState("last30");
  const [loading, setLoading] = useState(true);

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
      alert("Fehler beim Laden der Messungen!");
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
      alert("Fehler beim Laden der Einstellungen!");
    }
  };

  // Helper: Gefilterte Messungen basierend auf Datumsbereich
  const getFilteredMeasurements = () => {
    if (dateRange === "all") return measurements;

    const now = new Date();
    let daysToSubtract;

    switch (dateRange) {
      case "1month":
        daysToSubtract = DAYS_IN_MONTH;
        break;
      case "3months":
        daysToSubtract = DAYS_IN_3_MONTHS;
        break;
      case "6months":
        daysToSubtract = DAYS_IN_6_MONTHS;
        break;
      default:
        return measurements;
    }

    const startDate = new Date(now.getTime() - daysToSubtract * MS_PER_DAY);
    return measurements.filter((m) => new Date(m.date) >= startDate);
  };

  // Daten für Chart vorbereiten
  const prepareChartData = (field) => {
    const unit = userPreferences?.weightUnit || "kg";

    return getFilteredMeasurements()
      .filter((m) => m[field] != null)
      .map((m) => {
        let value = m[field];

        // Gewichts-Felder umrechnen
        if (
          (field === "weight" ||
            field === "muscleMass" ||
            field === "boneMass") &&
          unit === "lbs"
        ) {
          value = displayWeight(value, "lbs");
        }

        return {
          date: formatShortDate(m.date),
          value: value,
        };
      });
  };

  // Chart-Komponente
  const StatChart = ({ title, field, unit, color = "#3b82f6" }) => {
    const data = prepareChartData(field);

    if (data.length === 0) return null; // Keine Daten = Chart nicht anzeigen

    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-3">{title}</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              domain={["auto", "auto"]}
            />
            <Tooltip
              formatter={(value) => [`${value} ${unit}`, title]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Gewichts-Statistiken" showBack backTo="/weight" />

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <p className="text-gray-600 dark:text-gray-400">Lädt...</p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Filter */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Zeitraum:
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="last30">Letzte 30 Tage</option>
              <option value="1week">Letzte Woche</option>
              <option value="thismonth">Dieser Monat</option>
              <option value="lastmonth">Letzter Monat</option>
              <option value="3months">Letzte 3 Monate</option>
              <option value="6months">Letzte 6 Monate</option>
              <option value="1year">Letztes Jahr</option>
              <option value="all">Alle</option>
            </select>
          </div>

          {measurements.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Noch keine Messungen vorhanden.
            </p>
          ) : getFilteredMeasurements().length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Keine Messungen im gewählten Zeitraum.
            </p>
          ) : (
            <>
              <StatChart
                title="Gewicht"
                field="weight"
                unit={userPreferences?.weightUnit || "kg"}
                color="#3b82f6"
              />
              <StatChart title="BMI" field="bmi" unit="" color="#8b5cf6" />
              <StatChart
                title="Körperfett"
                field="bodyFat"
                unit="%"
                color="#ef4444"
              />
              <StatChart
                title="Muskelmasse"
                field="muscleMass"
                unit={userPreferences?.weightUnit || "kg"}
                color="#10b981"
              />
              <StatChart
                title="Knochenmasse"
                field="boneMass"
                unit={userPreferences?.weightUnit || "kg"}
                color="#f59e0b"
              />
              <StatChart
                title="Stoffwechselalter"
                field="metabolicAge"
                unit="Jahre"
                color="#ec4899"
              />
              <StatChart
                title="Wasseranteil"
                field="waterPercentage"
                unit="%"
                color="#06b6d4"
              />
              <StatChart
                title="Viszerales Fett"
                field="visceralFat"
                unit=""
                color="#f97316"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default WeightStatistics;
