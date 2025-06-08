import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/CropSelector.css";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";
import { FaTemperatureHigh, FaTemperatureLow, FaCloudRain } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, useMap, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for Leaflet marker icons
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

const MapInitializer = ({ center, isSelecting }) => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
      if (center) {
        map.setView(center, 13);
      }
    }, 100);
  }, [map, center]);

  // Add cursor style based on selection mode
  useEffect(() => {
    const mapContainer = map.getContainer();
    if (isSelecting) {
      mapContainer.style.cursor = 'crosshair';
    } else {
      mapContainer.style.cursor = 'grab';
    }
  }, [map, isSelecting]);

  return null;
};

const MapEvents = ({ isSelecting, onLocationSelect }) => {
  const map = useMapEvents({
    click: (e) => {
      if (isSelecting) {
        onLocationSelect(e.latlng);
      }
    },
  });
  return null;
};

const WeatherForecasting = () => {
  const [coordinates, setCoordinates] = useState([28.6139, 77.209]);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.209]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [weatherSummary, setWeatherSummary] = useState(null);
  const [dailyWeather, setDailyWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const fetchMonthlyWeatherData = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const endDate = new Date().toISOString().split("T")[0];
      
      // Set date range for display
      setDateRange({
        start: formattedStartDate,
        end: endDate
      });

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
    if (temp === null) return "#6b7280";
    if (temp > 30) return "#dc2626";
    if (temp < 15) return "#2563eb";
    return "#facc15";
  };

  // Color logic for rainfall badge
  const rainBadgeColor = (rain) => {
    if (rain === null) return "#6b7280";
    if (rain > 100) return "#16a34a";
    if (rain > 20) return "#22c55e";
    return "#fbbf24";
  };

  // Handle location selection
  const handleLocationSelect = (latlng) => {
    const newCoords = [latlng.lat, latlng.lng];
    setCoordinates(newCoords);
    setMapCenter(newCoords);
    setSelectedLocation("Selected location");
    setIsSelecting(false);
  };

  // Add function to handle getting user's location
  const handleGetLocation = () => {
    setLocationLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = [position.coords.latitude, position.coords.longitude];
          setCoordinates(newCoords);
          setMapCenter(newCoords);
          setSelectedLocation("Your current location");
          setLocationLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Unable to access your location. Please try again or select manually on the map.");
          setLocationLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLocationLoading(false);
    }
  };

  return (
    <div className="weather-data max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-blue-800">
        Weather Data & Forecast
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Map */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Select Location
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            Click anywhere on the map to select a location for weather forecast
          </p>
          <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200 relative">
            <div className="absolute top-2 right-2 z-[1000] bg-white p-2 rounded-lg shadow-md">
              <button
                onClick={() => setIsSelecting(!isSelecting)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  isSelecting 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isSelecting ? 'Click to Select Location' : 'Enable Location Selection'}
              </button>
            </div>
            <MapContainer
              center={mapCenter}
              zoom={13}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker 
                position={coordinates}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    setCoordinates([position.lat, position.lng]);
                    setMapCenter([position.lat, position.lng]);
                    setSelectedLocation("Selected location");
                  }
                }}
              >
                <Popup>
                  {selectedLocation || "Selected location"}
                  <br />
                  Lat: {coordinates[0].toFixed(4)}, Lng: {coordinates[1].toFixed(4)}
                </Popup>
              </Marker>
              <MapInitializer center={mapCenter} isSelecting={isSelecting} />
              <MapEvents isSelecting={isSelecting} onLocationSelect={handleLocationSelect} />
            </MapContainer>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600 font-medium">
              Latitude: {coordinates[0].toFixed(4)}, Longitude: {coordinates[1].toFixed(4)}
            </p>
            {selectedLocation && (
              <p className="text-sm text-blue-600 font-medium">
                {selectedLocation}
              </p>
            )}
            {isSelecting && (
              <p className="text-sm text-blue-600 font-medium">
                Click anywhere on the map to select a location
              </p>
            )}
          </div>
        </div>

        {/* Right Side - Weather Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            Weather Summary
          </h3>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          ) : weatherSummary ? (
            <div className="space-y-6">
              {/* Location and Date Range Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Location Information</h4>
                <p className="text-sm text-gray-600">
                  {selectedLocation || "Selected location"} at coordinates:
                  <br />
                  Latitude: {coordinates[0].toFixed(4)}, Longitude: {coordinates[1].toFixed(4)}
                </p>
                {dateRange.start && dateRange.end && (
                  <p className="text-sm text-gray-600 mt-2">
                    Data period: {dateRange.start} to {dateRange.end}
                  </p>
                )}
              </div>

              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{
                  backgroundColor: tempBadgeColor(weatherSummary.averageTemperature),
                }}
              >
                <div className="flex items-center space-x-3">
                  <FaTemperatureHigh className="text-2xl text-white" />
                  <div>
                    <p className="text-white font-medium">Average Temperature</p>
                    <p className="text-white text-2xl font-bold">
                      {weatherSummary.averageTemperature !== null
                        ? `${weatherSummary.averageTemperature.toFixed(1)}°C`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="flex items-center justify-between p-4 rounded-lg"
                style={{
                  backgroundColor: rainBadgeColor(weatherSummary.averageRainfall),
                }}
              >
                <div className="flex items-center space-x-3">
                  <FaCloudRain className="text-2xl text-white" />
                  <div>
                    <p className="text-white font-medium">Average Rainfall</p>
                    <p className="text-white text-2xl font-bold">
                      {weatherSummary.averageRainfall !== null
                        ? `${weatherSummary.averageRainfall.toFixed(1)} mm`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Select a location to view weather data
            </div>
          )}

          {/* Add Location Button */}
          <div className="mt-6">
            <button
              onClick={handleGetLocation}
              disabled={locationLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2
                ${locationLoading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {locationLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span>Getting Location...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>Use My Location</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {dailyWeather && dailyWeather.dates && dailyWeather.dates.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-center mb-8 text-blue-800">
            Weather Trends (Last 30 Days)
          </h3>

          <div className="space-y-8">
            <div className="bg-gray-50 p-4 rounded-lg">
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

            <div className="bg-gray-50 p-4 rounded-lg">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherForecasting;
