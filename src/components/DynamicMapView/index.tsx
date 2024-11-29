import React, { FC } from 'react';
import { useMap } from 'react-leaflet';

const DynamicMapView: FC<{ center: [number, number]; zoom: number }> = ({
  center,
  zoom,
}) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export default DynamicMapView;
