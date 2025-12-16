import { useEffect, useRef, useState } from 'react';
import type { BusStop } from '../types';

interface BusStopMapProps {
  stops: BusStop[];
  selectedStop: BusStop | null;
  onStopSelect: (stop: BusStop) => void;
}

// Declare Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

export function BusStopMap({ stops, selectedStop, onStopSelect }: BusStopMapProps) {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  // Load Leaflet from CDN
  useEffect(() => {
    // Check if already loaded
    if (window.L) {
      setIsLeafletLoaded(true);
      return;
    }

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      setIsLeafletLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup is handled by browser
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLeafletLoaded || !mapContainerRef.current || mapRef.current || !window.L) return;

    const L = window.L;

    // Create map centered on Omiya Station
    const map = L.map(mapContainerRef.current, {
      center: [35.9065, 139.624],
      zoom: 16,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add station marker
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

    L.marker([35.9065, 139.624], { icon: stationIcon })
      .addTo(map)
      .bindPopup('<strong>JR大宮駅</strong><br/>Omiya Station');

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isLeafletLoaded]);

  // Update markers when stops change
  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    const L = window.L;
    const map = mapRef.current;
    const markers = markersRef.current;

    // Remove markers that are no longer in stops
    markers.forEach((marker, id) => {
      if (!stops.find(stop => stop.id === id)) {
        map.removeLayer(marker);
        markers.delete(id);
      }
    });

    // Add or update markers for current stops
    stops.forEach(stop => {
      let marker = markers.get(stop.id);

      if (!marker) {
        // Determine marker color and style
        const areaColor = stop.area === 'east' ? '#2563eb' : stop.area === 'west' ? '#9333ea' : '#8b5cf6';
        const operatorColor = 
          stop.operator === 'tobu' ? '#00A040' :
          stop.operator === 'seibu' ? '#FFD700' :
          '#E60012';

        const markerIcon = L.divIcon({
          className: 'bus-stop-marker',
          html: `
            <div style="position: relative;">
              <div style="
                width: 40px;
                height: 40px;
                background: ${stop.isDropOffOnly ? '#f97316' : areaColor};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                border: 4px solid white;
                cursor: ${stop.isDropOffOnly ? 'not-allowed' : 'pointer'};
                transition: transform 0.2s;
              ">
                ${stop.isDropOffOnly ? 
                  '<div style="width: 24px; height: 3px; background: white; transform: rotate(45deg); border-radius: 2px;"></div>' :
                  '<div style="width: 12px; height: 12px; background: white; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.2);"></div>'
                }
              </div>
              ${!stop.isDropOffOnly ? `
                <div style="
                  position: absolute;
                  top: -2px;
                  right: -2px;
                  width: 16px;
                  height: 16px;
                  background: ${operatorColor};
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                "></div>
              ` : ''}
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -20],
        });

        marker = L.marker([stop.coordinates.lat, stop.coordinates.lng], {
          icon: markerIcon,
          title: stop.name,
        });

        // Add popup
        const popupContent = `
          <div style="min-width: 200px;">
            <strong style="font-size: 14px; display: block; margin-bottom: 4px;">${stop.name}</strong>
            <div style="font-size: 11px; color: #666; margin-bottom: 4px;">
              ${stop.area === 'east' ? '東口' : '西口'}
            </div>
            ${stop.isDropOffOnly ? 
              '<div style="color: #f97316; font-size: 12px;">降車専用</div>' :
              stop.destinations.length > 0 ?
                `<div style="font-size: 12px; color: #555;">
                  ${stop.destinations.slice(0, 2).join(' / ')}
                  ${stop.destinations.length > 2 ? ' 他' : ''}
                </div>` :
                ''
            }
            ${!stop.isDropOffOnly ? 
              '<div style="margin-top: 8px; font-size: 11px; color: #2563eb;">クリックして詳細を表示</div>' :
              ''
            }
          </div>
        `;
        marker.bindPopup(popupContent);

        // Add click handler
        if (!stop.isDropOffOnly) {
          marker.on('click', () => {
            onStopSelect(stop);
          });
        }

        marker.addTo(map);
        markers.set(stop.id, marker);
      }
    });

    markersRef.current = markers;
  }, [stops, onStopSelect, isLeafletLoaded]);

  // Update selected marker styling
  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    const L = window.L;
    const markers = markersRef.current;

    markers.forEach((marker, id) => {
      const stop = stops.find(s => s.id === id);
      if (!stop || stop.isDropOffOnly) return;

      const isSelected = selectedStop?.id === id;
      const areaColor = stop.area === 'east' ? '#2563eb' : '#9333ea';
      const operatorColor = 
        stop.operator === 'tobu' ? '#00A040' :
        stop.operator === 'seibu' ? '#FFD700' :
        '#E60012';

      const markerIcon = L.divIcon({
        className: 'bus-stop-marker',
        html: `
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
              background: ${areaColor};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 ${isSelected ? '6px 20px' : '3px 10px'} rgba(0,0,0,0.4);
              border: ${isSelected ? '4px' : '3px'} solid white;
              cursor: pointer;
              transition: all 0.3s ease;
              position: relative;
              z-index: ${isSelected ? '1000' : '1'};
            ">
              <div style="width: ${isSelected ? '12px' : '10px'}; height: ${isSelected ? '12px' : '10px'}; background: white; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.2);"></div>
            </div>
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
          </div>
          <style>
            @keyframes pulse {
              0% {
                transform: scale(1);
                opacity: 0.75;
              }
              100% {
                transform: scale(1.5);
                opacity: 0;
              }
            }
          </style>
        `,
        iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
        iconAnchor: [isSelected ? 20 : 16, isSelected ? 20 : 16],
        popupAnchor: [0, isSelected ? -20 : -16],
      });

      marker.setIcon(markerIcon);
    });
  }, [selectedStop, stops, isLeafletLoaded]);

  if (!isLeafletLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100" style={{ minHeight: '600px' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">地図を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full"
      style={{ minHeight: '600px' }}
    />
  );
}