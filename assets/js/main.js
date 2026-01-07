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
  const filterEastMobile = document.getElementById('filter-east-mobile');
  const filterWestMobile = document.getElementById('filter-west-mobile');
  const stopSelect = document.getElementById('stop-select');
  const detailsElement = document.getElementById('stop-details');
  const mobileDetailsElement = document.getElementById('mobile-stop-details');
  const mobileDetailPanel = document.getElementById('mobile-detail-panel');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const mobileCloseBtn = document.getElementById('mobile-close-btn');
  const mapContainer = document.querySelector('.map-container');

  let activeStopId = null;
  let isMobile = window.innerWidth < 1024;

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
        (service, index) => {
          const hasIntermediateStops = service.intermediateStops && service.intermediateStops.length > 0;
          const stopsId = `stops-${stop.id}-${index}`;
          const buttonId = `stops-btn-${stop.id}-${index}`;
          
          return `
        <div class="bg-gray-50 p-4 rounded-xl mb-3 border border-gray-100">
          <div class="flex items-start justify-between mb-2">
             <div class="flex-1">
                <span class="text-xs font-bold text-gray-500 block mb-0.5">${service.operator}</span>
                <h4 class="font-bold text-gray-900 text-base">${service.line} <span class="mx-1">→</span> ${service.destination}</h4>
             </div>
             <div class="text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-500 flex-shrink-0 ml-2">経由：${service.via}</div>
          </div>
          <div class="text-sm font-mono text-gray-700 mt-2 bg-white p-2 rounded border border-gray-100 leading-relaxed">
            ${service.timetable.join('<span class="text-gray-300 mx-2">/</span>')}
          </div>
          ${hasIntermediateStops ? `
          <div class="mt-3 pt-3 border-t border-gray-200">
            <button 
              id="${buttonId}"
              class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95"
            >
              <i data-lucide="map-pin" class="w-4 h-4"></i>
              <span>途中の停留所</span>
              <i data-lucide="chevron-down" class="w-4 h-4 transition-transform" id="${buttonId}-icon"></i>
            </button>
            <div id="${stopsId}" class="hidden mt-3 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div class="divide-y divide-gray-100">
                ${service.intermediateStops.map((stopItem, stopIndex) => `
                  <div class="p-3 flex items-center gap-3 ${stopIndex === 0 ? 'bg-blue-50' : ''} ${stopIndex === service.intermediateStops.length - 1 ? 'bg-green-50' : ''}">
                    <div class="flex-shrink-0">
                      ${stopIndex === 0 ? `
                        <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <i data-lucide="map-pin" class="w-4 h-4 text-white"></i>
                        </div>
                      ` : stopIndex === service.intermediateStops.length - 1 ? `
                        <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <i data-lucide="flag" class="w-4 h-4 text-white"></i>
                        </div>
                      ` : `
                        <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                      `}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-gray-900">${stopItem.name}</span>
                        ${stopIndex === 0 ? '<span class="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">出発</span>' : ''}
                        ${stopIndex === service.intermediateStops.length - 1 ? '<span class="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">到着</span>' : ''}
                      </div>
                      <div class="flex items-center gap-3 mt-1">
                        <span class="text-xs text-gray-500 flex items-center gap-1">
                          <i data-lucide="clock" class="w-3 h-3"></i>
                          ${stopItem.time}
                        </span>
                        <span class="text-xs text-gray-500 flex items-center gap-1">
                          <i data-lucide="navigation" class="w-3 h-3"></i>
                          ${stopItem.distance}
                        </span>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          ` : ''}
        </div>
      `;
        }
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
      ? `<div class="bg-blue-600 text-white p-5 rounded-2xl shadow-lg mb-6 relative overflow-hidden">
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

    const detailContent = `
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

    // デスクトップ用パネルに表示
    if (detailsElement) {
      detailsElement.innerHTML = detailContent;
    }

    // モバイル用パネルに表示
    if (mobileDetailsElement) {
      mobileDetailsElement.innerHTML = detailContent;
    }

    if (window.lucide) window.lucide.createIcons();

    // 途中停留所ボタンのイベントリスナーを追加
    stop.services.forEach((service, index) => {
      if (service.intermediateStops && service.intermediateStops.length > 0) {
        const buttonId = `stops-btn-${stop.id}-${index}`;
        const stopsId = `stops-${stop.id}-${index}`;
        const iconId = `${buttonId}-icon`;
        
        const button = document.getElementById(buttonId);
        const stopsDiv = document.getElementById(stopsId);
        const icon = document.getElementById(iconId);
        
        if (button && stopsDiv && icon) {
          button.addEventListener('click', () => {
            const isHidden = stopsDiv.classList.contains('hidden');
            
            if (isHidden) {
              stopsDiv.classList.remove('hidden');
              icon.style.transform = 'rotate(180deg)';
            } else {
              stopsDiv.classList.add('hidden');
              icon.style.transform = 'rotate(0deg)';
            }
          });
        }
      }
    });
  }

  function clearSelection() {
    activeStopId = null;
    const emptyContent = `
       <div class="bg-white rounded-xl shadow-lg p-8 text-center h-full flex flex-col justify-center items-center">
          <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
             <i data-lucide="map-pin" class="w-10 h-10 text-gray-300"></i>
          </div>
          <h3 class="text-gray-900 mb-2 font-bold text-lg">バス停を選択してください</h3>
          <p class="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">地図上のマーカーをクリックするか、一覧から選択すると詳細が表示されます</p>
       </div>
    `;
    
    if (detailsElement) {
      detailsElement.innerHTML = emptyContent;
    }
    
    if (mobileDetailsElement) {
      mobileDetailsElement.innerHTML = emptyContent;
    }
    
    if (window.lucide) window.lucide.createIcons();

    if (stopSelect) {
      if (stopSelect.options.length > 0) {
        stopSelect.selectedIndex = 0;
      } else {
        stopSelect.value = '';
      }
    }

    // モバイル表示の場合は詳細パネルを閉じる
    if (isMobile) {
      closeMobileDetailPanel();
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

    // モバイル表示の場合は詳細パネルを表示
    if (isMobile && mobileDetailPanel && mobileOverlay) {
      showMobileDetailPanel();
    }
  }

  // モバイル詳細パネルを展開（280px）
  function showMobileDetailPanel() {
    if (mobileDetailPanel && mobileOverlay) {
      mobileDetailPanel.classList.add('show');
      mobileOverlay.classList.remove('hidden');
      mobileOverlay.classList.add('show');
      // ボディのスクロールを無効化
      document.body.style.overflow = 'hidden';
    }
  }

  // モバイル詳細パネルを縮小（50px）
  function closeMobileDetailPanel() {
    if (mobileDetailPanel && mobileOverlay) {
      mobileDetailPanel.classList.remove('show');
      mobileOverlay.classList.remove('show');
      setTimeout(() => {
        mobileOverlay.classList.add('hidden');
      }, 300);
      // ボディのスクロールを有効化
      document.body.style.overflow = '';
      // activeStopIdは保持（50pxの状態でも選択されたバス停の情報は保持）
    }
  }

  function updateFilters() {
    const showEast = (filterEast?.checked ?? filterEastMobile?.checked) ?? true;
    const showWest = (filterWest?.checked ?? filterWestMobile?.checked) ?? true;

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

  // チェックボックスの同期関数
  function syncCheckboxes() {
    if (filterEast && filterEastMobile) {
      filterEastMobile.checked = filterEast.checked;
    }
    if (filterWest && filterWestMobile) {
      filterWestMobile.checked = filterWest.checked;
    }
  }

  // PC用チェックボックスのイベントリスナー
  if (filterEast) {
    filterEast.addEventListener('change', () => {
      updateFilters();
      syncCheckboxes();
    });
  }
  if (filterWest) {
    filterWest.addEventListener('change', () => {
      updateFilters();
      syncCheckboxes();
    });
  }

  // モバイル用チェックボックスのイベントリスナー
  if (filterEastMobile) {
    filterEastMobile.addEventListener('change', () => {
      if (filterEast) {
        filterEast.checked = filterEastMobile.checked;
      }
      updateFilters();
    });
  }
  if (filterWestMobile) {
    filterWestMobile.addEventListener('change', () => {
      if (filterWest) {
        filterWest.checked = filterWestMobile.checked;
      }
      updateFilters();
    });
  }

  renderMarkers();
  updateFilters();
  syncCheckboxes();

  // 初期表示時のバス停選択は、モバイル判定の後に処理する
  // （下記のコードで処理）

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

  /* =========================================
     GoogleMap風検索機能
     ========================================= */

  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchResultsList = document.getElementById('search-results-list');
  const searchNoResults = document.getElementById('search-no-results');
  const searchClearBtn = document.getElementById('search-clear-btn');
  let searchTimeout = null;

  // 検索関数
  function searchBusStops(query) {
    if (!query || query.trim().length === 0) {
      searchResults.classList.add('hidden');
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const results = [];

    window.busStops.forEach((stop) => {
      let matchScore = 0;
      let matchType = '';

      // バス停名で検索
      if (stop.name.toLowerCase().includes(searchTerm)) {
        matchScore += 100;
        matchType = 'バス停名';
      }

      // 行き先で検索
      stop.services.forEach((service) => {
        if (service.destination.toLowerCase().includes(searchTerm)) {
          matchScore += 50;
          matchType = matchType || '行き先';
        }
        // 経由地で検索
        if (service.via.toLowerCase().includes(searchTerm)) {
          matchScore += 30;
          matchType = matchType || '経由地';
        }
        // 路線名で検索
        if (service.line.toLowerCase().includes(searchTerm)) {
          matchScore += 40;
          matchType = matchType || '路線名';
        }
        // 運営会社で検索
        if (service.operator.toLowerCase().includes(searchTerm)) {
          matchScore += 20;
          matchType = matchType || '運営会社';
        }
      });

      // 目印で検索
      stop.landmarks.forEach((landmark) => {
        if (landmark.toLowerCase().includes(searchTerm)) {
          matchScore += 10;
          matchType = matchType || '目印';
        }
      });

      if (matchScore > 0) {
        results.push({
          stop,
          matchScore,
          matchType,
        });
      }
    });

    // スコアでソート
    results.sort((a, b) => b.matchScore - a.matchScore);

    return results.slice(0, 10); // 最大10件
  }

  // 検索結果を表示
  function displaySearchResults(results) {
    searchResultsList.innerHTML = '';

    if (results.length === 0) {
      searchNoResults.classList.remove('hidden');
      searchResults.classList.remove('hidden');
      return;
    }

    searchNoResults.classList.add('hidden');

    results.forEach((result) => {
      const { stop, matchType } = result;
      const isEast = stop.exit === 'east';
      const exitColor = isEast ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
      const exitText = isEast ? '東口' : '西口';

      // 最初のサービス情報を取得
      const firstService = stop.services[0];
      const destination = firstService ? firstService.destination : '';

      const resultItem = document.createElement('div');
      resultItem.className = 'p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors';
      resultItem.innerHTML = `
        <div class="flex items-start gap-2 sm:gap-3">
          <div class="flex-shrink-0 mt-0.5 sm:mt-1">
            <div class="w-9 h-9 sm:w-10 sm:h-10 ${isEast ? 'bg-blue-600' : 'bg-purple-600'} rounded-lg flex items-center justify-center">
              <i data-lucide="map-pin" class="w-4 h-4 sm:w-5 sm:h-5 text-white"></i>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
              <h4 class="text-sm sm:text-base font-semibold text-gray-900 truncate">${stop.name}</h4>
              <span class="px-1.5 sm:px-2 py-0.5 ${exitColor} text-xs rounded font-medium flex-shrink-0">${exitText}</span>
            </div>
            <p class="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-1">${destination || '詳細情報なし'}</p>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs text-gray-500">${matchType}で一致</span>
              ${stop.services.length > 1 ? `<span class="text-xs text-gray-400">他${stop.services.length - 1}系統</span>` : ''}
            </div>
          </div>
          <div class="flex-shrink-0 mt-0.5">
            <i data-lucide="chevron-right" class="w-4 h-4 text-gray-400"></i>
          </div>
        </div>
      `;

      resultItem.addEventListener('click', () => {
        selectStop(stop.id, { centerOnMap: true });
        searchInput.value = '';
        searchResults.classList.add('hidden');
        searchClearBtn.classList.add('hidden');
        if (window.lucide) window.lucide.createIcons();
      });

      searchResultsList.appendChild(resultItem);
    });

    searchResults.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  // 検索入力のイベントリスナー
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value;

      // クリアボタンの表示/非表示
      if (query.length > 0) {
        searchClearBtn.classList.remove('hidden');
      } else {
        searchClearBtn.classList.add('hidden');
        searchResults.classList.add('hidden');
      }

      // デバウンス処理
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        if (query.trim().length > 0) {
          const results = searchBusStops(query);
          displaySearchResults(results);
        } else {
          searchResults.classList.add('hidden');
        }
      }, 300);
    });

    // フォーカス時の処理
    searchInput.addEventListener('focus', () => {
      const query = searchInput.value.trim();
      if (query.length > 0) {
        const results = searchBusStops(query);
        displaySearchResults(results);
      }
    });

    // 検索バー外をクリックしたら結果を非表示
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target) && !searchClearBtn.contains(e.target)) {
        searchResults.classList.add('hidden');
      }
    });

    // Enterキーで最初の結果を選択
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query.length > 0) {
          const results = searchBusStops(query);
          if (results.length > 0) {
            selectStop(results[0].stop.id, { centerOnMap: true });
            searchInput.value = '';
            searchResults.classList.add('hidden');
            searchClearBtn.classList.add('hidden');
          }
        }
      } else if (e.key === 'Escape') {
        searchResults.classList.add('hidden');
        searchInput.blur();
      }
    });
  }

  // クリアボタンのイベントリスナー
  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchResults.classList.add('hidden');
      searchClearBtn.classList.add('hidden');
      searchInput.focus();
    });
  }

  /* =========================================
     モバイル詳細パネルのイベントリスナー
     ========================================= */

  // ×ボタンで50pxに縮小
  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', () => {
      closeMobileDetailPanel();
    });
  }

  // ドラッグハンドルをタップしても展開/縮小できるようにする
  const dragHandle = mobileDetailPanel?.querySelector('.bg-gray-300');
  if (dragHandle && mobileDetailPanel) {
    dragHandle.addEventListener('click', () => {
      if (mobileDetailPanel.classList.contains('show')) {
        closeMobileDetailPanel();
      } else {
        // バス停が選択されている場合のみ展開
        if (activeStopId) {
          showMobileDetailPanel();
        }
      }
    });
  }

  // オーバーレイをクリックしても50pxに縮小
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', () => {
      closeMobileDetailPanel();
    });
  }

  // ウィンドウサイズ変更時の処理
  window.addEventListener('resize', () => {
    const wasMobile = isMobile;
    isMobile = window.innerWidth < 1024;
    
    // モバイルからデスクトップに変更した場合、パネルを閉じる
    if (wasMobile && !isMobile && mobileDetailPanel) {
      closeMobileDetailPanel();
    }
    
    map.invalidateSize();
  });

  // 初期化時にモバイル判定
  if (isMobile) {
    // モバイル表示時は最初から詳細パネルを50pxの状態にする
    if (mobileDetailPanel) {
      mobileDetailPanel.classList.remove('show');
      mobileDetailPanel.style.height = '50px';
    }
    if (mobileOverlay) {
      mobileOverlay.classList.add('hidden');
      mobileOverlay.classList.remove('show');
    }
  }

  // 初期表示時にバス停を選択しないようにする（モバイルのみ）
  if (isMobile && window.busStops && window.busStops.length > 0) {
    // デスクトップでは最初のバス停を選択するが、モバイルでは選択しない
    // clearSelection(); // 必要に応じてコメントアウト
  } else if (!isMobile && window.busStops && window.busStops.length > 0) {
    // デスクトップ表示時のみ最初のバス停を選択
    selectStop(window.busStops[0].id, { centerOnMap: false });
  }

});
