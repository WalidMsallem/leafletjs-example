import { FC } from "react";
import { useQuery } from "react-query";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { CircularProgress, Typography, Box, Chip } from "@mui/material";
import { Place } from "../types/Place";

// Set default Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Hook to dynamically set the map view
const DynamicMapView: FC<{ center: [number, number]; zoom: number }> = ({
  center,
  zoom,
}) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

// Custom hook to fetch food places near a location
const useFetchFoodPlaces = (latitude: number, longitude: number) => {
  return useQuery<Place[]>(["foodPlaces", latitude, longitude], async () => {
    const query = `
      [out:json];
      node["amenity"="restaurant"](around:1000, ${latitude}, ${longitude});
      out;
    `;
    const response = await axios.post(
      "https://overpass-api.de/api/interpreter",
      query,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.elements; // Overpass API returns results in "elements"
  });
};

// Main Map Component
const RestaurantMap: FC<{
  companyName: string;
  companyPosition: [number, number];
}> = ({ companyName, companyPosition }) => {
  const {
    data: foodPlaces,
    isLoading,
    error,
  } = useFetchFoodPlaces(companyPosition[0], companyPosition[1]);

  if (isLoading)
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box
        sx={{
          padding: "1rem",
          color: "red",
          textAlign: "center",
        }}
      >
        Error loading data
      </Box>
    );

  return (
    <MapContainer
      center={companyPosition}
      zoom={15}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <DynamicMapView center={companyPosition} zoom={15} />

      {/* Marker for the company's location */}
      <Marker position={companyPosition}>
        <Popup>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {companyName}
          </Typography>
          <Typography variant="body2">Headquarters</Typography>
        </Popup>
      </Marker>

      {/* Markers for nearby restaurants */}
      {foodPlaces?.map((place: Place) => (
        <Marker key={place.id} position={[place.lat, place.lon]}>
          <Popup>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {place.tags.name || "Unnamed Restaurant"}
              </Typography>
              {place.tags.cuisine && (
                <Chip
                  label={`Cuisine: ${place.tags.cuisine}`}
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default RestaurantMap;
