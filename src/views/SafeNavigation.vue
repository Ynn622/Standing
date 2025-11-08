<script setup lang="ts">
import { computed, ref } from 'vue';
import BottomNav from '@/components/BottomNav.vue';
import Input from '@/components/base/Input.vue';
import Button from '@/components/base/Button.vue';
import GoogleMap from '@/components/common/GoogleMap.vue';
import { geocodeAddress, getSafeNavigationData } from '@/utils/api';
import type { SafeRouteSegment } from '@/utils/api';
import type { LatLng, MapMarkerDescriptor } from '@/types/maps';

const {
  defaultStart,
  defaultEnd,
  segments,
  mapEmbedUrl
} = getSafeNavigationData();

const origin = ref(defaultStart);
const destination = ref(defaultEnd);
const originCoords = ref<LatLng | null>(null);
const destinationCoords = ref<LatLng | null>(null);
const selectedSegment = ref<SafeRouteSegment | null>(null);
const defaultSafeCenter: LatLng = { lat: 25.0375198, lng: 121.5636796 };
const userCoords = ref<LatLng | null>(null);
const mapCenter = ref<LatLng>(defaultSafeCenter);
const isLocating = ref(false);
const locationError = ref<string | null>(null);
const canUseGeolocation = typeof window !== 'undefined' && 'geolocation' in navigator;
const isOriginGeocoding = ref(false);
const isDestinationGeocoding = ref(false);
const originMarkerHint = ref('尚未標記出發點');
const destinationMarkerHint = ref('尚未標記目的地');
const isSegmentModalOpen = ref(false);

const canNavigate = computed(() => Boolean(origin.value && destination.value));

const resetNavigation = () => {
  origin.value = '';
  destination.value = '';
  originCoords.value = null;
  destinationCoords.value = null;
  selectedSegment.value = null;
  originMarkerHint.value = '尚未標記出發點';
  destinationMarkerHint.value = '尚未標記目的地';
};

const startNavigation = () => {
  if (!canNavigate.value) {
    return;
  }
  const url = `https://www.google.com/maps/dir/${encodeURIComponent(origin.value)}/${encodeURIComponent(destination.value)}`;
  window.open(url, '_blank');
};

const selectSegment = (segment: SafeRouteSegment) => {
  selectedSegment.value = segment;
};

const openSegmentModal = () => {
  isSegmentModalOpen.value = true;
};

const closeSegmentModal = () => {
  isSegmentModalOpen.value = false;
};

const getWindSegments = (speed: number) => {
  const segments = 5;
  const maxSpeed = 15;
  const ratio = Math.min(speed, maxSpeed) / maxSpeed;
  return Array.from({ length: segments }, (_, index) => ratio >= (index + 1) / segments);
};

