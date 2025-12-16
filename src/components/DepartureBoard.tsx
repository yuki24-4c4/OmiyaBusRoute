import { useMemo } from 'react';
import type { BusStop } from '../types';
import { getDepartures } from '../data/busData';
import { Clock, TrendingUp, Radio } from 'lucide-react';

interface DepartureBoardProps {
  stop: BusStop;
  currentTime: Date;
}

export function DepartureBoard({ stop, currentTime }: DepartureBoardProps) {
  const departures = useMemo(
    () => getDepartures(stop.id, currentTime),
    [stop.id, currentTime]
  );

  if (stop.isDropOffOnly) {
    return null;
  }

  const nextDeparture = departures[0];

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg text-gray-900 font-semibold">発車時刻</h2>
        </div>
      </div>

      {/* Next Departure Highlight */}
      {nextDeparture && (
        <div className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-4 h-4 text-white animate-pulse" />
            <span className="text-xs text-white font-semibold uppercase tracking-wide">次の発車</span>
          </div>
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-4xl text-white font-bold">{nextDeparture.departureTime}</span>
            {nextDeparture.delay && nextDeparture.delay > 0 && (
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <TrendingUp className="w-4 h-4 text-white" />
                <span className="text-sm text-white font-semibold">+{nextDeparture.delay}分</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-white text-blue-600 text-sm font-semibold rounded-lg">
              {nextDeparture.routeName}
            </span>
            <span className="text-sm text-white font-medium">{nextDeparture.destination}</span>
          </div>
        </div>
      )}

      {/* Departure List */}
      <div className="max-h-64 overflow-y-auto">
        {departures.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium mb-1">発車予定なし</p>
            <p className="text-sm text-gray-500">現在、発車予定のバスはありません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 border-2 border-gray-200 rounded-2xl overflow-hidden">
            {departures.slice(1).map((departure, index) => (
              <div
                key={index}
                className="p-4 hover:bg-blue-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-xl text-gray-900 font-semibold w-16">
                    {departure.departureTime}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
                    {departure.routeName}
                  </span>
                  <span className="text-sm text-gray-700 flex-1 truncate font-medium">
                    {departure.destination}
                  </span>
                </div>
                {departure.delay && departure.delay > 0 && (
                  <span className="text-sm text-orange-600 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg font-semibold">
                    <TrendingUp className="w-3 h-3" />
                    +{departure.delay}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <Radio className="w-4 h-4" />
          <span className="font-medium">リアルタイム情報は参考値です</span>
        </div>
      </div>
    </div>
  );
}