<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import BottomNav from '@/components/BottomNav.vue';
import {
  getTrafficLayerPresets,
  getTrafficMapEmbedUrl,
  getTrafficTabs,
  getMapEmbedUrlFromCoords
} from '@/utils/api';
import type { TrafficTab } from '@/utils/api';

const router = useRouter();

const filters = getTrafficTabs();
const layerPresets = getTrafficLayerPresets();
const mapEmbedUrl = getTrafficMapEmbedUrl();
const currentMapEmbed = ref(mapEmbedUrl);
const userCoords = ref<{ lat: number; lng: number } | null>(null);
const isLocating = ref(false);
const locationError = ref<string | null>(null);
const canUseGeolocation = typeof window !== 'undefined' && 'geolocation' in navigator;

const selectedFilters = ref<TrafficTab['id'][]>(
  filters.length ? [filters[0].id] : []
);

const detailLayerId = ref<TrafficTab['id'] | null>(null);

const toggleFilter = (filterId: TrafficTab['id']) => {
  const currentIndex = selectedFilters.value.indexOf(filterId);
  if (currentIndex > -1) {
    selectedFilters.value.splice(currentIndex, 1);
  } else {
    selectedFilters.value.push(filterId);
  }
  // TODO: 根據 selectedFilters 的陣列呼叫地圖 Layer API 顯示對應圖層
};

watch(selectedFilters, (filters) => {
  if (detailLayerId.value && !filters.includes(detailLayerId.value)) {
    detailLayerId.value = null;
  }
});

const hasSelection = computed(() => selectedFilters.value.length > 0);

const activeLayers = computed(() =>
  selectedFilters.value.map(id => ({
    id,
    ...layerPresets[id]
  }))
);

const detailLayer = computed(() => {
  if (!detailLayerId.value) {
    return null;
  }
  const preset = layerPresets[detailLayerId.value];
  if (!preset) {
    return null;
  }
  return {
    id: detailLayerId.value,
    ...preset
  };
});

const handleLayerClick = (layerId: TrafficTab['id']) => {
  if (!selectedFilters.value.includes(layerId)) {
    return;
  }
  detailLayerId.value = layerId;
  // TODO: 接上地圖 click 事件後可在此觸發
};

const goHome = () => {
  router.push({ name: 'home' });
};

const openTrafficMap = () => {
  const targetUrl = userCoords.value
    ? `https://www.google.com/maps/search/?api=1&query=${userCoords.value.lat},${userCoords.value.lng}`
    : mapEmbedUrl;
  if (!targetUrl) {
    return;
  }
  window.open(targetUrl, '_blank', 'noopener');
};

const locationLabel = computed(() => {
  if (!userCoords.value) {
    return '尚未鎖定座標';
  }
  return `緯度 ${userCoords.value.lat.toFixed(5)}、經度 ${userCoords.value.lng.toFixed(5)}`;
});

const requestUserLocation = () => {
  if (!canUseGeolocation || typeof navigator === 'undefined') {
    locationError.value = '此裝置不支援定位功能';
    return;
  }
  isLocating.value = true;
  locationError.value = null;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      userCoords.value = { lat: latitude, lng: longitude };
      currentMapEmbed.value = getMapEmbedUrlFromCoords(latitude, longitude);
      isLocating.value = false;
    },
    (error) => {
      isLocating.value = false;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          locationError.value = '使用者拒絕定位授權';
          break;
        case error.POSITION_UNAVAILABLE:
          locationError.value = '定位資訊不可用';
          break;
        case error.TIMEOUT:
          locationError.value = '定位逾時，請重新嘗試';
          break;
        default:
          locationError.value = '無法取得定位資訊';
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
  );
};
</script>

