import { FC, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import {
  CircularProgress,
  Box,
  Typography,
  TextField,
  useMediaQuery,
} from '@mui/material'
import { FixedSizeList, ListChildComponentProps } from 'react-window'
import { ICONS } from './constants'
import { getTagColor } from './utils'
import { useFetchPlaces } from '../../hooks/use-fetch-places'
import DynamicMapView from '../DynamicMapView'
import { Place } from '../../types/Place'

import 'leaflet/dist/leaflet.css'

const RestaurantMap: FC<{
  companyPosition: [number, number]
  companyName: string
}> = ({ companyPosition, companyName }) => {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [mapZoom, setMapZoom] = useState(15)

  const isMobile = useMediaQuery('(max-width:600px)') // Detect mobile screens

  const {
    data: places,
    isLoading,
    error,
  } = useFetchPlaces(companyPosition[0], companyPosition[1], 'restaurant', 1000)

  // Store references to markers
  const markersRef = useRef<Map<number, L.Marker>>(new Map())

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

  const filteredPlaces = places?.filter(
    (place) =>
      place.tags?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.tags?.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          borderBottom: '1px solid #ddd',
        }}
        onClick={() => {
          setSelectedPlace(place)
          setMapZoom(18)

          const marker = markersRef.current.get(place.id)
          if (marker) {
            marker.openPopup()
          }
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: getTagColor(place.tags?.cuisine),
            fontWeight: 'bold',
            fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, // Responsive text size
          }}
        >
          {place.tags?.name || 'Unnamed Place'}
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }, // Responsive text size
          }}
        >
          Cuisine: {place.tags?.cuisine || 'Unknown'}
        </Typography>
      </Box>
    )
  }

  const renderSearchSection = (
    <>
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
    </>
  )

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      {/* Sidebar */}
      {!isMobile && (
        <Box
          sx={{
            width: '30%',
            overflowY: 'auto',
            padding: 2,
            background: '#f5f5f5',
            borderRight: '1px solid #ddd',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }, // Responsive text size
            }}
          >
            Places near {companyName}
          </Typography>
          {renderSearchSection}
        </Box>
      )}

      {/* Map */}
      <Box sx={{ flex: 1, position: 'relative' }}>
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
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, // Responsive text size
                }}
              >
                {companyName}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }, // Responsive text size
                }}
              >
                Company Headquarters
              </Typography>
            </Popup>
          </Marker>

          {/* Place Markers */}
          {places?.map((place) => (
            <Marker
              key={place.id}
              position={[place.lat, place.lon]}
              icon={ICONS.restaurant}
              ref={(marker) => {
                if (marker) markersRef.current.set(place.id, marker)
              }}
            >
              <Popup>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: getTagColor(place.tags?.cuisine),
                      fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }, // Responsive text size
                    }}
                  >
                    {place.tags?.name || 'Unnamed Place'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }, // Responsive text size
                    }}
                  >
                    Cuisine: {place.tags?.cuisine || 'Unknown'}
                  </Typography>
                  {place.tags?.website && (
                    <a
                      href={place.tags.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.875rem' }}
                    >
                      Visit Website
                    </a>
                  )}
                  {place.tags?.phone && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }, // Responsive text size
                      }}
                    >
                      Phone: {place.tags.phone}
                    </Typography>
                  )}
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>

      {/* Search Bar at the Bottom for Mobile */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 2,
            background: '#ffffff',
            borderTop: '1px solid #ddd',
            zIndex: 1000,
            height: '35%',
          }}
        >
          {renderSearchSection}
        </Box>
      )}
    </Box>
  )
}

export default RestaurantMap