const openSafeMap = () => {
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

const safeMapMarkers = computed<MapMarkerDescriptor[]>(() => {
  const markers: MapMarkerDescriptor[] = [];
  if (originCoords.value) {
    markers.push({
      id: 'safe-origin',
      position: originCoords.value,
      color: '#0EA5E9',
      label: '出發點',
      zIndex: 20
    });
  }
  if (destinationCoords.value) {
    markers.push({
      id: 'safe-destination',
      position: destinationCoords.value,
      color: '#2DD4BF',
      label: '目的地',
      zIndex: 20
    });
  }
  if (userCoords.value) {
    markers.push({
      id: 'safe-user',
      position: userCoords.value,
      color: '#1F8A70',
      label: '目前定位',
      zIndex: 30
    });
  }
  return markers;
});

const applyMarkerFromInput = async (type: 'origin' | 'destination') => {
  const targetValue = type === 'origin' ? origin.value.trim() : destination.value.trim();
  if (!targetValue) {
    if (type === 'origin') {
      originMarkerHint.value = '請先輸入出發點';
    } else {
      destinationMarkerHint.value = '請先輸入目的地';
    }
    return;
  }

  const loadingRef = type === 'origin' ? isOriginGeocoding : isDestinationGeocoding;
  const hintRef = type === 'origin' ? originMarkerHint : destinationMarkerHint;
  const coordRef = type === 'origin' ? originCoords : destinationCoords;

  loadingRef.value = true;
  hintRef.value = '定位中...';

  const coords = await geocodeAddress(targetValue);
  loadingRef.value = false;

  if (!coords) {
    hintRef.value = '無法標記，請確認地址';
    return;
  }

  coordRef.value = coords;
  mapCenter.value = coords;
  hintRef.value = `已標記：${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
};

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
      const coords = { lat: latitude, lng: longitude };
      userCoords.value = coords;
      mapCenter.value = coords;
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
  <div class="safe-nav-page min-h-screen bg-white pb-24" :class="{ 'modal-open': isSegmentModalOpen }">
    <main class="mx-auto flex max-w-5xl flex-col gap-4 px-4 pt-6">
      <!--  輸入區 -->
      <section class="rounded-2xl border border-grey-100 px-4 py-4 shadow-sm">
        <div class="space-y-5">
          <div>
            <label class="flex items-center gap-3 rounded-xl border border-grey-200 px-4 py-3">
              <span class="text-2xl text-primary-500">📍</span>
              <div class="flex w-full items-center gap-3">
                <Input
                  v-model="origin"
                  placeholder="輸入出發點"
                  class="w-full border-0 bg-transparent p-0 text-base text-grey-900 focus:ring-0"
                />
                <button
                  type="button"
                  class="marker-btn"
                  :disabled="isOriginGeocoding"
                  @click="applyMarkerFromInput('origin')"
                >
                  {{ isOriginGeocoding ? '定位中' : '標記' }}
                </button>
              </div>
            </label>
            <p class="marker-hint">{{ originMarkerHint }}</p>
          </div>
          <div>
            <label class="flex items-center gap-3 rounded-xl border border-grey-200 px-4 py-3">
              <span class="text-2xl text-primary-500">🎯</span>
              <div class="flex w-full items-center gap-3">
                <Input
                  v-model="destination"
                  placeholder="輸入目的地"
                  class="w-full border-0 bg-transparent p-0 text-base text-grey-900 focus:ring-0"
                />
                <button
                  type="button"
                  class="marker-btn"
                  :disabled="isDestinationGeocoding"
                  @click="applyMarkerFromInput('destination')"
                >
                  {{ isDestinationGeocoding ? '定位中' : '標記' }}
                </button>
              </div>
            </label>
            <p class="marker-hint">{{ destinationMarkerHint }}</p>
          </div>
        </div>
      </section>

      <section class="segment-summary rounded-2xl border border-grey-100 px-4 py-4 shadow-sm">
        <div>
          <p class="segment-summary__eyebrow">避開高風速</p>
          <p class="segment-summary__title">
            {{ selectedSegment ? selectedSegment.name : '尚未選取路段' }}
          </p>
          <p class="segment-summary__hint">
            {{ selectedSegment ? selectedSegment.note : `共有 ${segments.length} 段建議，點擊查看清單` }}
          </p>
        </div>
        <button type="button" class="segment-summary__action" @click="openSegmentModal">
          查看建議
        </button>
      </section>

      <!-- 路線規劃地圖區 -->
      <section class="rounded-3xl border border-grey-100 shadow-lg overflow-hidden">
        <div class="map-embed map-embed--tall h-full min-h-[360px]">
          <GoogleMap :center="mapCenter" :markers="safeMapMarkers" :zoom="14" />
          <div class="map-embed__badge">導航預覽</div>
          <div class="map-embed__actions">
            <button
              type="button"
              class="map-action-btn"
              :disabled="isLocating"
              @click="requestUserLocation"
            >
              {{ isLocating ? '定位中...' : '重新定位' }}
            </button>
            <button type="button" class="map-action-btn" @click="resetNavigation">
              清除輸入
            </button>
            <button type="button" class="map-action-btn map-action-btn--primary" @click="openSafeMap">
              Google Maps
            </button>
          </div>
          <div class="absolute inset-x-4 top-4 rounded-2xl bg-white/95 p-4 shadow">
            <div v-if="selectedSegment">
              <p class="text-xs uppercase tracking-widest text-grey-500">已選路段</p>
              <h3 class="mt-1 text-lg font-bold text-primary-600">{{ selectedSegment.name }}</h3>
              <p class="text-sm text-grey-600">
                {{ selectedSegment.direction }}，風速 {{ selectedSegment.windSpeed.toFixed(1) }} m/s
              </p>
              <p class="mt-1 text-xs text-grey-500">{{ selectedSegment.note }}</p>
            </div>
            <div v-else>
              <p class="text-sm font-semibold text-grey-800">點擊上方風速列表以查看詳情</p>
              <p class="text-xs text-grey-500">地圖顯示建議路線，起終點已標記。</p>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-dashed border-primary-100 bg-white/90 px-4 py-4 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-grey-500">定位資訊</p>
        <p class="mt-1 text-sm text-grey-700">
          授權定位後可快速將導航路線聚焦於您的所在位置。
        </p>
        <div class="mt-3 rounded-xl border border-grey-100 bg-white/70 px-3 py-2 text-xs text-grey-600">
          <p class="font-semibold text-grey-800">目前鎖定：{{ locationLabel }}</p>
          <p v-if="locationError" class="mt-1 text-rose-500">{{ locationError }}</p>
          <p v-else class="mt-1 text-grey-400">若未跳出定位授權提示，請確認 App 已開啟 GPS 權限。</p>
        </div>
      </section>

      <!-- 功能按鈕區 -->
      <section class="grid grid-cols-2 gap-3">
        <Button
          outline
          class="w-full rounded-2xl border-2 border-primary-500 bg-white py-4 text-primary-500 shadow"
          @click="resetNavigation"
        >
          重新設定
        </Button>
        <Button
          class="w-full rounded-2xl bg-primary-500 py-4 text-white shadow"
          :class="{ 'opacity-60': !canNavigate }"
          :disabled="!canNavigate"
          @click="startNavigation"
        >
          開始導航
        </Button>
      </section>
    </main>

    <Transition name="segment-modal">
      <div v-if="isSegmentModalOpen" class="segment-modal__overlay" @click.self="closeSegmentModal">
        <section class="segment-modal__panel" @click.stop>
          <header class="segment-modal__header">
            <div>
              <p class="segment-modal__eyebrow">建議路段風速</p>
              <h3 class="segment-modal__title">避開高風速路段清單</h3>
            </div>
            <button type="button" class="segment-modal__close" @click="closeSegmentModal">✕</button>
          </header>
          <div class="segment-modal__body">
            <p class="segment-modal__intro">
              共 {{ segments.length }} 段建議。點擊任一路段即可同步更新地圖浮層並鎖定對應提示。
            </p>
            <button
              v-for="segment in segments"
              :key="segment.id"
              class="segment-modal__item"
              :class="{ 'segment-modal__item--active': selectedSegment?.id === segment.id }"
              @click="selectSegment(segment)"
            >
              <div class="segment-modal__item-head">
                <p class="segment-modal__item-name">{{ segment.name }}</p>
                <span class="segment-modal__item-speed">{{ segment.windSpeed.toFixed(1) }} m/s</span>
              </div>
              <div class="segment-track mt-2">
                <span
                  v-for="(active, index) in getWindSegments(segment.windSpeed)"
                  :key="`${segment.id}-modal-meter-${index}`"
                  class="segment-track__item"
                  :class="{ 'segment-track__item--active': active }"
                ></span>
              </div>
              <p class="segment-modal__item-note">{{ segment.note }}</p>
            </button>
          </div>
        </section>
      </div>
    </Transition>

    <BottomNav />
  </div>
</template>

<style scoped>
label input:focus {
  outline: none;
  box-shadow: none;
}

.safe-nav-page.modal-open {
  overflow: hidden;
}

.marker-btn {
  padding: 0.35rem 0.95rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid #62a3a6;
  color: #fff;
  background: linear-gradient(90deg, #62a3a6, #7bc3c5);
  transition: opacity 0.2s ease;
  cursor: pointer;
}

.marker-btn:disabled {
  opacity: 0.6;
}

.marker-hint {
  margin-top: 0.35rem;
  padding-left: 2.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.segment-summary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.25rem;
  background: #f3fbfb;
}

.segment-summary__eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #94a3b8;
}

.segment-summary__title {
  margin-top: 0.25rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.segment-summary__hint {
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: #475569;
}

.segment-summary__action {
  align-self: center;
  padding: 0.65rem 1.4rem;
  border-radius: 999px;
  border: none;
  background: #62a3a6;
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 8px 22px rgba(98, 163, 166, 0.25);
  cursor: pointer;
}

.segment-modal__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 2rem 1rem 1rem;
  z-index: 90;
}

.segment-modal__panel {
  width: 100%;
  max-width: 32rem;
  background: #fff;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -12px 40px rgba(15, 23, 42, 0.25);
  max-height: calc(100vh - 5rem);
  display: flex;
  flex-direction: column;
}

.segment-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.5rem 0.5rem;
}

.segment-modal__eyebrow {
  font-size: 0.75rem;
  color: #64748b;
  letter-spacing: 0.35em;
  text-transform: uppercase;
}

.segment-modal__title {
  margin-top: 0.35rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
}

.segment-modal__close {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-size: 1.1rem;
  display: grid;
  place-items: center;
  color: #475569;
  cursor: pointer;
}

.segment-modal__body {
  padding: 0.5rem 1.5rem 1.5rem;
  overflow-y: auto;
  max-height: calc(100vh - 10rem);
}

.segment-modal__intro {
  font-size: 0.85rem;
  color: #475569;
  margin-bottom: 0.75rem;
}

.segment-modal__item {
  width: 100%;
  text-align: left;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  padding: 0.85rem 1rem;
  background: #fff;
  transition: border 0.2s ease, background 0.2s ease;
  display: block;
  margin-bottom: 0.75rem;
  cursor: pointer;
}

.segment-modal__item:last-child {
  margin-bottom: 0;
}

.segment-modal__item--active {
  border-color: #62a3a6;
  background: #e6f1f2;
}

.segment-modal__item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.segment-modal__item-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
}

.segment-modal__item-speed {
  font-size: 0.85rem;
  font-weight: 600;
  color: #047857;
}

.segment-modal__item-note {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #475569;
}

.segment-modal-enter-active,
.segment-modal-leave-active {
  transition: opacity 0.2s ease;
}

.segment-modal-enter-from,
.segment-modal-leave-to {
  opacity: 0;
}
</style>
