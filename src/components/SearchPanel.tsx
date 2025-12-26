import { MapPin, Check } from 'lucide-react';
import type { BusStop } from '../types';
import { Card, CardContent } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

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
          <div className="flex gap-4">
         <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-omiya"
                checked={filterOmiya}
                onCheckedChange={(checked) => onFilterOmiyaChange(checked as boolean)}
              />
              <Label htmlFor="filter-omiya" className="text-sm font-medium cursor-pointer">
                大宮駅 ({allStops.filter(s => s.isOmiyaStation && !s.isDropOffOnly).length})
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-others"
                checked={filterOthers}
                onCheckedChange={(checked) => onFilterOthersChange(checked as boolean)}
              />
              <Label htmlFor="filter-others" className="text-sm font-medium cursor-pointer">
                それ以外 ({otherCount})
              </Label>
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

      {/* Quick Stats (Optional: keep or remove? User didn't say remove stats. Keeping them for "modern" look) */}
      <div className="px-4 pb-4 grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl text-blue-600 mb-1">{allStops.filter(s => s.isOmiyaStation && s.area === 'east' && !s.isDropOffOnly).length}</div>
          <div className="text-xs text-blue-700">東口のりば</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-2xl text-purple-600 mb-1">{allStops.filter(s => s.isOmiyaStation && s.area === 'west' && !s.isDropOffOnly).length}</div>
          <div className="text-xs text-purple-700">西口のりば</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl text-gray-600 mb-1">{filteredStops.length}</div>
          <div className="text-xs text-gray-700">表示中</div>
        </div>
      </div>
    </Card>
  );
}
