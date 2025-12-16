document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map', {
    center: [35.907, 139.6239],
    zoom: 16,
    scrollWheelZoom: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Default to Omiya Station coordinates so routing works immediately
  let userLocation = [35.9069, 139.6235];
  let userLocationMarker = null;
  let routeLayer = null;

  const stationMarker = L.circleMarker([35.9069, 139.6235], {
    radius: 10,
    color: '#0d6efd',
    weight: 2,
    fillColor: '#0d6efd',
    fillOpacity: 0.4,
  })
    .addTo(map)
    .bindTooltip('大宮駅（現在地）', { permanent: true, direction: 'top', offset: [0, -10] });

  // Set station marker as user location marker
  userLocationMarker = stationMarker;

  const markerLayer = L.layerGroup().addTo(map);
  const stopMarkers = new Map();

  const filterEast = document.getElementById('filter-east');
  const filterWest = document.getElementById('filter-west');
  const stopSelect = document.getElementById('stop-select');
  const detailsElement = document.getElementById('stop-details');
  const mapContainer = document.querySelector('.map-container');

  let activeStopId = null;

  if (stopSelect) {
    stopSelect.disabled = true;
  }

  function createMarker(stop) {
    const marker = L.marker([stop.lat, stop.lng], {
      title: stop.name,
    });

    marker.bindPopup(
      `<strong>${stop.name}</strong><br />${stop.exit === 'east' ? '東口' : '西口'} ${stop.platform}番のりば`
    );

    marker.on('click', () => {
      selectStop(stop.id, { centerOnMap: false });
    });

    return marker;
  }

  function toMinutes(timeString) {
    const [hoursRaw, minutesRaw] = timeString.split(':');
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw);
    return hours * 60 + minutes;
  }

  function getNowInTokyo() {
    const now = new Date();
    const tokyoString = now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' });
    return new Date(tokyoString);
  }

  function getNextDeparture(stop) {
    const now = getNowInTokyo();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let best = null;

    stop.services.forEach((service) => {
      service.timetable.forEach((timeString) => {
        const totalMinutes = toMinutes(timeString);
        let diff = totalMinutes - nowMinutes;
        let isNextDay = false;

        if (diff < 0) {
          diff += 24 * 60;
          isNextDay = true;
        }

        if (!best || diff < best.diff) {
          best = {
            diff,
            isNextDay: isNextDay || totalMinutes >= 24 * 60,
            timeString,
            service,
          };
        }
      });
    });

    return best;
  }

  function describeDiff(minutes, isNextDay) {
    if (minutes <= 0) {
      return 'まもなく出発';
    }

    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    let text = '';

    if (hours > 0) {
      text += `${hours}時間`;
    }
    if (remainder > 0 || hours === 0) {
      text += `${remainder}分`;
    }
    text += '後';

    if (isNextDay) {
      text += '（翌日）';
    }

    return text;
  }

  function renderStopDetails(stop) {
    const next = getNextDeparture(stop);
    const isEast = stop.exit === 'east';
    const areaColorClass = isEast ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
    const badgeText = isEast ? '東口' : '西口';

    const serviceList = stop.services
      .map(
        (service) => `
        <div class="bg-gray-50 p-4 rounded-xl mb-3 border border-gray-100">
          <div class="flex items-start justify-between mb-2">
             <div>
                <span class="text-xs font-bold text-gray-500 block mb-0.5">${service.operator}</span>
                <h4 class="font-bold text-gray-900 text-base">${service.line} <span class="mx-1">→</span> ${service.destination}</h4>
             </div>
             <div class="text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-500">経由：${service.via}</div>
          </div>
          <div class="text-sm font-mono text-gray-700 mt-2 bg-white p-2 rounded border border-gray-100 leading-relaxed">
            ${service.timetable.join('<span class="text-gray-300 mx-2">/</span>')}
          </div>
        </div>
      `
      )
      .join('');

    const landmarks = stop.landmarks.length
      ? `<div class="mt-4 pt-4 border-t border-gray-100">
           <span class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">目印</span>
           <div class="flex flex-wrap gap-2 text-sm text-gray-600">
             ${stop.landmarks.map(l => `<span class="bg-gray-100 px-2 py-1 rounded">${l}</span>`).join('')}
           </div>
         </div>`
      : '';

    const nextDeparture = next
      ? `<div class="bg-gradient-to-r ${isEast ? 'from-blue-600 to-blue-500' : 'from-purple-600 to-purple-500'} text-white p-5 rounded-2xl shadow-lg mb-6 relative overflow-hidden">
           <div class="relative z-10">
             <div class="text-xs font-medium opacity-90 mb-1">次の出発</div>
             <div class="flex items-baseline gap-3">
               <span class="text-3xl font-bold tracking-tight">${describeDiff(next.diff, next.isNextDay)}</span>
               <span class="text-lg opacity-90 font-medium">(${next.timeString}発)</span>
             </div>
             <div class="mt-2 text-sm font-medium opacity-95 flex items-center gap-1">
               <i data-lucide="bus" class="w-4 h-4"></i>
               ${next.service.destination} 行き
             </div>
           </div>
           <div class="absolute right-[-10px] bottom-[-10px] opacity-10 rotate-[-15deg]">
              <i data-lucide="bus" class="w-24 h-24"></i>
           </div>
         </div>`
      : `<div class="bg-gray-100 text-gray-500 p-6 rounded-2xl text-center mb-6 border border-gray-200">
           <i data-lucide="moon" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
           <p class="font-medium">本日の運行は終了しました</p>
         </div>`;

    detailsElement.innerHTML = `
      <div class="animate-in fade-in duration-300 ease-out">
        <div class="flex justify-between items-start mb-6">
           <div>
              <h2 class="text-2xl font-bold text-gray-900 tracking-tight">${stop.name}</h2>
              <div class="flex gap-2 mt-2">
                 <span class="px-2.5 py-1 ${areaColorClass} text-xs rounded-lg font-bold flex items-center gap-1">
                    ${badgeText}
                 </span>
                 <span class="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-bold border border-gray-200">
                    ${stop.platform}番のりば
                 </span>
              </div>
           </div>
        </div>
        
        <p class="text-sm text-gray-600 mb-6 leading-relaxed">${stop.description}</p>
        
        ${nextDeparture}
        
        <h3 class="font-bold text-gray-900 mb-4 text-base flex items-center gap-2">
          <div class="w-1 h-5 bg-gray-900 rounded-full"></div>
          運行系統・時刻表
        </h3>
        <div>${serviceList}</div>
        
        ${landmarks}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  function clearSelection() {
    activeStopId = null;
    detailsElement.innerHTML = `
       <div class="bg-white rounded-xl shadow-lg p-8 text-center h-full flex flex-col justify-center items-center">
          <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
             <i data-lucide="map-pin" class="w-10 h-10 text-gray-300"></i>
          </div>
          <h3 class="text-gray-900 mb-2 font-bold text-lg">バス停を選択してください</h3>
          <p class="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">地図上のマーカーをクリックするか、一覧から選択すると詳細が表示されます</p>
       </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    if (stopSelect) {
      if (stopSelect.options.length > 0) {
        stopSelect.selectedIndex = 0;
      } else {
        stopSelect.value = '';
      }
    }
  }

  function selectStop(stopId, options = { centerOnMap: true }) {
    const stop = window.busStops.find((item) => item.id === stopId);
    if (!stop) return;

    const isVisible =
      (stop.exit === 'east' && filterEast.checked) ||
      (stop.exit === 'west' && filterWest.checked);

    if (!isVisible) {
      return;
    }

    activeStopId = stopId;

    if (stopSelect && stopSelect.value !== stopId) {
      stopSelect.value = stopId;
    }

    const marker = stopMarkers.get(stopId);
    if (marker) {
      marker.openPopup();
      if (options.centerOnMap) {
        map.flyTo([stop.lat, stop.lng], 17, { animate: true, duration: 0.8 });
      }
    }

    renderStopDetails(stop);
    updateRoute();
  }

  function updateFilters() {
    const showEast = filterEast.checked;
    const showWest = filterWest.checked;

    window.busStops.forEach((stop) => {
      const shouldShow = stop.exit === 'east' ? showEast : showWest;
      const marker = stopMarkers.get(stop.id);

      if (marker) {
        const hasLayer = markerLayer.hasLayer(marker);
        if (shouldShow && !hasLayer) {
          marker.addTo(markerLayer);
        } else if (!shouldShow && hasLayer) {
          markerLayer.removeLayer(marker);
        }
      }
    });

    if (activeStopId) {
      const activeStop = window.busStops.find((stop) => stop.id === activeStopId);
      if (activeStop) {
        const stillVisible =
          (activeStop.exit === 'east' && showEast) || (activeStop.exit === 'west' && showWest);
        if (!stillVisible) {
          clearSelection();
        }
      }
    }

    renderStopOptions();
  }

  function renderStopOptions() {
    if (!stopSelect) return;

    const showEast = filterEast.checked;
    const showWest = filterWest.checked;
    const previousValue = stopSelect.value;

    stopSelect.innerHTML = '';

    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'のりばを選択してください';
    placeholderOption.disabled = true;
    stopSelect.appendChild(placeholderOption);

    const appendGroup = (exit, label) => {
      const group = document.createElement('optgroup');
      group.label = label;

      window.busStops
        .filter((stop) => stop.exit === exit)
        .forEach((stop) => {
          const option = document.createElement('option');
          option.value = stop.id;
          option.textContent = stop.name;
          group.appendChild(option);
        });

      if (group.children.length > 0) {
        stopSelect.appendChild(group);
      }
    };

    if (showEast) {
      appendGroup('east', '東口');
    }
    if (showWest) {
      appendGroup('west', '西口');
    }

    const activeOption = activeStopId
      ? stopSelect.querySelector(`option[value="${activeStopId}"]`)
      : null;

    if (activeOption) {
      activeOption.selected = true;
    } else if (previousValue) {
      const previousOption = stopSelect.querySelector(`option[value="${previousValue}"]`);
      if (previousOption) {
        previousOption.selected = true;
      } else {
        placeholderOption.selected = true;
      }
    } else {
      placeholderOption.selected = true;
    }

    const selectableOptions = stopSelect.querySelectorAll('option[value]:not([value=""])');
    const hasSelectableOptions = selectableOptions.length > 0;

    stopSelect.disabled = !hasSelectableOptions;

    if (!hasSelectableOptions) {
      stopSelect.value = '';
      placeholderOption.disabled = false;
      placeholderOption.textContent = '表示できるのりばがありません';
    } else {
      placeholderOption.disabled = true;
      placeholderOption.textContent = 'のりばを選択してください';
    }
  }

  function renderMarkers() {
    window.busStops.forEach((stop) => {
      const marker = createMarker(stop);
      stopMarkers.set(stop.id, marker);
      marker.addTo(markerLayer);
    });
  }

  if (stopSelect) {
    stopSelect.addEventListener('change', (event) => {
      const { value } = event.target;
      if (value) {
        selectStop(value, { centerOnMap: true });
      }
    });
  }

  filterEast.addEventListener('change', updateFilters);
  filterWest.addEventListener('change', updateFilters);

  renderMarkers();
  updateFilters();

  if (window.busStops && window.busStops.length > 0) {
    selectStop(window.busStops[0].id, { centerOnMap: false });
  }

  setInterval(() => {
    if (!activeStopId) return;
    const stop = window.busStops.find((item) => item.id === activeStopId);
    if (!stop) return;
    renderStopDetails(stop);
  }, 60000);

  map.whenReady(() => {
    map.invalidateSize();
  });

  window.addEventListener('resize', () => {
    map.invalidateSize();
  });

  if (mapContainer && 'ResizeObserver' in window) {
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(mapContainer);
  }

  /* =========================================
     Geolocation & Routing Logic
     ========================================= */

  const getLocationBtn = document.getElementById('get-location-btn');
  const locationStatus = document.getElementById('location-status');

  function updateRoute() {
    // If no user location or no active stop, remove existing route
    if (!userLocation || !activeStopId) {
      if (routeLayer) {
        map.removeLayer(routeLayer);
        routeLayer = null;
      }
      return;
    }

    const stop = window.busStops.find((s) => s.id === activeStopId);
    if (!stop) return;

    // Remove old route layer
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    // Get walking route using OpenRouteService API
    const startLng = userLocation[1];
    const startLat = userLocation[0];
    const endLng = stop.lng;
    const endLat = stop.lat;

    // OpenStreetMap routing service for walking routes
    // Get multiple alternatives and choose the shortest one
    const url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&alternatives=true`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          // Find the shortest route by distance
          let shortestRoute = data.routes[0];
          let shortestDistance = shortestRoute.distance;

          for (let i = 1; i < data.routes.length; i++) {
            if (data.routes[i].distance < shortestDistance) {
              shortestRoute = data.routes[i];
              shortestDistance = data.routes[i].distance;
            }
          }

          const coordinates = shortestRoute.geometry.coordinates.map(coord => [coord[1], coord[0]]); // Convert [lng, lat] to [lat, lng]

          routeLayer = L.polyline(coordinates, {
            color: '#ef4444',
            weight: 6,
            opacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          // Fit map to route bounds
          map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
        } else {
          console.warn('Route not found, using straight line');
          // Fallback to straight line if routing fails
          routeLayer = L.polyline([[startLat, startLng], [endLat, endLng]], {
            color: '#ef4444',
            weight: 6,
            opacity: 0.8,
            dashArray: '10, 5'
          }).addTo(map);
        }
      })
      .catch(error => {
        console.error('Routing error:', error);
        // Fallback to straight line on error
        routeLayer = L.polyline([[startLat, startLng], [endLat, endLng]], {
          color: '#ef4444',
          weight: 6,
          opacity: 0.8,
          dashArray: '10, 5'
        }).addTo(map);
      });
  }

  if (getLocationBtn) {
    getLocationBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert('お使いのブラウザは位置情報をサポートしていません。');
        return;
      }

      const statusEl = document.getElementById('location-status');
      if (statusEl) {
        statusEl.textContent = '取得中...';
        statusEl.classList.remove('hidden');
      }

      getLocationBtn.disabled = true;
      getLocationBtn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> 取得中...';
      lucide.createIcons();

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          userLocation = [latitude, longitude];

          // Update Button
          getLocationBtn.disabled = false;
          getLocationBtn.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4"></i> 位置情報を更新';
          if (statusEl) {
            statusEl.classList.add('hidden');
          }
          lucide.createIcons();

          // Add/Update User Marker
          if (userLocationMarker) {
            userLocationMarker.setLatLng(userLocation);
          } else {
            userLocationMarker = L.circleMarker(userLocation, {
              radius: 8,
              fillColor: '#3b82f6',
              color: '#fff',
              weight: 2,
              opacity: 1,
              fillOpacity: 1
            }).addTo(map);
            userLocationMarker.bindPopup('現在地').openPopup();
          }

          // Center map
          map.setView(userLocation, 16);

          // If a stop is already selected, draw route
          if (activeStopId) {
            updateRoute();
          } else {
            alert('地図上のバス停を選択すると、現在地からのルートが表示されます。');
          }
        },
        (error) => {
          console.error(error);
          alert('位置情報の取得に失敗しました。');
          getLocationBtn.disabled = false;
          getLocationBtn.innerHTML = '<i data-lucide="navigation" class="w-4 h-4"></i> 現在地からルートを表示';
          lucide.createIcons();
          if (statusEl) statusEl.classList.add('hidden');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  // Hook into existing selectStop to update route when stop changes
  // We need to monkey-patch or modify the original selectStop?
  // Since we are inside the same closure, we can just modify the original selectStop function logic?
  // No, `selectStop` is defined above. We can't modify it easily without rewriting it.
  // However, `click` events call `selectStop`.
  // AND `stopSelect` change calls `selectStop`.
  // I should essentially rewrite `selectStop` or wrap it?
  // `selectStop` is a local function inside DOMContentLoaded. I cannot overwrite it from "outside" easily, but I am modifying the file in-place.

  // Actually, I can just modify `selectStop` definition in the file to call `updateRoute()` at the end.
  // But to avoid complex multi-edits, I'll just accept that I need to edit `selectStop` separately or try to catch the event.
  // Or I can rewrite the `selectStop` function in the previous block if I use `multi_replace`.

  // Let's stick to adding code at the end, but wait... if `selectStop` doesn't call `updateRoute`, the route won't update when I click a NEW stop.
  // The route only updates when I click the "Location" button.
  // That's partial functionality.

  // Better approach: Use `multi_replace` to:
  // 1. Add the variables and helper functions at the top or bottom.
  // 2. Modify `selectStop` to call `updateRoute()`.


});
