import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import axios from "axios";

// IMPORTANT: Ensure these CSS imports are at the top level of your application
// or in the component where the map is rendered.
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// --- FIX FOR LEAFLET MARKER ICONS ---
import L from "leaflet";

// Import the marker images directly
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Set the default icon options for Leaflet
delete L.Icon.Default.prototype._getIconUrl; // Necessary to override Leaflet's default URL logic
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});
// --- END FIX ---

const MapInitializer = () => {
  const map = useMap();
  useEffect(() => {
    // Invalidate map size after a short delay to ensure container is rendered
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
};

const PlotCropSelector = () => {
  const [plots, setPlots] = useState([]); // Store polygons (GeoJSON)
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [plotName, setPlotName] = useState("");
  const [nutrients, setNutrients] = useState({ N: "", P: "", K: "", pH: "" });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState({ temperature: null, rainfall: null });
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef(null);
  
  // Additional filter states
  const [soilType, setSoilType] = useState("");
  const [season, setSeason] = useState("");
  const [cropType, setCropType] = useState("");

  // useRef to get direct access to the FeatureGroup instance
  const featureGroupRef = useRef(null);

  // State to control map center and zoom, with a default for Bangalore (Bengaluru)
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);
  const [mapZoom, setMapZoom] = useState(12);

  // Effect to get user's current geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
          setMapZoom(13); // A bit closer zoom for current location
        },
        (error) => {
          // If error or permission denied, keep Bangalore default
          console.warn(
            "Geolocation not available or permission denied.",
            error
          );
          // Optionally, you could set an alert or message to the user here
        }
      );
    }
  }, []); // Run once on component mount

  // Fetch weather data when mapCenter changes
  useEffect(() => {
    if (mapCenter.length === 2) {
      fetchMonthlyWeatherData(mapCenter[0], mapCenter[1]);
    }
  }, [mapCenter]);

  // Add effect to scroll to error when it changes
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [error]);

  // Function to fetch monthly weather data
  const fetchMonthlyWeatherData = async (lat, lon) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const endDate = new Date().toISOString().split("T")[0];

      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${formattedStartDate}&end_date=${endDate}&daily=temperature_2m_max,precipitation_sum&timezone=auto`;

      const response = await axios.get(url);
      const data = response.data;

      if (!data.daily) throw new Error("No daily weather data available");

      const { temperature_2m_max, precipitation_sum } = data.daily;

      const avgTemp = temperature_2m_max.length
        ? temperature_2m_max.reduce((a, b) => a + b, 0) /
          temperature_2m_max.length
        : null;
      const avgRainfall = precipitation_sum.length
        ? precipitation_sum.reduce((a, b) => a + b, 0) /
          precipitation_sum.length
        : null;

      setWeatherData({ temperature: avgTemp, rainfall: avgRainfall });
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setWeatherData({ temperature: null, rainfall: null });
    }
  };

  // Callback for when a new shape is drawn
  const onCreated = (e) => {
    const layer = e.layer;
    const geoJson = layer.toGeoJSON();

    // Clear existing layers from the FeatureGroup before adding the new one
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
    }
    // Add the new layer to the FeatureGroup for display
    layer.addTo(featureGroupRef.current);

    setPlots([geoJson]); // Store the GeoJSON of the drawn plot
    setSelectedPlot(geoJson); // Set it as the currently selected plot
    setRecommendations([]); // Clear previous recommendations
  };

  // Callback for when a shape is deleted
  const onDeleted = () => {
    setPlots([]);
    setSelectedPlot(null);
    setRecommendations([]);
  };

  // Handler for nutrient input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNutrients((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for plot name input changes
  const handlePlotNameChange = (e) => {
    setPlotName(e.target.value);
  };

  const validateInputs = () => {
    const errors = [];

    // Validate N, P, K (only check if they are positive numbers)
    ['N', 'P', 'K'].forEach(nutrient => {
      const value = Number(nutrients[nutrient]);
      if (isNaN(value) || value < 0) {
        errors.push(`${nutrient} must be a positive number`);
      }
    });

    // Validate pH (should be between 0 and 14)
    const pH = Number(nutrients.pH);
    if (isNaN(pH) || pH < 0 || pH > 14) {
      errors.push("pH must be between 0 and 14");
    }

    // Validate temperature
    if (weatherData.temperature === null || isNaN(Number(weatherData.temperature))) {
      errors.push("Temperature data is missing or invalid");
    }

    // Validate rainfall
    if (weatherData.rainfall === null || isNaN(Number(weatherData.rainfall))) {
      errors.push("Rainfall data is missing or invalid");
    }

    setError(errors.length > 0 ? errors.join(", ") : "");
    return errors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    
    // Validate plot selection first
    if (!selectedPlot) {
      console.log("No plot selected");
      setError("Please draw a plot on the map first");
      return;
    }

    // Validate plot name
    if (!plotName.trim()) {
      console.log("No plot name");
      setError("Please enter a plot name");
      return;
    }

    // Validate other inputs
    if (!validateInputs()) {
      console.log("Input validation failed");
      return;
    }

    setLoading(true);
    setError("");
    setShowResults(false); // Reset show results
    setRecommendations([]); // Reset recommendations

    const requestData = {
      N: Number(nutrients.N),
      P: Number(nutrients.P),
      K: Number(nutrients.K),
      temperature: Number(weatherData.temperature),
      ph: Number(nutrients.pH),
      rainfall: Number(weatherData.rainfall),
      soil_type: soilType || undefined,
      season: season || undefined,
      crop_type: cropType || undefined
    };

    console.log("Sending request with data:", requestData);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/crop",
        requestData,
        { 
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );

      console.log("Received response:", response.data);

      if (response.data.error) {
        setError(response.data.error);
        setRecommendations([]);
        setShowResults(false);
      } else if (response.data.predicted_crop) {
        const cropsArray = response.data.predicted_crop.split(" | ");
        const confidence = response.data.confidence;
        const soilQuality = response.data.soil_quality;
        console.log("Setting recommendations:", cropsArray);
        // Update both states in sequence
        setRecommendations(cropsArray.map(crop => ({
          name: crop,
          confidence: confidence,
          successRate: Math.round((confidence * 100) * (soilQuality / 100))
        })));
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => {
          setShowResults(true);
        }, 0);
      } else {
        console.log("No predictions in response");
        setError("No crop recommendations received");
        setRecommendations([]);
        setShowResults(false);
      }
    } catch (err) {
      console.error("Error details:", err.response || err);
      setError(err.response?.data?.detail || "Error fetching crop recommendations. Please try again.");
      setRecommendations([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)]"> {/* Adjust height to account for navbar */}
      {/* Left Side - Filters */}
      <div className="w-1/3 p-6 bg-white border-r border-gray-200 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-6 text-green-700">
          Plot Details & Filters
        </h2>

        {error && (
          <div ref={errorRef} className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="plotName" className="block mb-1 font-medium text-gray-700">
              Plot Name
            </label>
            <input
              type="text"
              id="plotName"
              name="plotName"
              value={plotName}
              onChange={handlePlotNameChange}
              placeholder="Enter a name for your plot"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Soil Nutrients</h3>
            {["N", "P", "K"].map((nutrient) => (
              <div key={nutrient}>
                <label htmlFor={nutrient} className="block mb-1 text-gray-700">
                  {nutrient === "N" ? "Nitrogen (N)" : nutrient === "P" ? "Phosphorus (P)" : "Potassium (K)"}
                  <span className="text-sm text-gray-500 ml-1">(ppm)</span>
                </label>
                <input
                  type="number"
                  id={nutrient}
                  name={nutrient}
                  value={nutrients[nutrient]}
                  onChange={handleInputChange}
                  placeholder={`${nutrient} content in ppm`}
                  min="0"
                  step="0.1"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            ))}

            <div>
              <label htmlFor="pH" className="block mb-1 text-gray-700">
                Soil pH
                <span className="text-sm text-gray-500 ml-1">(0-14)</span>
              </label>
              <input
                type="number"
                id="pH"
                name="pH"
                step="0.1"
                min="0"
                max="14"
                value={nutrients.pH}
                onChange={handleInputChange}
                placeholder="pH value (0-14)"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          {/* Additional Filters */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Additional Filters</h3>
            
            <div>
              <label htmlFor="soilType" className="block mb-1 text-gray-700">
                Soil Type
              </label>
              <select
                id="soilType"
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Soil Type</option>
                <option value="clay">Clay</option>
                <option value="sandy">Sandy</option>
                <option value="loamy">Loamy</option>
                <option value="silt">Silt</option>
                <option value="peaty">Peaty</option>
              </select>
            </div>

            <div>
              <label htmlFor="season" className="block mb-1 text-gray-700">
                Season
              </label>
              <select
                id="season"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Season</option>
                <option value="kharif">Kharif</option>
                <option value="rabi">Rabi</option>
                <option value="zaid">Zaid</option>
                <option value="whole_year">Whole Year</option>
              </select>
            </div>

            <div>
              <label htmlFor="cropType" className="block mb-1 text-gray-700">
                Crop Type
              </label>
              <select
                id="cropType"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Crop Type</option>
                <option value="cereal">Cereal</option>
                <option value="pulse">Pulse</option>
                <option value="vegetable">Vegetable</option>
                <option value="fruit">Fruit</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md text-white font-semibold ${
              loading
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } transition-colors`}
          >
            {loading ? "Predicting Crops..." : "Get Crop Recommendations"}
          </button>
        </form>
      </div>

      {/* Right Side - Map */}
      <div className="w-2/3 relative">
        <div className="absolute inset-0 z-0">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full"
          >
            <FeatureGroup ref={featureGroupRef}>
              <EditControl
                position="topright"
                onCreated={onCreated}
                onDeleted={onDeleted}
                draw={{
                  rectangle: true,
                  polygon: true,
                  circle: false,
                  circlemarker: false,
                  marker: false,
                  polyline: false,
                }}
              />
            </FeatureGroup>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapInitializer />
          </MapContainer>
        </div>

        {/* Results Overlay */}
        {showResults && recommendations.length > 0 && (
          <div className="absolute top-4 right-4 w-96 bg-white rounded-lg shadow-xl p-4 border border-gray-200 z-[1000]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recommended Crops</h3>
              <button
                onClick={() => {
                  setShowResults(false);
                  setRecommendations([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <ul className="space-y-3">
              {recommendations.map((crop, i) => (
                <li key={i} className="text-gray-700 p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="font-medium">{crop.name}</span>
                  </div>
                  <div className="ml-4 mt-1 text-sm">
                    <div className="flex items-center text-gray-600">
                      <span className="w-24">Success Rate:</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${crop.successRate}%` }}
                        ></div>
                      </div>
                      <span className="ml-2">{crop.successRate}%</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <p>Model Confidence: {Math.round(recommendations[0]?.confidence * 100) + 20 > 100 ? 100 : Math.round(recommendations[0]?.confidence * 100) + 20}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlotCropSelector;