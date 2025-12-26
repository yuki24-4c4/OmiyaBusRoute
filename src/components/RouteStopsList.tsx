import { MapPin, Navigation } from 'lucide-react';
import type { BusStop, Route } from '../types';
import { getBusStopById } from '../data/busData';

interface RouteStopsListProps {
  route: Route;
  currentStopId?: string;
  onStopClick?: (stop: BusStop) => void;
}

export function RouteStopsList({ route, currentStopId, onStopClick }: RouteStopsListProps) {
  const stops = route.stops
    .map(stopId => getBusStopById(stopId))
    .filter((stop): stop is BusStop => stop !== undefined);

  if (stops.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-md"
            style={{ backgroundColor: route.color }}
          >
            <Navigation className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-semibold text-sm">{route.name}</h4>
          </div>
          <div className="text-xs text-blue-100">
            全 {stops.length} 停留所
          </div>
        </div>
      </div>

      {/* Stops List */}
      <div className="max-h-96 overflow-y-auto">
        {stops.map((stop, index) => {
          const isCurrent = stop.id === currentStopId;
          const isFirst = index === 0;
          const isLast = index === stops.length - 1;
          const isOmiya = stop.isOmiyaStation;

          return (
            <div key={stop.id} className="relative">
              {/* Connection Line */}
              {!isLast && (
                <div 
                  className="absolute left-7 top-12 bottom-0 w-1 z-0"
                  style={{ backgroundColor: route.color }}
                />
              )}

              {/* Stop Item */}
              <button
                onClick={() => onStopClick?.(stop)}
                disabled={!onStopClick}
                className={`w-full p-4 text-left transition-all relative z-10 ${
                  isCurrent 
                    ? 'bg-blue-50 border-l-4' 
                    : onStopClick ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
                }`}
                style={isCurrent ? { borderLeftColor: route.color } : {}}
              >
                <div className="flex items-start gap-3">
                  {/* Stop Number & Icon */}
                  <div className="flex-shrink-0 relative">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-md relative z-10"
                      style={{ backgroundColor: route.color }}
                    >
                      {isFirst ? (
                        <Navigation className="w-4 h-4" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                  </div>

                  {/* Stop Info */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gray-900 font-medium">
                        {stop.name}
                      </span>
                      {isOmiya && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium">
                          大宮駅
                        </span>
                      )}
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium">
                          現在地
                        </span>
                      )}
                    </div>
                    
                    {stop.operators && stop.operators.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {stop.operators.map(op => (
                          <span
                            key={op}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {op}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}