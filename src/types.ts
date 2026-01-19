export interface BusStop {
  id: string;
  name: string;
  area: 'east' | 'west' | 'route'; // 'route' for stops along the route
  position: { x: number; y: number };
  coordinates: { lat: number; lng: number };
  operator: 'tobu' | 'seibu' | 'kokusai';
  isDropOffOnly: boolean;
  destinations: string[];
  routes: string[];
  isOmiyaStation?: boolean; // true if this is an Omiya Station stop
}

export interface Route {
  id: string;
  name: string;
  operator: 'tobu' | 'seibu' | 'kokusai';
  color: string;
  stops: string[]; // Array of bus stop IDs in order
  description?: string; // Route description
}

export interface Departure {
  routeId: string;
  routeName: string;
  destination: string;
  departureTime: string;
  isRealTime: boolean;
  delay?: number;
  platform?: string;
}

export interface OmiyaPlatform {
  id: number;
  titles: string[];
  lat: number;
  lon: number;
}

export interface OmiyaStationData {
  西口: OmiyaPlatform[];
  東口: OmiyaPlatform[];
}
