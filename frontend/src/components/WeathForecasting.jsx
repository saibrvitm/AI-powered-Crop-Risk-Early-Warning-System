import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/CropSelector.css";
import MapSelector from "./MapSelector";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";
import { FaTemperatureHigh, FaTemperatureLow, FaCloudRain } from "react-icons/fa"; // Icons

const WeatherForecasting = () => {
  const [coordinates, setCoordinates] = useState([28.6139, 77.209]);
  const [weatherSummary, setWeatherSummary] = useState(null);
  const [dailyWeather, setDailyWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMonthlyWeatherData = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const endDate = new Date().toISOString().split("T")[0];

      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${formattedStartDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

      const response = await axios.get(url);
      const data = response.data;

      if (!data.daily) throw new Error("No daily weather data available");

      const { temperature_2m_max, temperature_2m_min, precipitation_sum, time } = data.daily;

      const avgTemp =
        temperature_2m_max.length
          ? temperature_2m_max.reduce((a, b) => a + b, 0) / temperature_2m_max.length
          : null;
      const avgRainfall =
        precipitation_sum.length
          ? precipitation_sum.reduce((a, b) => a + b, 0) / precipitation_sum.length
          : null;

      setWeatherSummary({ averageTemperature: avgTemp, averageRainfall: avgRainfall });

      setDailyWeather({
        dates: time,
        maxTemperatures: temperature_2m_max,
        minTemperatures: temperature_2m_min,
        rainfall: precipitation_sum,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load weather data. Please try again.");
      setWeatherSummary(null);
      setDailyWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (coordinates.length === 2) {
      fetchMonthlyWeatherData(coordinates[0], coordinates[1]);
    }
  }, [coordinates]);

  // Color logic for temperature badge
  const tempBadgeColor = (temp) => {
    if (temp === null) return "#6b7280"; // gray
    if (temp > 30) return "#dc2626"; // red - hot
    if (temp < 15) return "#2563eb"; // blue - cold
    return "#facc15"; // yellow - mild
  };

  // Color logic for rainfall badge
  const rainBadgeColor = (rain) => {
    if (rain === null) return "#6b7280"; // gray
    if (rain > 100) return "#16a34a"; // green - heavy rain
    if (rain > 20) return "#22c55e"; // light green
    return "#fbbf24"; // yellow - dry-ish
  };

  return (
    <div
      className="weather-data"
      style={{
        maxWidth: 900,
        margin: "2rem auto",
        padding: "1.5rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#1e293b",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "#1e40af" }}>
        Weather Data & Forecast
      </h2>

      {/* Location Selector Card */}
      <section
        className="form-group"
        style={{
          marginBottom: "2rem",
          padding: "1rem 1.5rem",
          background: "#f9fafb",
          borderRadius: 8,
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          border: "1px solid #e2e8f0",
        }}
      >
        <label htmlFor="location" style={{ fontWeight: 700, fontSize: 16 }}>
          Select Location on Map:
        </label>
        <p
          aria-live="polite"
          style={{ fontSize: "1.1rem", margin: "0.5rem 0", fontWeight: "600" }}
        >
          Latitude: {coordinates[0].toFixed(4)}, Longitude: {coordinates[1].toFixed(4)}
        </p>
        <MapSelector setCoordinates={setCoordinates} />
      </section>

      {/* Weather Summary Card */}
      <section
        aria-live="polite"
        style={{
          textAlign: "center",
          marginTop: "1rem",
          minHeight: "4rem",
          padding: "1rem 1.5rem",
          background: "#eff6ff",
          borderRadius: 8,
          boxShadow: "0 2px 6px rgba(30,64,175,0.15)",
          border: "1px solid #bfdbfe",
          fontSize: "1.2rem",
          fontWeight: 600,
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {loading ? (
          <p style={{ fontStyle: "italic", color: "#64748b" }}>Loading weather data...</p>
        ) : error ? (
          <p style={{ color: "#dc2626", fontWeight: "700" }}>{error}</p>
        ) : weatherSummary ? (
          <>
            <div
              style={{
                backgroundColor: tempBadgeColor(weatherSummary.averageTemperature),
                padding: "0.6rem 1rem",
                borderRadius: 20,
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                minWidth: 180,
                justifyContent: "center",
              }}
              title="Average Max Temperature over last 30 days"
            >
              <FaTemperatureHigh size={22} />
              <span>
                Avg Temp:{" "}
                {weatherSummary.averageTemperature !== null
                  ? `${weatherSummary.averageTemperature.toFixed(1)} °C`
                  : "N/A"}
              </span>
            </div>

            <div
              style={{
                backgroundColor: rainBadgeColor(weatherSummary.averageRainfall),
                padding: "0.6rem 1rem",
                borderRadius: 20,
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                minWidth: 180,
                justifyContent: "center",
              }}
              title="Average Rainfall over last 30 days"
            >
              <FaCloudRain size={22} />
              <span>
                Avg Rainfall:{" "}
                {weatherSummary.averageRainfall !== null
                  ? `${weatherSummary.averageRainfall.toFixed(1)} mm`
                  : "N/A"}
              </span>
            </div>
          </>
        ) : (
          <p>No weather data available for this location.</p>
        )}
      </section>

      {/* Charts */}
      {dailyWeather && dailyWeather.dates && dailyWeather.dates.length > 0 && (
        <section
          className="weather-trends"
          style={{
            marginTop: "3rem",
            padding: "1.5rem",
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            border: "1px solid #e0e7ff",
          }}
        >
          <h3
            style={{
              textAlign: "center",
              marginBottom: "1.5rem",
              color: "#1e40af",
              fontWeight: 700,
            }}
          >
            Weather Trends (Last 30 Days)
          </h3>

          <div style={{ marginBottom: "2.5rem", padding: "0 1rem" }}>
            <Line
              data={{
                labels: dailyWeather.dates,
                datasets: [
                  {
                    label: "Max Temperature (°C)",
                    data: dailyWeather.maxTemperatures,
                    borderColor: "rgba(220,53,69,0.85)",
                    backgroundColor: "rgba(220,53,69,0.35)",
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                  },
                  {
                    label: "Min Temperature (°C)",
                    data: dailyWeather.minTemperatures,
                    borderColor: "rgba(13,110,253,0.85)",
                    backgroundColor: "rgba(13,110,253,0.35)",
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                  },
                ],
              }}
              options={{
                responsive: true,
                interaction: {
                  mode: "nearest",
                  axis: "x",
                  intersect: false,
                },
                plugins: {
                  legend: { position: "top" },
                  tooltip: { enabled: true },
                },
                scales: {
                  x: {
                    display: true,
                    title: { display: true, text: "Date" },
                    ticks: { maxRotation: 45, minRotation: 30, maxTicksLimit: 15 },
                  },
                  y: {
                    display: true,
                    title: { display: true, text: "Temperature (°C)" },
                    suggestedMin: Math.min(...dailyWeather.minTemperatures) - 5,
                    suggestedMax: Math.max(...dailyWeather.maxTemperatures) + 5,
                  },
                },
              }}
            />
          </div>

          <div style={{ padding: "0 1rem" }}>
            <Bar
              data={{
                labels: dailyWeather.dates,
                datasets: [
                  {
                    label: "Rainfall (mm)",
                    data: dailyWeather.rainfall,
                    backgroundColor: "rgba(25,135,84,0.7)",
                    borderRadius: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                  tooltip: { enabled: true },
                },
                scales: {
                  x: {
                    display: true,
                    title: { display: true, text: "Date" },
                    ticks: { maxRotation: 45, minRotation: 30, maxTicksLimit: 15 },
                  },
                  y: {
                    display: true,
                    title: { display: true, text: "Rainfall (mm)" },
                    beginAtZero: true,
                    suggestedMax: Math.max(...dailyWeather.rainfall) + 20,
                  },
                },
              }}
            />
          </div>
        </section>
      )}
    </div>
  );
};

export default WeatherForecasting;
