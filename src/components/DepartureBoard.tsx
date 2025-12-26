import { useMemo, useState } from 'react';
import type { BusStop } from '../types';
import { getDepartures, getRouteById } from '../data/busData';
import { Clock, TrendingUp, Radio, ChevronDown, ChevronUp } from 'lucide-react'; // Added icons for expand/collapse hint
import { RouteStopsList } from './RouteStopsList';

interface DepartureBoardProps {
  stop: BusStop;
  currentTime: Date;
}

export function DepartureBoard({ stop, currentTime }: DepartureBoardProps) {
  const departures = useMemo(
    () => getDepartures(stop.id, currentTime),
    [stop.id, currentTime]
  );

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(prev => prev === index ? null : index);
  };



  if (stop.isDropOffOnly) {
    return null;
  }



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

      {/* Next 3 Departures */}
      <div className="space-y-4">
        {departures.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium mb-1">発車予定なし</p>
            <p className="text-sm text-gray-500">現在、発車予定のバスはありません</p>
          </div>
        ) : (
          departures.slice(0, 3).map((departure, index) => {
            const isExpanded = expandedIndex === index;
            const route = departure.routeId ? getRouteById(departure.routeId) : null;

            return (
              <div key={index} className="transition-all duration-300">
                <div
                  onClick={() => toggleExpand(index)}
                  className={`p-5 rounded-2xl shadow-lg cursor-pointer transition-all active:scale-[0.98] ${index === 0
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      : 'bg-white border border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {index === 0 ? (
                        <>
                          <Radio className="w-4 h-4 text-white animate-pulse" />
                          <span className="text-xs text-white font-semibold uppercase tracking-wide">次の発車</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">発車予定</span>
                        </>
                      )}
                    </div>
                    {/* Expand Hint Icon */}
                    {index === 0 ? (
                      isExpanded ? <ChevronUp className="w-4 h-4 text-white/80" /> : <ChevronDown className="w-4 h-4 text-white/80" />
                    ) : (
                      isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className={`text-4xl font-bold ${index === 0 ? 'text-white' : 'text-gray-900'}`}>
                      {departure.departureTime}
                    </span>
                    {departure.delay && departure.delay > 0 && (
                      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${index === 0 ? 'bg-white/20 backdrop-blur-sm' : 'bg-orange-50'}`}>
                        <TrendingUp className={`w-4 h-4 ${index === 0 ? 'text-white' : 'text-orange-600'}`} />
                        <span className={`text-sm font-semibold ${index === 0 ? 'text-white' : 'text-orange-600'}`}>+{departure.delay}分</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${index === 0 ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-700'}`}>
                      {departure.routeName}
                    </span>
                    <span className={`text-sm font-medium ${index === 0 ? 'text-white' : 'text-gray-700'}`}>
                      {departure.destination}
                    </span>
                  </div>
                </div>

                {/* Expanded Route Details */}
                {isExpanded && route && (
                  <div className="mt-2 ml-2 pl-4 border-l-2 border-gray-200 animate-in slide-in-from-top-2 duration-200">
                    <div className="bg-gray-50 rounded-xl p-4 text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-700">停車バス停一覧</span>
                      </div>
                      <RouteStopsList route={route} currentStopId={stop.id} />
                    </div>
                  </div>
                )}
              </div>
            );
          })
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