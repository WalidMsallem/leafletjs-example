import React, { FC, useState } from 'react'
import { useQuery } from 'react-query'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import axios from 'axios'
import {
  CircularProgress,
  Box,
  Typography,
  Grid,
  TextField,
} from '@mui/material'
import { FixedSizeList, ListChildComponentProps } from 'react-window'

// Load custom icons
const icons = {
  headquarters: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/167/167707.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  }),
  default: new L.Icon({
    iconUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  restaurant: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/123/123292.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
}

// Assign colors for tags (e.g., cuisine types)
const tagColors: Record<string, string> = {
  italian: '#FF5733', // Example color for Italian cuisine
  pizza: '#33FF57',
  asian: '#3357FF',
  default: '#AAAAAA',
}

// Define a type for Place
export type Place = {
  id: number
  lat: number
  lon: number
  tags: {
    amenity?: string
    cuisine?: string
    name?: string
    website?: string
    phone?: string
    address?: string
    [key: string]: any
  }
}

// Custom hook for fetching places
const useFetchPlaces = (latitude: number, longitude: number) => {
  return useQuery<Place[]>(
    ['places', latitude, longitude],
    async () => {
      const query = `
        [out:json];
        node["amenity"="restaurant"](around:1000, ${latitude}, ${longitude});
        out;
      `
      const response = await axios.post(
        'https://overpass-api.de/api/interpreter',
        query,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      )
      return response.data.elements
    },
    { initialData: [] }
  )
}

// Map view adjustment hook
const DynamicMapView: FC<{ center: [number, number]; zoom: number }> = ({
  center,
  zoom,
}) => {
  const map = useMap()
  React.useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

// Main Map Component
const MapComponent: FC<{
  companyPosition: [number, number]
  companyName: string
}> = ({ companyPosition, companyName }) => {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    data: places,
    isLoading,
    error,
  } = useFetchPlaces(companyPosition[0], companyPosition[1])

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
    )
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', color: 'red', marginTop: '2rem' }}>
        Error fetching data.
      </Box>
    )
  }

  // Filter places based on search query
  const filteredPlaces = places?.filter(
    (place) =>
      place.tags?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.tags?.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTagColor = (cuisine: string | undefined): string => {
    return tagColors[cuisine?.toLowerCase() || 'default'] || tagColors.default
  }

  const renderRow = ({ index, style }: ListChildComponentProps) => {
    const place = filteredPlaces && filteredPlaces[index]
    if (!place) return null

    return (
      <Box
        style={style}
        key={place.id}
        sx={{
          cursor: 'pointer',
          backgroundColor:
            selectedPlace?.id === place.id ? '#f0f8ff' : 'transparent',
        }}
        onClick={() => setSelectedPlace(place)}
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
    )
  }

  return (
    <Grid container sx={{ height: '100vh' }}>
      {/* Sidebar */}
      <Grid
        item
        xs={4}
        sx={{ overflowY: 'hidden', padding: 2, background: '#f5f5f5' }}
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
      </Grid>

      {/* Map */}
      <Grid item xs={8}>
        <MapContainer style={{ height: '100%', width: '100%' }}>
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
            zoom={15}
          />

          {/* Headquarters Marker */}
          <Marker position={companyPosition} icon={icons.headquarters}>
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
              icon={icons.restaurant}
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
                {place.tags?.address && (
                    <Typography variant="body2">
                      Address: {place.tags.address}
                    </Typography>
                  )}
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Grid>
    </Grid>
  )
}

export default MapComponent
