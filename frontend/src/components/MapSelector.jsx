import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom marker icon
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const DEFAULT_POSITION = [28.6139, 77.209]; // Delhi, fallback position

// Updates map view when position changes
const UpdateMapView = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(position, 13);
  }, [position]);

  return null;
};

// Handles map click and sets marker
const ClickHandler = ({ setPosition, setMarkerPosition, setCoordinates }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const newPos = [lat, lng];
      setPosition(newPos);
      setMarkerPosition(newPos);
      setCoordinates(newPos);
    },
  });

  return null;
};

const MapSelector = ({ setCoordinates }) => {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [markerPosition, setMarkerPosition] = useState(DEFAULT_POSITION);

  // Fetch geolocation on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const currentPos = [coords.latitude, coords.longitude];
          setPosition(currentPos);
          setMarkerPosition(currentPos);
          setCoordinates(currentPos);
        },
        (err) => {
          console.warn("Geolocation error:", err.message);
          alert("Unable to access your location. Using default location (Delhi).");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }, []);

  return (
    <div className="w-full h-80 rounded-md overflow-hidden border border-gray-300 shadow">
      <MapContainer center={position} zoom={13} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <UpdateMapView position={position} />
        <ClickHandler
          setPosition={setPosition}
          setMarkerPosition={setMarkerPosition}
          setCoordinates={setCoordinates}
        />
        <Marker position={markerPosition} icon={markerIcon} />
      </MapContainer>
    </div>
  );
};

export default MapSelector;
