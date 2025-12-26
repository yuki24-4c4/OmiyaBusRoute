import { Bus, X } from 'lucide-react';
import { useState } from 'react';
import type { BusStop } from '../types';
import { getRouteById } from '../data/busData';
import { RouteStopsList } from './RouteStopsList';

interface RoutePanelProps {
  stop: BusStop;
  onClose: () => void;
}

export function RoutePanel({ stop, onClose }: RoutePanelProps) {
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(new Set());

  const toggleRoute = (routeId: string) => {
    setExpandedRoutes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(routeId)) {
        newSet.delete(routeId);
      } else {
        newSet.add(routeId);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Content */}
      <div className="">
        {stop.isDropOffOnly ? (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-orange-100 border-2 border-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg text-gray-900 mb-2 font-semibold">降車専用バス停</h3>
            <p className="text-sm text-gray-600">このバス停からは乗車できません</p>
          </div>
        ) : (
          <>
            {/* Routes */}
            {stop.routes.length > 0 && (
              <div className="mb-4">
                <h3 className="text-gray-900 mb-3 flex items-center gap-2 font-semibold">
                  <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
                    <Bus className="w-5 h-5 text-white" />
                  </div>
                  運行系統
                </h3>
                <div className="space-y-3">
                  {stop.routes.map(routeId => {
                    const route = getRouteById(routeId);
                    if (!route) return null;
                    const isExpanded = expandedRoutes.has(routeId);
                    
                    return (
                      <div key={routeId} className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                          <div
                            className="px-3 py-2 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0"
                            style={{ backgroundColor: route.color }}
                          >
                            {route.name}
                          </div>
                          <div className="flex-1 text-left">
                            <span className="text-sm text-gray-700 font-medium block">{route.name}</span>
                            {route.description && (
                              <span className="text-xs text-gray-500">{route.description}</span>
                            )}
                          </div>
                          <button
                            onClick={() => toggleRoute(routeId)}
                            className="flex-shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-all active:scale-95 font-medium"
                          >
                            途中の停留所
                          </button>
                        </div>
                        
                        {isExpanded && (
                          <div className="ml-3 animate-in slide-in-from-top-2 duration-200">
                            <RouteStopsList
                              route={route}
                              currentStopId={stop.id}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}