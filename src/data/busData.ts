import type { BusStop, Route, Departure } from '../types';
import kokusaiRaw from '../../kokusai_bus.json';

type KokusaiRecord = {
  id: string;
  title: string;
  number: string;
  lat: number | null;
  lon: number | null;
};

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

export const busStops: BusStop[] = kokusaiStops;

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
