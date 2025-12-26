import { Search, MapPin, X, ChevronDown } from 'lucide-react';
import type { BusStop } from '../types';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface SearchPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredStops: BusStop[];
  allStops?: BusStop[];
  onStopSelect: (stop: BusStop) => void;
}

export function SearchPanel({ searchQuery, onSearchChange, filteredStops, allStops = [], onStopSelect }: SearchPanelProps) {
  const showResults = searchQuery.length > 0;
  // Use passed allStops if available, fallback to filteredStops for backward compatibility (though App.tsx will pass it)
  const dropdownStops = allStops.length > 0 ? allStops : filteredStops;

  return (
    <Card className="shadow-lg overflow-hidden border-0">
      <CardContent className="p-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
            <Search className="w-5 h-5" />
          </div>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="のりばや行き先を検索..."
            className="w-full pl-10 pr-10 py-6 text-base rounded-lg border-gray-200 focus-visible:ring-blue-500"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 h-8 w-8"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Station Select Dropdown (From Reference) */}
        <div className="mt-4 relative">
          <select
            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
            onChange={(e) => {
              const stop = dropdownStops.find(s => s.id === e.target.value);
              if (stop) {
                onStopSelect(stop);
                onSearchChange(''); // Clear search if any
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>バス停を選択...</option>
            {dropdownStops.filter(s => !s.isDropOffOnly).map(stop => (
              <option key={stop.id} value={stop.id}>
                {stop.name} {stop.area === 'east' ? '(東口)' : '(西口)'}
              </option>
            ))}
          </select>

        </div>

        {/* Search Results */}
        {showResults && (
          <div className="mt-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredStops.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>検索結果が見つかりませんでした</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredStops.map(stop => {
                  const areaLabel = stop.area === 'east' ? '東口' : '西口';
                  const areaColor = stop.area === 'east' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
                  const operatorName =
                    stop.operator === 'tobu' ? '東武' :
                      stop.operator === 'seibu' ? '西武' :
                        '国際興業';

                  return (
                    <button
                      key={stop.id}
                      onClick={() => {
                        onStopSelect(stop);
                        onSearchChange('');
                      }}
                      disabled={stop.isDropOffOnly}
                      className={`w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 ${stop.isDropOffOnly ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                      <div className="mt-1">
                        <MapPin className={`w-5 h-5 ${stop.area === 'east' ? 'text-blue-600' : 'text-purple-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-gray-900">{stop.name}</h4>
                          <span className={`px-2 py-0.5 ${areaColor} text-xs rounded`}>
                            {areaLabel}
                          </span>
                          <span className="text-xs text-gray-500">{operatorName}</span>
                          {stop.isDropOffOnly && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                              降車専用
                            </span>
                          )}
                        </div>
                        {!stop.isDropOffOnly && stop.destinations.length > 0 && (
                          <p className="text-sm text-gray-500 truncate">
                            {stop.destinations.slice(0, 3).join(' / ')}
                            {stop.destinations.length > 3 && ' 他'}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Quick Stats */}
      {!showResults && (
        <div className="px-4 pb-4 grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl text-blue-600 mb-1">9</div>
            <div className="text-xs text-blue-700">東口のりば</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="text-2xl text-purple-600 mb-1">11</div>
            <div className="text-xs text-purple-700">西口のりば</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl text-gray-600 mb-1">20</div>
            <div className="text-xs text-gray-700">合計</div>
          </div>
        </div>
      )}
    </Card>
  );
}
