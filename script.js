
import { busStops, routes, getDepartures, getBusStopById, getRouteById } from './data.js';

// Global State
let state = {
    selectedStop: null,
    searchQuery: '',
    isMobile: window.innerWidth < 1024,
    map: null,
    markers: new Map(),
    drawerHeight: 'collapsed', // 'collapsed', 'peek', 'half', 'full'
    expandedRoutes: new Set(), // For RoutePanel
    currentTime: new Date()
};

// Map Instance holder (since we only show one map at a time, but they have different containers)
let mapInstance = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    setupEventListeners();
    checkMobile(); // Initial check
    startClock();

    // Initial render handled by checkMobile -> initMap
});

// Window Resize Handler
window.addEventListener('resize', () => {
    const isMobileNow = window.innerWidth < 1024;
    if (state.isMobile !== isMobileNow) {
        state.isMobile = isMobileNow;
        checkMobile(); // Re-initialize map on view switch
    } else {
        // Just invalidate size if resizing within same view
        if (mapInstance) mapInstance.invalidateSize();
    }
});

function checkMobile() {
    const desktopView = document.getElementById('desktop-view');
    const mobileView = document.getElementById('mobile-view');

    if (state.isMobile) {
        desktopView.style.display = 'none';
        mobileView.style.display = 'flex'; // Use flex for layout
        initMap('map-mobile');
        renderMobileSearch(); // Initial render state
    } else {
        desktopView.style.display = 'block';
        mobileView.style.display = 'none';
        initMap('map-desktop');
        renderDesktopSearch();
        renderDesktopSidePanel();
    }
}

// ==========================================
// MAP LOGIC
// ==========================================
function initMap(containerId) {
    if (mapInstance) {
        mapInstance.remove();
        state.markers.clear();
    }

    // Create map centered on Omiya Station
    mapInstance = L.map(containerId, {
        center: [35.9065, 139.624],
        zoom: 16,
        zoomControl: !state.isMobile, // Hide zoom control on mobile for space
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
    }).addTo(mapInstance);

    // Add station marker (Omiya Station Center)
    const stationIcon = L.divIcon({
        className: 'station-marker',
        html: `
      <div style="
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #1e40af 0%, #4f46e5 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">
        <div style="color: white; font-weight: bold; font-size: 12px; text-align: center; line-height: 1.2;">
          JR<br/>大宮
        </div>
      </div>
    `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
    });

    L.marker([35.9065, 139.624], { icon: stationIcon })
        .addTo(mapInstance)
        .bindPopup('<strong>JR大宮駅</strong><br/>Omiya Station');

    // Add bus stop markers
    renderMarkers();
}

