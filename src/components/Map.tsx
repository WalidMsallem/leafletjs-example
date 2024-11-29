import { FC } from 'react'
import { useQuery } from 'react-query'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import axios from 'axios'

delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const SetView: FC<{ center: any; zoom: number }> = ({ center, zoom }) => {
  const map = useMap()
  map.setView(center, zoom) // Dynamically set the center and zoom
  return null
}

// Define a custom hook to fetch food places
const useFetchFoodPlaces = (latitude: number, longitude: number) => {
  return useQuery(['foodPlaces', latitude, longitude], async () => {
    const query = `
      [out:json];
      node["amenity"="restaurant"](around:1000, ${latitude}, ${longitude});
      out;
    `
    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      query,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
    return response.data.elements // Overpass returns results in "elements"
  })
}

const complyCubePosition: [number, number] = [51.5074, -0.1278]

const MapComponent = () => {
  const {
    data: foodPlaces,
    isLoading,
    error,
  } = useFetchFoodPlaces(complyCubePosition[0], complyCubePosition[1])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading data</div>

  return (
    <MapContainer style={{ height: '100vh', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <SetView center={complyCubePosition} zoom={15} />

      {foodPlaces.map((place: any, index: number) => (
        <Marker key={index} position={[place.lat, place.lon]}>
          <Popup>Restaurant</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default MapComponent



