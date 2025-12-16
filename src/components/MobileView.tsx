import { useState, useEffect } from 'react';
import { Search, X, Navigation, Info } from 'lucide-react';
import { BusStopMap } from './BusStopMap';
import { RoutePanel } from './RoutePanel';
import { DepartureBoard } from './DepartureBoard';
import { RouteStopsList } from './RouteStopsList';
import { getRouteById } from '../data/busData';
import type { BusStop } from '../types';

interface MobileViewProps {
  filteredStops: BusStop[];
  selectedStop: BusStop | null;
  onStopSelect: (stop: BusStop) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentTime: Date;
}

export function MobileView({
  filteredStops,
  selectedStop,
  onStopSelect,
  searchQuery,
  onSearchChange,
  currentTime
}: MobileViewProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState<'collapsed' | 'peek' | 'half' | 'full'>('collapsed');
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Update drawer when stop is selected
  useEffect(() => {
    if (selectedStop) {
      setDrawerHeight('peek');
    } else {
      setDrawerHeight('collapsed');
    }
  }, [selectedStop]);

  const handleStopSelect = (stop: BusStop) => {
    onStopSelect(stop);
    setDrawerHeight('peek');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const diff = startY - currentY;
    const threshold = 50;

    if (Math.abs(diff) < threshold) {
      // Small drag, snap back
      setCurrentY(0);
      return;
    }

    // Determine new state based on drag direction and current state
    if (diff > 0) {
      // Dragged up
      if (drawerHeight === 'peek') {
        setDrawerHeight('half');
      } else if (drawerHeight === 'half') {
        setDrawerHeight('full');
      }
    } else {
      // Dragged down
      if (drawerHeight === 'full') {
        setDrawerHeight('half');
      } else if (drawerHeight === 'half') {
        setDrawerHeight('peek');
      } else if (drawerHeight === 'peek') {
        setDrawerHeight('collapsed');
        onStopSelect(null);
      }
    }

    setCurrentY(0);
    setStartY(0);
  };

  const getDrawerTransform = () => {
    if (isDragging && currentY !== 0) {
      const diff = currentY - startY;
      return `translateY(${diff}px)`;
    }

    switch (drawerHeight) {
      case 'collapsed':
        return 'translateY(100%)';
      case 'peek':
        return 'translateY(calc(100% - 280px))';
      case 'half':
        return 'translateY(50%)';
      case 'full':
        return 'translateY(0)';
      default:
        return 'translateY(100%)';
    }
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-gray-50">
      {/* Full Screen Map */}
      <div className="absolute inset-0 z-0">
        <BusStopMap 
          stops={filteredStops}
          selectedStop={selectedStop}
          onStopSelect={handleStopSelect}
        />
      </div>

      {/* Top Search Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3">
        <div className="flex items-center gap-2">
          {!showSearch ? (
            <>
              {/* Search Button */}
              <button
                onClick={() => setShowSearch(true)}
                className="flex-1 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3 text-left hover:shadow-2xl transition-all active:scale-[0.98]"
              >
                <Search className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-gray-600">のりばや行き先を検索...</span>
              </button>
              
              {/* Time Display */}
              <div className="bg-white rounded-2xl shadow-xl px-4 py-4 flex-shrink-0">
                <div className="text-sm font-semibold text-gray-900">
                  {currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </>
          ) : (
            /* Search Input */
            <div className="flex-1 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3">
              <Search className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="のりばや行き先を検索..."
                className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-400"
                autoFocus
              />
              <button 
                onClick={() => {
                  setShowSearch(false);
                  onSearchChange('');
                }}
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearch && searchQuery && (
          <div className="mt-2 bg-white rounded-2xl shadow-2xl max-h-[65vh] overflow-y-auto">
            {filteredStops.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-900 mb-1">検索結果が見つかりません</p>
                <p className="text-sm text-gray-500">別のキーワードをお試しください</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredStops.map(stop => {
                  const areaLabel = stop.area === 'east' ? '東口' : '西口';
                  const areaColor = stop.area === 'east' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white';
                  
                  return (
                    <button
                      key={stop.id}
                      onClick={() => {
                        if (!stop.isDropOffOnly) {
                          handleStopSelect(stop);
                          setShowSearch(false);
                          onSearchChange('');
                        }
                      }}
                      disabled={stop.isDropOffOnly}
                      className={`w-full p-4 text-left transition-colors ${
                        stop.isDropOffOnly ? 'opacity-50' : 'hover:bg-blue-50 active:bg-blue-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-900 font-medium">{stop.name}</span>
                        <span className={`px-2.5 py-1 ${areaColor} text-xs rounded-full font-medium`}>
                          {areaLabel}
                        </span>
                        {stop.isDropOffOnly && (
                          <span className="px-2.5 py-1 bg-orange-500 text-white text-xs rounded-full font-medium">
                            降車専用
                          </span>
                        )}
                      </div>
                      {!stop.isDropOffOnly && stop.destinations.length > 0 && (
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {stop.destinations.slice(0, 3).join(' • ')}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      {drawerHeight === 'collapsed' && !showSearch && (
        <div className="absolute bottom-8 right-4 z-20 flex flex-col gap-3">
          {/* Info Button */}
          <button
            onClick={() => setDrawerHeight('half')}
            className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-all active:scale-95"
          >
            <Info className="w-7 h-7" />
          </button>
        </div>
      )}

      {/* Bottom Drawer */}
      <div
        className="absolute left-0 right-0 bottom-0 z-30 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out"
        style={{
          height: '100%',
          transform: getDrawerTransform(),
          touchAction: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drawer Handle */}
        <div className="flex justify-center pt-4 pb-3">
          <div className="w-14 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Drawer Content */}
        <div className="h-full overflow-hidden flex flex-col">
          {selectedStop ? (
            <>
              {/* Header */}
              <div className="px-5 pb-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl text-gray-900 mb-2 font-semibold">{selectedStop.name}</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedStop.isOmiyaStation && (
                        <span className={`px-3 py-1.5 text-sm rounded-full font-medium ${
                          selectedStop.area === 'east' 
                            ? 'bg-blue-500 text-white' 
                            : selectedStop.area === 'west'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}>
                          {selectedStop.area === 'east' ? '東口' : selectedStop.area === 'west' ? '西口' : '駅'}
                        </span>
                      )}
                      <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                        {selectedStop.operator === 'tobu' ? '東武バス' :
                         selectedStop.operator === 'seibu' ? '西武バス' :
                         '国際興業バス'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDrawerHeight('collapsed');
                      onStopSelect(null);
                    }}
                    className="p-2.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-5 space-y-5">
                  {/* Show different content based on whether it's an Omiya Station stop */}
                  {selectedStop.isOmiyaStation ? (
                    <>
                      {/* Quick Info for Omiya Station */}
                      <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                        <h3 className="text-gray-900 mb-3 flex items-center gap-2 font-semibold">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          主な行き先
                        </h3>
                        {selectedStop.destinations.length > 0 ? (
                          <div className="space-y-2">
                            {selectedStop.destinations.map((dest, idx) => (
                              <div key={idx} className="text-sm text-gray-700 flex items-center gap-3 bg-white rounded-xl p-3">
                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs text-white font-semibold">{idx + 1}</span>
                                </div>
                                <span className="font-medium">{dest}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 bg-white rounded-xl p-4 text-center">情報がありません</p>
                        )}
                      </div>

                      {/* Route Panel */}
                      <div className="bg-white">
                        <RoutePanel 
                          stop={selectedStop}
                          onClose={() => {
                            setDrawerHeight('collapsed');
                            onStopSelect(null);
                          }}
                        />
                      </div>

                      {/* Departure Board */}
                      <div className="bg-white">
                        <DepartureBoard 
                          stop={selectedStop}
                          currentTime={currentTime}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Info for Route Stops (not Omiya Station) */}
                      <div className="bg-gradient-to-br from-purple-50 via-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-100">
                        <h3 className="text-gray-900 mb-3 flex items-center gap-2 font-semibold">
                          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <Navigation className="w-5 h-5 text-white" />
                          </div>
                          通過する路線
                        </h3>
                        {selectedStop.routes.length > 0 ? (
                          <div className="space-y-2">
                            {selectedStop.routes.map((routeId) => {
                              const route = getRouteById(routeId);
                              if (!route) return null;
                              return (
                                <div key={routeId} className="bg-white rounded-xl p-3">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="px-3 py-2 rounded-lg text-white text-sm font-bold shadow-md"
                                      style={{ backgroundColor: route.color }}
                                    >
                                      {route.name}
                                    </div>
                                    <span className="text-sm text-gray-700 font-medium flex-1">
                                      {route.description || route.name}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 bg-white rounded-xl p-4 text-center">路線情報がありません</p>
                        )}
                      </div>

                      {/* Route Stops List */}
                      {selectedStop.routes.length > 0 && selectedStop.routes.map((routeId) => {
                        const route = getRouteById(routeId);
                        if (!route) return null;
                        return (
                          <RouteStopsList
                            key={routeId}
                            route={route}
                            currentStopId={selectedStop.id}
                            onStopClick={handleStopSelect}
                          />
                        );
                      })}
                    </>
                  )}

                  {/* Bottom Padding */}
                  <div className="h-10"></div>
                </div>
              </div>
            </>
          ) : (
            /* No Selection - Show Info */
            <div className="p-6 text-center overflow-y-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl text-gray-900 mb-2 font-semibold">OMIYA Bus Route</h3>
              <p className="text-gray-600 mb-8">
                大宮駅バス案内システム
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
                  <div className="text-3xl font-bold mb-1">9</div>
                  <div className="text-sm opacity-90">東口</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
                  <div className="text-3xl font-bold mb-1">11</div>
                  <div className="text-sm opacity-90">西口</div>
                </div>
                <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl p-4 text-white shadow-lg">
                  <div className="text-3xl font-bold mb-1">20</div>
                  <div className="text-sm opacity-90">合計</div>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mb-6">
                <p className="text-gray-700 font-medium">
                  地図上のバス停をタップすると<br/>詳細情報が表示されます
                </p>
              </div>

              {/* Legend */}
              <div className="bg-gray-50 rounded-2xl p-5 text-left border border-gray-200">
                <h4 className="text-gray-900 mb-4 text-center font-semibold">凡例</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex-shrink-0 shadow-md"></div>
                    <span className="text-sm text-gray-700 font-medium">東口</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-600 flex-shrink-0 shadow-md"></div>
                    <span className="text-sm text-gray-700 font-medium">西口</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-600 flex-shrink-0 shadow-md"></div>
                    <span className="text-sm text-gray-700 font-medium">東武</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-orange-600 flex-shrink-0 shadow-md"></div>
                    <span className="text-sm text-gray-700 font-medium">降車専用</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}