function renderMarkers() {
    if (!mapInstance) return;

    // Filter stops based on search
    const filteredStops = filterStops(state.searchQuery);

    // Remove markers not in filtered list
    state.markers.forEach((marker, id) => {
        if (!filteredStops.find(s => s.id === id)) {
            mapInstance.removeLayer(marker);
            state.markers.delete(id);
        }
    });

    // Add/Update markers
    filteredStops.forEach(stop => {
        let marker = state.markers.get(stop.id);

        // Determine styles
        const isSelected = state.selectedStop?.id === stop.id;
        const areaColor = stop.area === 'east' ? '#2563eb' : stop.area === 'west' ? '#9333ea' : '#8b5cf6';
        const operatorColor =
            stop.operator === 'tobu' ? '#00A040' :
                stop.operator === 'seibu' ? '#FFD700' :
                    '#E60012';

        // HTML for marker
        const markerHtml = `
      <div style="position: relative;">
        ${isSelected ? `
          <div style="
            position: absolute;
            width: 56px;
            height: 56px;
            background: ${areaColor};
            border-radius: 50%;
            animation: pulse 1.5s ease-out infinite;
            opacity: 0.75;
            top: -8px;
            left: -8px;
          "></div>
        ` : ''}
        <div style="
          width: ${isSelected ? '40px' : (stop.isDropOffOnly ? '40px' : '32px')};
          height: ${isSelected ? '40px' : (stop.isDropOffOnly ? '40px' : '32px')};
          background: ${stop.isDropOffOnly ? '#f97316' : areaColor};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 ${isSelected ? '6px 20px' : '4px 12px'} rgba(0,0,0,0.4);
          border: ${isSelected || stop.isDropOffOnly ? '4px' : '3px'} solid white;
          cursor: ${stop.isDropOffOnly ? 'not-allowed' : 'pointer'};
          transition: all 0.3s ease;
          position: relative;
          z-index: ${isSelected ? '1000' : '1'};
        ">
          ${stop.isDropOffOnly ?
                '<div style="width: 24px; height: 3px; background: white; transform: rotate(45deg); border-radius: 2px;"></div>' :
                `<div style="width: ${isSelected ? '12px' : '10px'}; height: ${isSelected ? '12px' : '10px'}; background: white; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.2);"></div>`
            }
        </div>
        ${!stop.isDropOffOnly ? `
          <div style="
            position: absolute;
            top: ${isSelected ? '-2px' : '-3px'};
            right: ${isSelected ? '-2px' : '-3px'};
            width: ${isSelected ? '18px' : '14px'};
            height: ${isSelected ? '18px' : '14px'};
            background: ${operatorColor};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
        ` : ''}
      </div>
    `;

        const icon = L.divIcon({
            className: 'bus-stop-marker',
            html: markerHtml,
            iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
            iconAnchor: [isSelected ? 20 : 16, isSelected ? 20 : 16],
            popupAnchor: [0, isSelected ? -20 : -16],
        });

        if (marker) {
            marker.setIcon(icon);
            marker.setZIndexOffset(isSelected ? 1000 : 0);
        } else {
            marker = L.marker([stop.coordinates.lat, stop.coordinates.lng], {
                icon: icon,
                title: stop.name,
            });

            // Simple popup
            const popupContent = `
        <div style="min-width: 200px; font-family: ui-sans-serif, system-ui, sans-serif;">
          <strong style="font-size: 14px; display: block; margin-bottom: 4px;">${stop.name}</strong>
          <div style="font-size: 11px; color: #666; margin-bottom: 4px;">
            ${stop.area === 'east' ? '東口' : '西口'}
          </div>
          ${stop.isDropOffOnly ?
                    '<div style="color: #f97316; font-size: 12px;">降車専用</div>' :
                    stop.destinations.length > 0 ?
                        `<div style="font-size: 12px; color: #555;">
                ${stop.destinations.slice(0, 2).join(' / ')}
                ${stop.destinations.length > 2 ? ' 他' : ''}
              </div>` :
                        ''
                }
        </div>
      `;
            marker.bindPopup(popupContent);

            if (!stop.isDropOffOnly) {
                marker.on('click', () => {
                    handleStopSelect(stop);
                });
            }

            marker.addTo(mapInstance);
            state.markers.set(stop.id, marker);
        }
    });
}

function filterStops(query) {
    if (!query) return busStops;
    const q = query.toLowerCase();
    return busStops.filter(stop =>
        stop.name.includes(q) ||
        stop.destinations.some(dest => dest.includes(q))
    );
}

// ==========================================
// ACTIONS
// ==========================================
function handleStopSelect(stop) {
    state.selectedStop = stop;
    state.expandedRoutes.clear(); // Reset expanded routes

    // Update UI
    renderMarkers(); // To update selection pulse

    if (state.isMobile) {
        updateMobileDrawer('peek');
    } else {
        renderDesktopSidePanel();
    }
}

function handleSearch(query) {
    state.searchQuery = query;
    renderMarkers(); // Map update

    if (state.isMobile) {
        renderMobileSearchResults();
    } else {
        renderDesktopSearchResults();
    }
}

