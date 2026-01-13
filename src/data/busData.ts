import type { BusStop, Route, Departure } from '../types';
import kokusaiRaw from '../../kokusai_bus.json';
import omiyaRaw from '../../omiya_station.json';
import seibuRaw from '../../seibubus_latlon.json';

type KokusaiRecord = {
  id: string;
  title: string;
  number: string;
  lat: number | null;
  lon: number | null;
};

type OmiyaRecord = {
  id: number;
  titles?: string[];
  lat: number | null;
  lon: number | null;
};

type OmiyaStationData = Record<string, OmiyaRecord[]>;

type SeibuRecord = {
  title: string;
  lat: number | null;
  lon: number | null;
};

const OMIYA_CENTER = { lat: 35.9065, lng: 139.624 };
const coordKey = (lat: number, lng: number) => `${lat.toFixed(4)}:${lng.toFixed(4)}`;

const resolveOmiyaArea = (label: string, lon: number) => {
  if (label.includes('\u6771')) return 'east';
  if (label.includes('\u897f')) return 'west';
  return lon >= OMIYA_CENTER.lng ? 'east' : 'west';
};

const omiyaStops: BusStop[] = Object.entries(omiyaRaw as OmiyaStationData).flatMap(
  ([label, stops]) =>
    (Array.isArray(stops) ? stops : [])
      .filter((stop) => typeof stop.lat === 'number' && typeof stop.lon === 'number')
      .map((stop) => {
        const lat = stop.lat as number;
        const lon = stop.lon as number;
        const area = resolveOmiyaArea(label, lon);
        const namePrefix = area === 'east'
          ? '\u5927\u5bae\u99c5 \u6771\u53e3'
          : '\u5927\u5bae\u99c5 \u897f\u53e3';

        return {
          id: `omiya-${area}-${stop.id}`,
          name: `${namePrefix} ${stop.id}`,
          area,
          position: { x: 0, y: 0 },
          coordinates: { lat, lng: lon },
          operator: 'seibu',
          isDropOffOnly: false,
          destinations: stop.titles ?? [],
          routes: [],
          isOmiyaStation: true,
        };
      }),
);

const omiyaCoordKeys = new Set(
  omiyaStops.map((stop) => coordKey(stop.coordinates.lat, stop.coordinates.lng)),
);

const seibuStops: BusStop[] = (seibuRaw as SeibuRecord[])
  .filter((stop) => typeof stop.lat === 'number' && typeof stop.lon === 'number')
  .filter((stop) => !omiyaCoordKeys.has(coordKey(stop.lat as number, stop.lon as number)))
  .map((stop, index) => ({
    id: `seibu-${index + 1}`,
    name: stop.title?.trim() ? stop.title : `Seibu Stop ${index + 1}`,
    area: 'route',
    position: { x: 0, y: 0 },
    coordinates: { lat: stop.lat as number, lng: stop.lon as number },
    operator: 'seibu',
    isDropOffOnly: false,
    destinations: [],
    routes: [],
  }));

// 国際興業のJSONをそのまま読み込み、緯度経度があるものだけを描画用データに整形する
const kokusaiStops: BusStop[] = (kokusaiRaw as KokusaiRecord[])
  .filter((stop) => typeof stop.lat === 'number' && typeof stop.lon === 'number')
  .map((stop) => ({
    id: stop.id,
    name: stop.title,
    area: 'route', // 駅の東西ではなく経路上の停留所として扱う
    position: { x: 0, y: 0 }, // 既存UIでは未使用のためダミー
    coordinates: { lat: stop.lat as number, lng: stop.lon as number },
    operator: 'kokusai',
    isDropOffOnly: false,
    destinations: [],
    routes: [],
  }));

export const busStops: BusStop[] = [...omiyaStops, ...seibuStops, ...kokusaiStops];

// ルート情報は実データが無いため空にする（仮データ表示をやめる）
export const routes: Route[] = [];

export function getBusStopById(id: string): BusStop | undefined {
  return busStops.find((stop) => stop.id === id);
}

export function getRouteById(id: string): Route | undefined {
  return routes.find((route) => route.id === id);
}

// 実路線を持たないため、ダミーの出発情報も生成しない
export function getDepartures(_stopId: string, _currentTime: Date): Departure[] {
  return [];
}
