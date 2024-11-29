import React, { FC } from 'react';
import { useMap } from 'react-leaflet';

const DynamicMapView: FC<{ center: [number, number]; zoom: number }> = ({
  center,
  zoom,
}) => {
  const map = useMap();

  React.useEffect(() => {
    if (map) {
      map.whenReady(() => {
        // Fly to the specified center and zoom once the map is ready
        map.flyTo(center, zoom, {
          animate: true,
          duration: 1.5, // Animation duration in seconds
        });
      });
    }
  }, [center, zoom, map]);

  return null;
};

export default DynamicMapView;
