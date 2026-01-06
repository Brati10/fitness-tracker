import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { weightApi } from "../services/api";
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
  const [dateRange, setDateRange] = useState("last30");

  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    try {
      const response = await weightApi.getUserMeasurements(userId);
      // Sortieren: älteste zuerst (für Chart)
      const sorted = response.data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setMeasurements(sorted);
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    }
  };

  // Helper: Gefilterte Messungen basierend auf Datumsbereich
  const getFilteredMeasurements = () => {
    if (dateRange === "all") return measurements;

    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case "1week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "last30":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "thismonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "lastmonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return measurements.filter((m) => {
          const date = new Date(m.date);
          return date >= startDate && date <= endLastMonth;
        });
      case "3months":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "1year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return measurements;
    }

    return measurements.filter((m) => new Date(m.date) >= startDate);
  };

  // Daten für Chart vorbereiten
  const prepareChartData = (field) => {
    return getFilteredMeasurements()
      .filter((m) => m[field] != null)
      .map((m) => ({
        date: new Date(m.date).toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
        }),
        value: m[field],
      }));
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
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Gewichts-Statistiken" showBack backTo="/weight" />

      <div className="p-4 space-y-4">
        {/* Filter */}
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium mb-2">Zeitraum:</label>
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
              unit="kg"
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
              unit="kg"
              color="#10b981"
            />
            <StatChart
              title="Knochenmasse"
              field="boneMass"
              unit="kg"
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
    </div>
  );
}

export default WeightStatistics;
