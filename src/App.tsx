import { useState, useEffect } from "react";
import { BusStopMap } from "./components/BusStopMap";
import { RoutePanel } from "./components/RoutePanel";
import { DepartureBoard } from "./components/DepartureBoard";
import { SearchPanel } from "./components/SearchPanel";
import { MobileView } from "./components/MobileView";
import { Card, CardContent } from "./components/ui/card";
import SelectedPlatformBuses from "./components/SelectedPlatformBuses";
import { busStops, routes, getBusStopById } from "./data/busData";
import type { BusStop, OmiyaStationData } from "./types";
import omiyaStationData from "./../omiya_station.json";

// Helper function to get titles for Omiya station stop
function getTitlesForOmiyaStop(stop: BusStop): string[] {
  console.log("getTitlesForOmiyaStop called with:", stop.id);
  
  const data = omiyaStationData as OmiyaStationData;
  console.log("omiyaStationData loaded:", data);
  
  // Determine if this is West or East exit based on stop.id
  // stop.id format: "omiya-east-4" or "omiya-west-1"
  const isWest = stop.id.includes("west");
  const isEast = stop.id.includes("east");
  
  console.log("Stop ID analysis:", { stopId: stop.id, isWest, isEast });
  
  const platformList = isWest ? data.西口 : isEast ? data.東口 : null;
  console.log("platformList:", platformList);
  
  if (!platformList) {
    console.log("No platformList found, returning []");
    return [];
  }
  
  // Extract platform ID from stop.id (e.g., "omiya-east-4" -> id 4)
  const match = stop.id.match(/(\d+)$/);
  const platformId = match ? parseInt(match[1], 10) : NaN;
  console.log("Extracted platformId:", platformId);
  
  // Find matching platform
  const platform = platformList.find((p) => p.id === platformId);
  console.log("Found platform:", platform);
  
  const titles = platform?.titles || [];
  console.log("Returning titles:", titles);
  return titles;
}

export default function App() {
  // Default to Omiya East Exit Stop 1 (e1) or find first Omiya stop
  const defaultStop = busStops.find((s) => s.id === "e1") || null;
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(defaultStop);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOmiya, setFilterOmiya] = useState(true);
  const [filterOthers, setFilterOthers] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Debug: Check Omiya station data on load
  useEffect(() => {
    console.log("🔍 Available bus stops with isOmiyaStation:");
    busStops.forEach((stop) => {
      if (stop.isOmiyaStation) {
        console.log(`  ✓ ${stop.id}: ${stop.name} (isOmiyaStation: ${stop.isOmiyaStation})`);
      }
    });
    console.log("defaultStop:", defaultStop);
  }, []);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredStops = busStops.filter((stop) => {
    // Category Filter
    const isOmiya = !!stop.isOmiyaStation; // Ensure boolean
    const showCategory = (filterOmiya && isOmiya) || (filterOthers && !isOmiya);

    // Search Filter (keep for Mobile compatibility or if search is re-added)
    const matchesSearch =
      searchQuery === "" ||
      stop.name.includes(searchQuery) ||
      stop.destinations.some((dest) => dest.includes(searchQuery));

    return showCategory && matchesSearch;
  });

  // Mobile view
  if (isMobile) {
    return (
      <MobileView
        filteredStops={filteredStops}
        selectedStop={selectedStop}
        onStopSelect={setSelectedStop}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentTime={currentTime}
      />
    );
  }

  console.log("App.tsx rendering desktop view");

  // Get titles for Omiya station if selected
  console.log("🔍 Checking selectedStop:", selectedStop);
  
  let selectedTitles: string[] | undefined = undefined;
  
  if (selectedStop) {
    console.log("selectedStop exists:", {
      id: selectedStop.id,
      isOmiyaStation: selectedStop.isOmiyaStation,
      type: typeof selectedStop.isOmiyaStation,
    });
    
    if (selectedStop.isOmiyaStation) {
      console.log("✓ isOmiyaStation is true, calling getTitlesForOmiyaStop");
      selectedTitles = getTitlesForOmiyaStop(selectedStop);
    } else {
      console.log("✗ isOmiyaStation is false or undefined");
    }
  } else {
    console.log("✗ selectedStop is null");
  }
  
  console.log("📋 Final selectedTitles:", selectedTitles);

  // Desktop view
  return (
    <>
      {selectedStop?.isOmiyaStation && selectedTitles && selectedTitles.length > 0 && (
        <SelectedPlatformBuses titles={selectedTitles} />
      )}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-gray-900">OMIYA Bus Route</h1>
                  <p className="text-sm text-gray-500">
                    大宮駅バス案内システム
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">現在時刻</p>
                <p className="text-gray-900">
                  {currentTime.toLocaleTimeString("ja-JP", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Map and Search */}
            <div className="lg:col-span-2 space-y-6">
              <SearchPanel
                filterOmiya={filterOmiya}
                onFilterOmiyaChange={setFilterOmiya}
                filterOthers={filterOthers}
                onFilterOthersChange={setFilterOthers}
                filteredStops={filteredStops}
                allStops={busStops}
                onStopSelect={setSelectedStop}
              />

              <Card className="shadow-lg overflow-hidden border-0">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                  <h2 className="text-white text-lg font-medium">
                    大宮駅周辺 バス停マップ
                  </h2>
                  <p className="text-sm text-blue-100 mt-1">
                    バス停をクリックして詳細を表示
                  </p>
                </div>
                <div style={{ height: "600px" }}>
                  <BusStopMap
                    stops={filteredStops}
                    selectedStop={selectedStop}
                    onStopSelect={setSelectedStop}
                  />
                </div>
              </Card>
            </div>

            {/* Right Column - Route Info and Departures */}
            <div className="space-y-6">
              {selectedStop ? (
                <>
                  <RoutePanel
                    stop={selectedStop}
                    onClose={() => setSelectedStop(null)}
                  />
                  <DepartureBoard
                    stop={selectedStop}
                    currentTime={currentTime}
                  />
                </>
              ) : (
                <Card className="shadow-lg p-8 text-center border-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-gray-900 mb-2 font-medium">
                    バス停を選択してください
                  </h3>
                  <p className="text-sm text-gray-500">
                    地図上のバス停をクリックすると、行き先と時刻表が表示されます
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* Legend */}
          <Card className="mt-6 shadow-lg border-0">
            <CardContent className="p-4">
              <h3 className="text-gray-900 mb-3 font-medium">凡例</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                  <span className="text-sm text-gray-600">東口バス停</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                  <span className="text-sm text-gray-600">西口バス停</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-600"></div>
                  <span className="text-sm text-gray-600">東武バス</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-600"></div>
                  <span className="text-sm text-gray-600">降車専用</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
