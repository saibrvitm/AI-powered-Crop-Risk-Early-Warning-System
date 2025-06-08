import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
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

const PlotCropSelector = () => {
  const [plots, setPlots] = useState([]); // Store polygons (GeoJSON)
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [plotName, setPlotName] = useState("");
  const [nutrients, setNutrients] = useState({ N: "", P: "", K: "", pH: "" });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Function to submit plot data and nutrient information for prediction
  const submitPrediction = async () => {
    if (!plotName.trim()) return alert("Please enter a plot name.");
    if (!selectedPlot) return alert("Please draw a plot first.");
    if (
      !nutrients.N ||
      !nutrients.P ||
      !nutrients.K ||
      !nutrients.pH ||
      isNaN(Number(nutrients.N)) ||
      isNaN(Number(nutrients.P)) ||
      isNaN(Number(nutrients.K)) ||
      isNaN(Number(nutrients.pH))
    )
      return alert("Please enter valid numeric values for all nutrients.");

    setLoading(true);

    const requestData = {
      plot_name: plotName.trim(),
      plot_coordinates: selectedPlot.geometry.coordinates, // polygon coords
      nitrogen: Number(nutrients.N),
      phosphorus: Number(nutrients.P),
      potassium: Number(nutrients.K),
      ph: Number(nutrients.pH),
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/crop/predict", // your API endpoint
        requestData,
        { headers: { "Content-Type": "application/json" } }
      );

      setRecommendations(response.data.predicted_crops || []);
    } catch (err) {
      console.error("Error fetching crop recommendations:", err);
      alert("Error fetching crop recommendations. Please try again.");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-md shadow-md mt-6">
      <h2 className="text-2xl font-semibold mb-6 text-center text-green-700">
        Mark Your Plot and Get Crop Recommendations
      </h2>

      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        // Tailwind CSS class for height. Make sure `h-96` (height: 24rem)
        // is actually providing a height. If not, consider inline style:
        // style={{ height: '400px', width: '100%' }}
        className="h-96 w-full mb-6 rounded-md border border-gray-300"
      >
        {/* FeatureGroup to hold editable layers */}
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={onCreated}
            onDeleted={onDeleted}
            draw={{
              rectangle: true, // Allow drawing rectangles
              polygon: true, // Allow drawing polygons
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
            }}
          />
        </FeatureGroup>
        {/* TileLayer for the base map tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>

      {/* Form for plot details and nutrient inputs */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitPrediction();
        }}
        className="space-y-6"
      >
        <div>
          <label
            htmlFor="plotName"
            className="block mb-1 font-medium text-gray-700"
          >
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["N", "P", "K"].map((nutrient) => (
            <div key={nutrient}>
              <label
                htmlFor={nutrient}
                className="block mb-1 font-medium text-gray-700"
              >
                {nutrient === "N"
                  ? "Nitrogen (N)"
                  : nutrient === "P"
                  ? "Phosphorus (P)"
                  : "Potassium (K)"}
              </label>
              <input
                type="number"
                id={nutrient}
                name={nutrient}
                value={nutrients[nutrient]}
                onChange={handleInputChange}
                placeholder={`${nutrient} content (e.g., 50)`}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          ))}

          <div>
            <label
              htmlFor="pH"
              className="block mb-1 font-medium text-gray-700"
            >
              Soil pH
            </label>
            <input
              type="number"
              id="pH"
              name="pH"
              step="0.1" // Allow decimal values for pH
              value={nutrients.pH}
              onChange={handleInputChange}
              placeholder="pH value (e.g., 6.5)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
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

      {/* Display Recommended Crops */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          Recommended Crops:
        </h3>
        {recommendations.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {recommendations.map((crop, i) => (
              <li key={i}>{crop}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No recommendations yet.</p>
        )}
      </div>
    </div>
  );
};

export default PlotCropSelector;