<template>
  <div class="min-h-screen bg-white pb-24">
    <main class="mx-auto flex max-w-5xl flex-col gap-3 px-4 pt-4">
      <!-- 分類標籤列 -->
      <section class="rounded-2xl border border-grey-100 px-3 py-3 shadow-sm">
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="filter in filters"
            :key="filter.id"
            type="button"
            class="w-full rounded-full border px-3 py-1.5 text-center text-sm font-medium transition-all"
            :class="
              selectedFilters.includes(filter.id)
                ? 'shadow-sm text-white'
                : ''
            "
            :style="selectedFilters.includes(filter.id)
              ? {
                borderColor: layerPresets[filter.id].color,
                backgroundColor: layerPresets[filter.id].color,
                boxShadow: `0 4px 12px ${layerPresets[filter.id].color}33`
              }
              : {
                borderColor: `${layerPresets[filter.id].color}66`,
                color: layerPresets[filter.id].color,
                backgroundColor: `${layerPresets[filter.id].color}10`
              }"
            @click="toggleFilter(filter.id)"
          >
            {{ filter.label }}
          </button>
        </div>
        <p class="mt-2 text-xs text-grey-400">
          可複選路段類型，自訂顯示的地圖圖層
        </p>
      </section>

      <!-- 地圖顯示區 -->
      <section class="flex-1 rounded-3xl border border-grey-100 shadow-lg overflow-hidden">
        <div class="map-embed map-embed--tall h-full min-h-[360px]">
          <iframe
            :src="currentMapEmbed"
            title="Taipei live traffic map"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
            class="absolute inset-0 h-full w-full"
          ></iframe>
          <div class="map-embed__badge">即時路況</div>
          <div class="map-embed__actions">
            <button
              type="button"
              class="map-action-btn"
              :disabled="isLocating"
              @click="requestUserLocation"
            >
              {{ isLocating ? '定位中...' : '重新定位' }}
            </button>
            <button type="button" class="map-action-btn" @click="goHome">
              回首頁
            </button>
            <button
              type="button"
              class="map-action-btn map-action-btn--primary"
              @click="openTrafficMap"
            >
              開啟 Google Maps
            </button>
          </div>

          <!-- 浮動資訊卡 -->
          <Transition name="fade">
            <div
              v-if="detailLayer"
              class="absolute inset-x-4 top-4 rounded-2xl bg-white/95 p-4 shadow-lg"
            >
              <div class="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-grey-500">
                <span>路段詳情</span>
                <button class="text-xs font-semibold text-primary-500" @click="detailLayerId = null">
                  關閉
                </button>
              </div>
              <h2 class="mt-2 text-lg font-bold" :style="{ color: detailLayer.color }">
                {{ detailLayer.title }}
              </h2>
              <p class="mt-1 text-sm text-grey-600">
                {{ detailLayer.description }}
              </p>
              <p class="mt-2 text-xs font-medium text-grey-500">
                {{ detailLayer.highlight }}
              </p>
              <p class="mt-3 text-[11px] text-grey-400">雙指縮放地圖，點擊標記了解更多。</p>
            </div>
          </Transition>

          <!-- 選中路段徽章 -->
          <div
            v-if="hasSelection"
            class="absolute left-4 bottom-24 flex flex-wrap gap-2 rounded-2xl bg-white/90 px-3 py-2 shadow"
          >
            <button
              v-for="layer in activeLayers"
              :key="layer.id"
              class="rounded-full border px-3 py-1 text-xs font-semibold"
              :style="{ borderColor: layer.color, color: layer.color }"
              @click="handleLayerClick(layer.id)"
            >
              {{ layer.title }}
            </button>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-dashed border-primary-100 bg-white/90 px-4 py-4 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-grey-500">定位資訊</p>
        <p class="mt-1 text-sm text-grey-700">
          授權後可將地圖自動聚焦於您的所在路段，便於判斷周遭交通狀況。
        </p>
        <div class="mt-3 rounded-xl border border-grey-100 bg-white/80 px-3 py-2 text-xs text-grey-600">
          <p class="font-semibold text-grey-800">目前鎖定：{{ locationLabel }}</p>
          <p v-if="locationError" class="mt-1 text-rose-500">{{ locationError }}</p>
          <p v-else class="mt-1 text-grey-400">若未跳出定位授權提示，請確認 App 已開啟 GPS 權限。</p>
        </div>
      </section>
    </main>

    <!-- 底部導航 -->
    <BottomNav />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>
