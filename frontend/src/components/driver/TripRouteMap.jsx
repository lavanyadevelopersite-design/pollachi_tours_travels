import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function toLatLngs(geometry) {
  const coords = geometry?.coordinates || [];
  if (!coords.length) return [];
  if (geometry.type === 'MultiLineString') {
    return coords.flat().map(([lng, lat]) => [Number(lat), Number(lng)]);
  }
  return coords.map(([lng, lat]) => [Number(lat), Number(lng)]);
}

function FitRoute({ positions }) {
  const map = useMap();
  const key = positions?.length
    ? `${positions.length}:${positions[0]?.join(',')}:${positions[positions.length - 1]?.join(',')}`
    : '';
  useEffect(() => {
    if (!positions?.length) return;
    map.fitBounds(positions, { padding: [36, 36], maxZoom: 14 });
  }, [map, key]);
  return null;
}

export default function TripRouteMap({ route }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
    return () => setReady(false);
  }, []);

  const positions = useMemo(() => toLatLngs(route?.geometry), [route?.geometry]);
  const start = route?.from
    ? [Number(route.from.lat), Number(route.from.lng)]
    : positions[0];
  const end = route?.to
    ? [Number(route.to.lat), Number(route.to.lng)]
    : positions[positions.length - 1];
  const center = start || [11.0168, 76.9558];

  if (!ready || !start || !end) return null;

  return (
    <Box
      className="no-capitalize"
      sx={{
        height: { xs: '52vh', sm: 420 },
        minHeight: 280,
        borderRadius: 2.5,
        overflow: 'hidden',
        border: '1px solid rgba(28,35,47,0.1)',
        '& .leaflet-container': {
          height: '100%',
          width: '100%',
          zIndex: 0,
        },
      }}
    >
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {positions.length > 1 && (
          <Polyline positions={positions} pathOptions={{ color: '#0284c7', weight: 5, opacity: 0.9 }} />
        )}
        <FitRoute positions={positions.length > 1 ? positions : [start, end]} />
        <CircleMarker center={start} radius={9} pathOptions={{ color: '#047857', fillColor: '#10b981', fillOpacity: 1, weight: 2 }}>
          <Popup>
            <strong>Pickup</strong>
            <br />
            {route.from?.label || route.pickup_location || 'Start'}
          </Popup>
        </CircleMarker>
        <CircleMarker center={end} radius={9} pathOptions={{ color: '#b91c1c', fillColor: '#ef4444', fillOpacity: 1, weight: 2 }}>
          <Popup>
            <strong>Drop</strong>
            <br />
            {route.to?.label || route.drop_location || 'End'}
          </Popup>
        </CircleMarker>
      </MapContainer>
    </Box>
  );
}
