import L from 'leaflet';

export const ICONS = {
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
};

export const TAG_COLORS: Record<string, string> = {
  italian: '#FF5733',
  pizza: '#33FF57',
  asian: '#3357FF',
  default: '#AAAAAA',
};
