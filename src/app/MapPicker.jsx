"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useState } from "react";

export default function MapPicker({ onSelect }) {
  const [position, setPosition] = useState(null);

  const center = { lat: 60.1699, lng: 24.9384 };

  return (
    <LoadScript googleMapsApiKey="YOUR_API_KEY">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={13}
        onClick={(e) => {
          const loc = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          };
          setPosition(loc);
          onSelect(loc);
        }}
      >
        {position && <Marker position={position} />}
      </GoogleMap>
    </LoadScript>
  );
}