// ==========================================
// UI RENDERING - DESKTOP
// ==========================================
function renderDesktopSearch() {
    const input = document.getElementById('desktop-search-input');
    const clearBtn = document.getElementById('desktop-search-clear');

    // Set value without triggering new search
    if (input.value !== state.searchQuery) {
        input.value = state.searchQuery;
    }

    if (state.searchQuery) {
        clearBtn.classList.remove('hidden');
        renderDesktopSearchResults();
    } else {
        clearBtn.classList.add('hidden');
        document.getElementById('desktop-search-results').classList.add('hidden');
        document.getElementById('desktop-quick-stats').classList.remove('hidden');
    }
}

function renderDesktopSearchResults() {
    const resultsContainer = document.getElementById('desktop-search-results');
    const statsContainer = document.getElementById('desktop-quick-stats');

    if (!state.searchQuery) {
        resultsContainer.classList.add('hidden');
        statsContainer.classList.remove('hidden');
        return;
    }

    statsContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');

    const filtered = filterStops(state.searchQuery);
    if (filtered.length === 0) {
        resultsContainer.innerHTML = `
      <div class="p-8 text-center text-gray-500">
        <i data-lucide="search" class="w-12 h-12 text-gray-300 mx-auto mb-2"></i>
        <p>検索結果が見つかりませんでした</p>
      </div>
    `;
        lucide.createIcons();
        return;
    }

    resultsContainer.innerHTML = `
    <div class="divide-y divide-gray-100">
      ${filtered.map(stop => {
        const areaLabel = stop.area === 'east' ? '東口' : '西口';
        const areaColor = stop.area === 'east' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
        const operatorName = stop.operator === 'tobu' ? '東武' : stop.operator === 'seibu' ? '西武' : '国際興業';

        return `
          <button
            onclick="window.selectStop('${stop.id}')"
            class="w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 ${stop.isDropOffOnly ? 'opacity-50 cursor-not-allowed' : ''}"
            ${stop.isDropOffOnly ? 'disabled' : ''}
          >
            <div class="mt-1">
              <i data-lucide="map-pin" class="w-5 h-5 ${stop.area === 'east' ? 'text-blue-600' : 'text-purple-600'}"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h4 class="text-gray-900">${stop.name}</h4>
                <span class="px-2 py-0.5 ${areaColor} text-xs rounded">${areaLabel}</span>
                <span class="text-xs text-gray-500">${operatorName}</span>
                ${stop.isDropOffOnly ? '<span class="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">降車専用</span>' : ''}
              </div>
              ${!stop.isDropOffOnly && stop.destinations.length > 0 ?
                `<p class="text-sm text-gray-500 truncate">${stop.destinations.slice(0, 3).join(' / ')}${stop.destinations.length > 3 ? ' 他' : ''}</p>`
                : ''}
            </div>
          </button>
        `;
    }).join('')}
    </div>
  `;
    lucide.createIcons();
}

// Window level wrapper for onclick events in HTML strings
window.selectStop = (stopId) => {
    const stop = getBusStopById(stopId);
    if (stop && !stop.isDropOffOnly) {
        handleStopSelect(stop);
        // Clear search if desktop
        if (!state.isMobile) {
            handleSearch(''); // Reset search
            renderDesktopSearch();
        }
    }
};

function renderDesktopSidePanel() {
    const defaultMsg = document.getElementById('desktop-default-msg');
    const selectedContent = document.getElementById('desktop-selected-content');
    const routePanel = document.getElementById('desktop-route-panel');
    const departureBoard = document.getElementById('desktop-departure-board');

    if (!state.selectedStop) {
        defaultMsg.classList.remove('hidden');
        selectedContent.classList.add('hidden');
        return;
    }

    defaultMsg.classList.add('hidden');
    selectedContent.classList.remove('hidden');

    // Render Route Panel content
    routePanel.innerHTML = generateRoutePanelHTML(state.selectedStop);

    // Render Departure Board content
    departureBoard.innerHTML = generateDepartureBoardHTML(state.selectedStop);

    lucide.createIcons();
}

