import { MapPin, Check } from 'lucide-react';
import type { BusStop } from '../types';
import { Card, CardContent } from './ui/card';

interface SearchPanelProps {
  filterOmiya: boolean;
  onFilterOmiyaChange: (val: boolean) => void;
  filterOthers: boolean;
  onFilterOthersChange: (val: boolean) => void;
  filteredStops: BusStop[];
  allStops?: BusStop[];
  onStopSelect: (stop: BusStop) => void;
}

export function SearchPanel({
  filterOmiya,
  onFilterOmiyaChange,
  filterOthers,
  onFilterOthersChange,
  filteredStops,
  allStops = [],
  onStopSelect
}: SearchPanelProps) {
  // Use filteredStops for the dropdown to match the visible map markers
  const dropdownStops = filteredStops;

  const omiyaCount = allStops.filter(s => s.isOmiyaStation).length; // 20 roughly
  const otherCount = allStops.filter(s => !s.isOmiyaStation).length;

  return (
    <Card className="shadow-lg overflow-hidden border-0">
      <CardContent className="p-4">
        {/* Filters */}
        <div className="mb-6 space-y-3">
          <h3 className="font-bold text-gray-700 text-sm mb-2">表示フィルター</h3>
          <div className="flex gap-3">
            <div
              onClick={() => onFilterOmiyaChange(!filterOmiya)}
              className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 active:scale-[0.98] ${filterOmiya
                ? 'bg-blue-50 border-blue-500'
                : 'bg-white border-gray-100 hover:border-blue-200'
                }`}
            >
              <div className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border transition-colors ${filterOmiya ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
                }`}>
                {filterOmiya && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-bold leading-none mb-1 ${filterOmiya ? 'text-blue-700' : 'text-gray-700'}`}>大宮駅</span>
                <span className="text-xs text-gray-500 leading-none">
                  {allStops.filter(s => s.isOmiyaStation && !s.isDropOffOnly).length}箇所
                </span>
              </div>
            </div>

            <div
              onClick={() => onFilterOthersChange(!filterOthers)}
              className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 active:scale-[0.98] ${filterOthers
                ? 'bg-blue-50 border-blue-500'
                : 'bg-white border-gray-100 hover:border-blue-200'
                }`}
            >
              <div className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border transition-colors ${filterOthers ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
                }`}>
                {filterOthers && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-bold leading-none mb-1 ${filterOthers ? 'text-blue-700' : 'text-gray-700'}`}>それ以外</span>
                <span className="text-xs text-gray-500 leading-none">
                  {otherCount}箇所
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Station Select Dropdown */}
        <div className="relative">
          <select
            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
            onChange={(e) => {
              const stop = dropdownStops.find(s => s.id === e.target.value);
              if (stop) {
                onStopSelect(stop);
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>バス停を選択...</option>
            {dropdownStops.filter(s => !s.isDropOffOnly).map(stop => (
              <option key={stop.id} value={stop.id}>
                {stop.name} {stop.area === 'east' ? '(東口)' : stop.area === 'west' ? '(西口)' : ''}
              </option>
            ))}
          </select>
        </div>
      </CardContent>


    </Card>
  );
}
