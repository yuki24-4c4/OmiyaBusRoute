import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { BusStop } from '../types';
import { getRouteById, getBusStopById } from '../data/busData';

// Fix for default marker icons if needed, though we use custom icons
// import icon from 'leaflet/dist/images/marker-icon.png';
// import iconShadow from 'leaflet/dist/images/marker-shadow.png';

interface BusStopMapProps {
  stops: BusStop[];
  selectedStop: BusStop | null;
  onStopSelect: (stop: BusStop) => void;
}

// MapController component to handle map view updates
function MapController({ selectedStop }: { selectedStop: BusStop | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedStop) {
      map.setView([selectedStop.coordinates.lat, selectedStop.coordinates.lng], 18, {
        animate: true,
      });
    }
  }, [selectedStop, map]);

  return null;
}

export function BusStopMap({ stops, selectedStop, onStopSelect }: BusStopMapProps) {
  // Get route paths for selected stop
  const routePolylines = selectedStop?.routes.flatMap(routeId => {
    const route = getRouteById(routeId);
    if (!route) return [];

    const stopCoordinates = route.stops
      .map(stopId => {
        // Try to find in passed stops first, then fallback to global helper
        const stop = stops.find(s => s.id === stopId) || getBusStopById(stopId);
        return stop ? [stop.coordinates.lat, stop.coordinates.lng] : null;
      })
      .filter((coord): coord is number[] => coord !== null);

    if (stopCoordinates.length < 2) return [];

    // TypeScript seems to need explicit casting or mapping for LatLngExpression[][]
    // but Polyline path options usually take [lat, lng][] array.
    // However, we are mapping multiple routes, so we return an array of coordinate arrays.
    return [{
      id: route.id,
      coordinates: stopCoordinates as [number, number][],
      color: 'red' // All routes red as requested
    }];
  }) || [];


  // Omiya Station Icon
  const stationIcon = L.divIcon({
    className: 'station-marker',
    html: `
      <div style="
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #1e40af 0%, #4f46e5 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">
        <div style="color: white; font-weight: bold; font-size: 12px; text-align: center; line-height: 1.2;">
          JR<br/>大宮
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });

  return (
    <div className="w-full h-full relative z-0" style={{ minHeight: '100%' }}>
      <MapContainer
        center={[35.9065, 139.624]}
        zoom={16}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ minHeight: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController selectedStop={selectedStop} />

        {/* Route Lines */}
        {routePolylines.map((route, idx) => (
          <Polyline
            key={`${route.id}-${idx}`}
            positions={route.coordinates}
            pathOptions={{ color: route.color, weight: 4, opacity: 0.7 }}
          />
        ))}

        {/* Omiya Station Marker */}
        <Marker position={[35.9065, 139.624]} icon={stationIcon}>
          <Popup>
            <strong>JR大宮駅</strong><br />Omiya Station
          </Popup>
        </Marker>

        {/* Bus Stop Markers */}
        {stops.map((stop) => {
          const isSelected = selectedStop?.id === stop.id;
          const areaColor = stop.area === 'east' ? '#2563eb' : stop.area === 'west' ? '#9333ea' : '#8b5cf6';
          const operatorColor =
            stop.operator === 'tobu' ? '#00A040' :
              stop.operator === 'seibu' ? '#FFD700' :
                '#E60012';

          const markerHtml = `
            <div style="position: relative;">
              ${isSelected ? `
                <div style="
                  position: absolute;
                  width: 56px;
                  height: 56px;
                  background: ${areaColor};
                  border-radius: 50%;
                  animation: pulse 1.5s ease-out infinite;
                  opacity: 0.75;
                  top: -8px;
                  left: -8px;
                "></div>
              ` : ''}
              <div style="
                width: ${isSelected ? '40px' : '32px'};
                height: ${isSelected ? '40px' : '32px'};
                background: ${stop.isDropOffOnly ? '#f97316' : areaColor};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 ${isSelected ? '6px 20px' : '3px 10px'} rgba(0,0,0,0.4);
                border: ${isSelected ? '4px' : '3px'} solid white;
                cursor: ${stop.isDropOffOnly ? 'not-allowed' : 'pointer'};
                transition: all 0.3s ease;
                position: relative;
                z-index: ${isSelected ? '1000' : '1'};
              ">
                ${stop.isDropOffOnly ?
              '<div style="width: 24px; height: 3px; background: white; transform: rotate(45deg); border-radius: 2px;"></div>' :
              `<div style="width: ${isSelected ? '12px' : '10px'}; height: ${isSelected ? '12px' : '10px'}; background: white; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.2);"></div>`
            }
              </div>
              ${!stop.isDropOffOnly ? `
                <div style="
                  position: absolute;
                  top: ${isSelected ? '-2px' : '-3px'};
                  right: ${isSelected ? '-2px' : '-3px'};
                  width: ${isSelected ? '18px' : '14px'};
                  height: ${isSelected ? '18px' : '14px'};
                  background: ${operatorColor};
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                "></div>
              ` : ''}
            </div>
            <style>
              @keyframes pulse {
                0% { transform: scale(1); opacity: 0.75; }
                100% { transform: scale(1.5); opacity: 0; }
              }
            </style>
          `;

          const icon = L.divIcon({
            className: 'bus-stop-marker',
            html: markerHtml,
            iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
            iconAnchor: [isSelected ? 20 : 16, isSelected ? 20 : 16],
            popupAnchor: [0, isSelected ? -20 : -16],
          });

          if (stop.isDropOffOnly) {
            return (
              <Marker
                key={stop.id}
                position={[stop.coordinates.lat, stop.coordinates.lng]}
                icon={icon}
              >
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>{stop.name}</strong>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                      {stop.area === 'east' ? '東口' : '西口'}
                    </div>
                    <div style={{ color: '#f97316', fontSize: '12px' }}>降車専用</div>
                  </div>
                </Popup>
              </Marker>
            );
          }

          return (
            <Marker
              key={stop.id}
              position={[stop.coordinates.lat, stop.coordinates.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onStopSelect(stop),
              }}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>{stop.name}</strong>
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                    {stop.area === 'east' ? '東口' : '西口'}
                  </div>
                  {stop.destinations.length > 0 && (
                    <div style={{ fontSize: '12px', color: '#555' }}>
                      {stop.destinations.slice(0, 2).join(' / ')}
                      {stop.destinations.length > 2 ? ' 他' : ''}
                    </div>
                  )}
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#2563eb' }}>クリックして詳細を表示</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}