// ==========================================
// COMPONENT HTML GENERATORS
// ==========================================
function generateRoutePanelHTML(stop) {
    if (stop.isDropOffOnly) {
        return `
      <div class="bg-white rounded-2xl overflow-hidden p-10 text-center">
        <div class="w-20 h-20 bg-orange-100 border-2 border-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
          </svg>
        </div>
        <h3 class="text-lg text-gray-900 mb-2 font-semibold">降車専用バス停</h3>
        <p class="text-sm text-gray-600">このバス停からは乗車できません</p>
      </div>
    `;
    }

    if (stop.routes.length === 0) return '';

    return `
    <div class="bg-white rounded-2xl overflow-hidden p-4">
      <h3 class="text-gray-900 mb-3 flex items-center gap-2 font-semibold">
        <div class="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
          <i data-lucide="bus" class="w-5 h-5 text-white"></i>
        </div>
        運行系統
      </h3>
      <div class="space-y-3">
        ${stop.routes.map(routeId => {
        const route = getRouteById(routeId);
        if (!route) return '';
        const isExpanded = state.expandedRoutes.has(routeId);

        return `
            <div class="space-y-2">
              <div class="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <div class="px-3 py-2 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0" style="background-color: ${route.color}">
                  ${route.name}
                </div>
                <div class="flex-1 text-left">
                  <span class="text-sm text-gray-700 font-medium block">${route.name}</span>
                  ${route.description ? `<span class="text-xs text-gray-500">${route.description}</span>` : ''}
                </div>
                <button onclick="window.toggleRoute('${routeId}')" class="flex-shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-all active:scale-95 font-medium">
                  途中の停留所
                </button>
              </div>
              ${isExpanded ? `
                <div class="ml-3 animate-slide-in">
                  ${generateRouteStopsList(route, stop.id)}
                </div>
              ` : ''}
            </div>
          `;
    }).join('')}
      </div>
    </div>
  `;
}

// Global handler for toggling route
window.toggleRoute = (routeId) => {
    if (state.expandedRoutes.has(routeId)) {
        state.expandedRoutes.delete(routeId);
    } else {
        state.expandedRoutes.add(routeId);
    }
    // Re-render
    if (state.isMobile) {
        renderMobileDrawerContent();
    } else {
        renderDesktopSidePanel();
    }
};

function generateRouteStopsList(route, currentStopId) {
    const currentIndex = route.stops.indexOf(currentStopId);
    const stopsToShow = route.stops.slice(currentIndex);

    return `
    <div class="border-l-2 border-gray-200 pl-4 py-2 space-y-4 relative">
      ${stopsToShow.map((stopId, index) => {
        const stop = getBusStopById(stopId);
        if (!stop) return '';
        const isCurrent = index === 0;
        const isLast = index === stopsToShow.length - 1;

        return `
          <div class="relative flex items-center gap-3">
            <div class="
              w-3 h-3 rounded-full border-2 border-white shadow-sm flex-shrink-0 relative z-10
              ${isCurrent ? 'bg-blue-600 ring-2 ring-blue-100 w-4 h-4' : 'bg-gray-300'}
            "></div>
            <div class="min-w-0">
              <p class="text-sm ${isCurrent ? 'font-bold text-gray-900' : 'text-gray-600'}">
                ${stop.name}
              </p>
            </div>
          </div>
        `;
    }).join('')}
    </div>
  `;
}

