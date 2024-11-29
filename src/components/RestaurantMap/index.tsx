import React, { FC, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { CircularProgress, Box, Typography, TextField } from '@mui/material';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { ICONS } from './constants';
import { getTagColor } from './utils';
import { useFetchPlaces } from '../../hooks/use-fetch-places';
import DynamicMapView from '../DynamicMapView';
import { Place } from '../../types/Place';

import 'leaflet/dist/leaflet.css';

const RestaurantMap: FC<{ companyPosition: [number, number]; companyName: string }> = ({
  companyPosition,
  companyName,
}) => {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapZoom, setMapZoom] = useState(15); // Track current zoom level

  const { data: places, isLoading, error } = useFetchPlaces(
    companyPosition[0],
    companyPosition[1]
  );

  // Store references to markers
  const markersRef = useRef<Map<number, L.Marker>>(new Map());

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', color: 'red', marginTop: '2rem' }}>
        Error fetching data.
      </Box>
    );
  }

  const filteredPlaces = places?.filter(
    (place) =>
      place.tags?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.tags?.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderRow = ({ index, style }: ListChildComponentProps) => {
    const place = filteredPlaces && filteredPlaces[index];
    if (!place) return null;

    return (
      <Box
        style={style}
        key={place.id}
        sx={{
          cursor: 'pointer',
          backgroundColor:
            selectedPlace?.id === place.id ? '#f0f8ff' : 'transparent',
          borderBottom: '1px solid #ddd',
        }}
        onClick={() => {
          setSelectedPlace(place);
          setMapZoom(18);

          // Open the popup for the corresponding marker
          const marker = markersRef.current.get(place.id);
          if (marker) {
            marker.openPopup();
          }
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: getTagColor(place.tags?.cuisine),
            fontWeight: 'bold',
          }}
        >
          {place.tags?.name || 'Unnamed Place'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Cuisine: {place.tags?.cuisine || 'Unknown'}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: '30%',
          overflowY: 'auto',
          padding: 2,
          background: '#f5f5f5',
          borderRight: '1px solid #ddd',
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          Places near {companyName}
        </Typography>
        <TextField
          label="Search"
          fullWidth
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
        />
        <FixedSizeList
          height={600}
          itemSize={80}
          itemCount={filteredPlaces?.length || 0}
          width="100%"
        >
          {renderRow}
        </FixedSizeList>
      </Box>

      {/* Map */}
      <Box sx={{ flex: 1 }}>
        <MapContainer
          style={{ height: '100%', width: '100%' }}
          center={companyPosition}
          zoom={15}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <DynamicMapView
            center={
              selectedPlace
                ? [selectedPlace.lat, selectedPlace.lon]
                : companyPosition
            }
            zoom={selectedPlace ? mapZoom : 15}
          />

          {/* Headquarters Marker */}
          <Marker position={companyPosition} icon={ICONS.headquarters}>
            <Popup>
              <Typography variant="h6">{companyName}</Typography>
              <Typography variant="body2">Company Headquarters</Typography>
            </Popup>
          </Marker>

          {/* Place Markers */}
          {places?.map((place) => (
            <Marker
              key={place.id}
              position={[place.lat, place.lon]}
              icon={ICONS.restaurant}
              ref={(marker) => {
                if (marker) markersRef.current.set(place.id, marker); // Save marker reference
              }}
            >
              <Popup>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: getTagColor(place.tags?.cuisine),
                    }}
                  >
                    {place.tags?.name || 'Unnamed Place'}
                  </Typography>
                  <Typography variant="body2">
                    Cuisine: {place.tags?.cuisine || 'Unknown'}
                  </Typography>
                  {place.tags?.website && (
                    <a
                      href={place.tags.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Website
                    </a>
                  )}
                  {place.tags?.phone && (
                    <Typography variant="body2">
                      Phone: {place.tags.phone}
                    </Typography>
                  )}
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Box>
  );
};

export default RestaurantMap;
