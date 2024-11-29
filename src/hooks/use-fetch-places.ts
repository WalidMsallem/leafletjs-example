import { useQuery } from 'react-query';
import axios from 'axios';
import { Place } from '../types/Place';

export const useFetchPlaces = (
  latitude: number,
  longitude: number,
  amenity: string,
  radius: number
) => {
  return useQuery<Place[]>(
    ['places', latitude, longitude, amenity, radius],
    async () => {
      const query = `
        [out:json];
        node["amenity"="${amenity}"](around:${radius}, ${latitude}, ${longitude});
        out;
      `;
      const response = await axios.post(
        'https://overpass-api.de/api/interpreter',
        query,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      return response.data.elements;
    },
    { initialData: [] }
  );
};