function generateDepartureBoardHTML(stop) {
    const departures = getDepartures(stop.id, state.currentTime);
    if (stop.isDropOffOnly || departures.length === 0) {
        if (stop.isDropOffOnly) return '';
        return `
      <div class="bg-white rounded-2xl overflow-hidden p-10 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <i data-lucide="clock" class="w-8 h-8 text-gray-400"></i>
        </div>
        <p class="text-gray-900 font-medium mb-1">発車予定なし</p>
        <p class="text-sm text-gray-500">現在、発車予定のバスはありません</p>
      </div>
    `;
    }

    const nextDeparture = departures[0];

    return `
    <div class="bg-white rounded-2xl overflow-hidden">
      <!-- Header -->
      <div class="mb-4 pt-4 px-4">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <i data-lucide="clock" class="w-5 h-5 text-white"></i>
          </div>
          <h2 class="text-lg text-gray-900 font-semibold">発車時刻</h2>
        </div>
      </div>

      <!-- Next Departure -->
      <div class="px-4">
        <div class="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
          <div class="flex items-center gap-2 mb-3">
            <i data-lucide="radio" class="w-4 h-4 text-white animate-pulse"></i>
            <span class="text-xs text-white font-semibold uppercase tracking-wide">次の発車</span>
          </div>
          <div class="flex items-baseline gap-3 mb-3">
            <span class="text-4xl text-white font-bold">${nextDeparture.departureTime}</span>
            ${nextDeparture.delay ? `
              <div class="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <i data-lucide="trending-up" class="w-4 h-4 text-white"></i>
                <span class="text-sm text-white font-semibold">+${nextDeparture.delay}分</span>
              </div>
            ` : ''}
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1.5 bg-white text-blue-600 text-sm font-semibold rounded-lg">
              ${nextDeparture.routeName}
            </span>
            <span class="text-sm text-white font-medium">${nextDeparture.destination}</span>
          </div>
        </div>
      </div>

      <!-- List -->
      <div class="max-h-64 overflow-y-auto px-4 pb-4">
        <div class="divide-y divide-gray-100 border-2 border-gray-200 rounded-2xl overflow-hidden">
          ${departures.slice(1).map(dep => `
            <div class="p-4 hover:bg-blue-50 transition-colors flex items-center justify-between">
              <div class="flex items-center gap-4 flex-1">
                <span class="text-xl text-gray-900 font-semibold w-16">${dep.departureTime}</span>
                <span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">${dep.routeName}</span>
                <span class="text-sm text-gray-700 flex-1 truncate font-medium">${dep.destination}</span>
              </div>
              ${dep.delay ? `
                <span class="text-sm text-orange-600 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg font-semibold">
                  <i data-lucide="trending-up" class="w-3 h-3"></i>+${dep.delay}
                </span>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Footer -->
       <div class="p-4">
          <div class="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
            <div class="flex items-center gap-2 text-sm text-blue-700">
              <i data-lucide="radio" class="w-4 h-4"></i>
              <span class="font-medium">リアルタイム情報は参考値です</span>
            </div>
          </div>
       </div>
    </div>
  `;
}

// ==========================================
// UI RENDERING - MOBILE
// ==========================================
function renderMobileSearch() {
    const collapsed = document.getElementById('mobile-search-collapsed');
    const expanded = document.getElementById('mobile-search-expanded');
    const results = document.getElementById('mobile-search-results');

    // Logic mostly checking state implicitly via visibility
}

function renderMobileSearchResults() {
    const filtered = filterStops(state.searchQuery);
    const container = document.getElementById('mobile-search-results');

    if (!state.searchQuery) {
        container.innerHTML = '';
        return;
    }

    if (filtered.length === 0) {
        container.innerHTML = `
      <div class="p-10 text-center text-gray-500">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <i data-lucide="search" class="w-8 h-8 text-gray-400"></i>
        </div>
        <p class="text-gray-900 mb-1">検索結果が見つかりません</p>
        <p class="text-sm text-gray-500">別のキーワードをお試しください</p>
      </div>
    `;
    } else {
        container.innerHTML = `
      <div class="divide-y divide-gray-100">
        ${filtered.map(stop => {
            const areaLabel = stop.area === 'east' ? '東口' : '西口';
            const areaColor = stop.area === 'east' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white';

            return `
            <button
              onclick="window.selectStopMobile('${stop.id}')"
              class="w-full p-4 text-left transition-colors ${stop.isDropOffOnly ? 'opacity-50' : 'hover:bg-blue-50 active:bg-blue-100'}"
              ${stop.isDropOffOnly ? 'disabled' : ''}
            >
              <div class="flex items-center gap-2 mb-2">
                <span class="text-gray-900 font-medium">${stop.name}</span>
                <span class="px-2.5 py-1 ${areaColor} text-xs rounded-full font-medium">${areaLabel}</span>
                ${stop.isDropOffOnly ? '<span class="px-2.5 py-1 bg-orange-500 text-white text-xs rounded-full font-medium">降車専用</span>' : ''}
              </div>
              ${!stop.isDropOffOnly && stop.destinations.length > 0 ?
                    `<p class="text-sm text-gray-600 line-clamp-1">${stop.destinations.slice(0, 3).join(' • ')}</p>`
                    : ''}
            </button>
          `;
        }).join('')}
      </div>
    `;
    }
    lucide.createIcons();
}

window.selectStopMobile = (stopId) => {
    const stop = getBusStopById(stopId);
    if (stop) {
        handleStopSelect(stop);
        toggleMobileSearch(false);
    }
}

function updateMobileDrawer(height) { // height: 'collapsed' | 'peek' | 'half' | 'full'
    state.drawerHeight = height;
    const drawer = document.getElementById('mobile-drawer');

    let transform = 'translateY(100%)';
    if (height === 'peek') transform = 'translateY(calc(100% - 280px))';
    if (height === 'half') transform = 'translateY(50%)';
    if (height === 'full') transform = 'translateY(0)';

    drawer.style.transform = transform;

    if (state.selectedStop) {
        renderMobileDrawerContent();
    }
}

function renderMobileDrawerContent() {
    const stop = state.selectedStop;
    const header = document.getElementById('mobile-drawer-header');
    const body = document.getElementById('mobile-drawer-body');
    const stopContent = document.getElementById('mobile-stop-content');
    const infoContent = document.getElementById('mobile-info-content');

    const title = document.getElementById('mobile-drawer-title');
    const badges = document.getElementById('mobile-drawer-badges');

    if (!stop) {
        header.classList.add('hidden');
        stopContent.classList.add('hidden');
        infoContent.classList.remove('hidden');
        return;
    }

    header.classList.remove('hidden');
    infoContent.classList.add('hidden');
    stopContent.classList.remove('hidden');

    title.innerText = stop.name;

    const areaClass = stop.area === 'east'
        ? 'bg-blue-500 text-white'
        : stop.area === 'west'
            ? 'bg-purple-500 text-white'
            : 'bg-gray-500 text-white';

    badges.innerHTML = `
    ${stop.isOmiyaStation ? `<span class="px-3 py-1.5 text-sm rounded-full font-medium ${areaClass}">${stop.area === 'east' ? '東口' : stop.area === 'west' ? '西口' : '駅'}</span>` : ''}
    <span class="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
      ${stop.operator === 'tobu' ? '東武バス' : stop.operator === 'seibu' ? '西武バス' : '国際興業バス'}
    </span>
  `;

    // Content Population
    let contentHTML = '';

    if (stop.isOmiyaStation) {
        // Quick Info
        contentHTML += `
      <div class="bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
        <h3 class="text-gray-900 mb-3 flex items-center gap-2 font-semibold">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          主な行き先
        </h3>
        ${stop.destinations.length > 0 ? `
          <div class="space-y-2">
            ${stop.destinations.map((dest, idx) => `
              <div class="text-sm text-gray-700 flex items-center gap-3 bg-white rounded-xl p-3">
                <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-xs text-white font-semibold">${idx + 1}</span>
                </div>
                <span class="font-medium">${dest}</span>
              </div>
            `).join('')}
          </div>
        ` : '<p class="text-sm text-gray-500 bg-white rounded-xl p-4 text-center">情報がありません</p>'}
      </div>
      
      <div class="bg-white">
        ${generateRoutePanelHTML(stop)}
      </div>
      
      <div class="bg-white">
        ${generateDepartureBoardHTML(stop)}
      </div>
    `;
    } else {
        // Not Omiya Station
        contentHTML += `
      <div class="bg-gradient-to-br from-purple-50 via-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-100">
         <h3 class="text-gray-900 mb-3 flex items-center gap-2 font-semibold">
            <div class="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <i data-lucide="navigation" class="w-5 h-5 text-white"></i>
            </div>
            通過する路線
         </h3>
         ${stop.routes.length > 0 ? `
            <div class="space-y-2">
               ${stop.routes.map(routeId => {
            const route = getRouteById(routeId);
            if (!route) return '';
            return `
                    <div class="bg-white rounded-xl p-3">
                      <div class="flex items-center gap-3">
                         <div class="px-3 py-2 rounded-lg text-white text-sm font-bold shadow-md" style="background-color: ${route.color}">
                           ${route.name}
                         </div>
                         <span class="text-sm text-gray-700 font-medium flex-1">${route.description}</span>
                      </div>
                    </div>
                 `;
        }).join('')}
            </div>
         ` : ''}
      </div>
     `;
        // Also show route lists if any
        stop.routes.forEach(routeId => {
            const route = getRouteById(routeId);
            if (route) {
                contentHTML += generateRouteStopsList(route, stop.id);
            }
        });
    }

    stopContent.innerHTML = contentHTML;
    lucide.createIcons();
}

function toggleMobileSearch(show) {
    const collapsed = document.getElementById('mobile-search-collapsed');
    const expanded = document.getElementById('mobile-search-expanded');
    const results = document.getElementById('mobile-search-results');
    const input = document.getElementById('mobile-search-input');

    if (show) {
        collapsed.classList.add('hidden');
        expanded.classList.remove('hidden');
        results.classList.remove('hidden');
        input.focus();
        updateMobileDrawer('collapsed');
    } else {
        collapsed.classList.remove('hidden');
        expanded.classList.add('hidden');
        results.classList.add('hidden');
        input.value = '';
        handleSearch('');
    }
}

// ==========================================
// UTIL
// ==========================================
function startClock() {
    const update = () => {
        state.currentTime = new Date();
        const timeStr = state.currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        document.querySelectorAll('.time-display').forEach(el => el.textContent = timeStr);

        // Update live departures if panel is open
        if (state.selectedStop) {
            if (state.isMobile) renderMobileDrawerContent();
            else renderDesktopSidePanel();
        }
    };

    setInterval(update, 60000);
    update();
}

function setupEventListeners() {
    // Desktop Search
    const dInput = document.getElementById('desktop-search-input');
    dInput.addEventListener('input', (e) => handleSearch(e.target.value));
    document.getElementById('desktop-search-clear').addEventListener('click', () => {
        dInput.value = '';
        handleSearch('');
        document.getElementById('desktop-search-input').focus();
    });

    // Mobile Search
    document.getElementById('mobile-search-btn').addEventListener('click', () => toggleMobileSearch(true));
    document.getElementById('mobile-search-close-btn').addEventListener('click', () => toggleMobileSearch(false));
    document.getElementById('mobile-search-input').addEventListener('input', (e) => handleSearch(e.target.value));

    // Mobile Drawer Drag Logic
    const handle = document.getElementById('mobile-drawer-handle');
    const drawer = document.getElementById('mobile-drawer');
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    drawer.addEventListener('touchstart', (e) => {
        // Only drag from handle or top area
        if (e.target.closest('#mobile-drawer-handle') || e.target === drawer) {
            startY = e.touches[0].clientY;
            isDragging = true;
        }
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;

        const diff = startY - currentY;

        if (Math.abs(diff) > 50) {
            if (diff > 0) { // Dragged up
                if (state.drawerHeight === 'peek') updateMobileDrawer('half');
                else if (state.drawerHeight === 'half') updateMobileDrawer('full');
            } else { // Dragged down
                if (state.drawerHeight === 'full') updateMobileDrawer('half');
                else if (state.drawerHeight === 'half') updateMobileDrawer('peek');
                else if (state.drawerHeight === 'peek') {
                    updateMobileDrawer('collapsed');
                    state.selectedStop = null;
                }
            }
        }
        startY = 0;
        currentY = 0;
    });

    // Mobile Info Button
    document.getElementById('mobile-info-btn').addEventListener('click', () => {
        state.selectedStop = null;
        renderMobileDrawerContent();
        updateMobileDrawer('half');
    });

    // Drawer close btn
    document.getElementById('mobile-drawer-close-btn').addEventListener('click', () => {
        updateMobileDrawer('collapsed');
        state.selectedStop = null;
        renderMarkers();
    });
}
