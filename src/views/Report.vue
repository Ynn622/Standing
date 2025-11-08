<script setup lang="ts">
import { computed, ref } from 'vue';
import BottomNav from '@/components/BottomNav.vue';
import Button from '@/components/base/Button.vue';
import ReportIcon from '@/assets/navicons/Report.png';
import TreeIcon from '@/assets/reporticon/tree.png';
import FallenIcon from '@/assets/reporticon/fallen.png';
import AccidentIcon from '@/assets/reporticon/accident.png';
import OthersIcon from '@/assets/reporticon/others.png';
import { getObstacleReportData, getMapEmbedUrlFromCoords } from '@/utils/api';
import type { ObstacleTypeOption } from '@/utils/api';

const { obstacleTypes, mapEmbedUrl: defaultMapEmbed, helperText } = getObstacleReportData();

const selectedType = ref<ObstacleTypeOption['id'] | null>(null);
const description = ref('');
const isSubmitting = ref(false);
const showSuccess = ref(false);
const currentMapEmbed = ref(defaultMapEmbed);
const userCoords = ref<{ lat: number; lng: number } | null>(null);
const isLocating = ref(false);
const locationError = ref<string | null>(null);
const canUseGeolocation = typeof window !== 'undefined' && 'geolocation' in navigator;

const toggleType = (typeId: ObstacleTypeOption['id']) => {
  selectedType.value = selectedType.value === typeId ? null : typeId;
};

const isSelected = (typeId: ObstacleTypeOption['id']) => selectedType.value === typeId;

const selectedTypeLabel = computed(() => {
  if (!selectedType.value) {
    return null;
  }
  const target = obstacleTypes.find(item => item.id === selectedType.value);
  return target?.label ?? null;
});

const canSubmit = computed(
  () => Boolean(selectedType.value) && description.value.trim().length >= 8
);

const resetForm = () => {
  selectedType.value = null;
  description.value = '';
};

const submitReport = async () => {
  if (!canSubmit.value || isSubmitting.value) {
    return;
  }
  isSubmitting.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1200));
  isSubmitting.value = false;
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
  }, 2400);
  resetForm();
};

const hexToRgba = (hexColor: string, alpha: number) => {
  const normalized = hexColor.replace('#', '');
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getTypeStyle = (type: ObstacleTypeOption, active: boolean) => {
  if (active) {
    return {
      borderColor: type.color,
      backgroundImage: `linear-gradient(120deg, ${hexToRgba(type.color, 0.15)}, ${hexToRgba(type.color, 0.05)})`,
      boxShadow: `inset 0 0 0 2px ${hexToRgba(type.color, 0.35)}`,
      transition: 'background 0.2s ease, box-shadow 0.2s ease'
    };
  }
  return {
    borderColor: hexToRgba(type.color, 0.35),
    backgroundColor: '#fff',
    transition: 'background 0.2s ease, box-shadow 0.2s ease'
  };
};

const getIconRingStyle = (type: ObstacleTypeOption, active: boolean) => {
  if (active) {
    return {
      background: '#fff',
      boxShadow: `inset 0 0 0 2px ${hexToRgba(type.color, 0.5)}`,
      transform: 'scale(1.05)'
    };
  }
  return {
    background: '#fff',
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)'
  };
};

const obstacleIconMap: Record<ObstacleTypeOption['id'], string> = {
  tree: TreeIcon,
  sign: FallenIcon,
  accident: AccidentIcon,
  others: OthersIcon
};

const locationLabel = computed(() => {
  if (!userCoords.value) return '尚未鎖定座標';
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
  <div class="min-h-screen bg-white pb-28">
    <main class="mx-auto flex max-w-5xl flex-col gap-4 px-4 pt-6">
      <!-- 標題區 -->
      <!-- <section class="rounded-2xl border border-grey-100 bg-white px-4 py-4 shadow-sm">
        <div class="flex items-center gap-4">
          <img :src="ReportIcon" alt="障礙回報 icon" class="h-14 w-14 object-contain" />
          <div class="flex flex-col gap-1">
            <p class="text-xs uppercase tracking-[0.4em] text-primary-400">Alert</p>
            <h1 class="text-2xl font-bold text-grey-900">障礙回報</h1>
            <p class="text-sm text-grey-600">回報路面落物、事故與特殊狀況，協助即時調度</p>
          </div>
        </div>
      </section> -->

      <!-- 地圖區 -->
      <section class="rounded-3xl border border-grey-100 shadow-lg overflow-hidden">
        <div class="map-embed map-embed--tall h-full min-h-[360px]">
          <iframe
            :src="currentMapEmbed"
            title="障礙回報地圖"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
            class="absolute inset-0 h-full w-full"
          ></iframe>
          <div class="map-embed__badge">障礙定位</div>
          <div class="map-embed__actions">
            <button
              type="button"
              class="map-action-btn"
              :disabled="isLocating"
              @click="requestUserLocation"
            >
              {{ isLocating ? '定位中...' : '重新定位' }}
            </button>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-dashed border-primary-100 bg-white/90 px-4 py-4 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-grey-500">Google Maps</p>
        <p class="mt-1 text-sm text-grey-700">
          拖曳地圖或縮放以校正障礙定位，預留 Google Maps SDK 與街口 API 欄位。
        </p>
        <div class="mt-2 rounded-xl border border-grey-100 bg-white/70 px-3 py-2 text-xs text-grey-600">
          <p class="font-semibold text-grey-800">
            目前鎖定：{{ locationLabel }}
          </p>
          <p v-if="locationError" class="mt-1 text-rose-500">
            {{ locationError }}
          </p>
          <p v-else class="mt-1 text-grey-400">
            若未跳出授權提示，請確認 App 已開啟 GPS 權限後再重試。
          </p>
        </div>
        <div class="mt-3 rounded-xl border border-dashed border-primary-200 bg-primary-50/80 p-3 text-xs text-grey-600">
          <p class="text-sm font-semibold text-grey-900">街口資料（API 預留）</p>
          <p class="mt-1 leading-relaxed text-grey-600">
            {{ helperText }}
          </p>
        </div>
      </section>

      <!-- 障礙類型 + 問題描述 -->
      <section class="rounded-2xl border border-grey-100 bg-white px-4 py-4 shadow-sm">
        <div class="space-y-6">
          <div>
            <div class="mb-3 flex items-center justify-between">
              <h2 class="text-lg font-bold text-grey-900">障礙類型</h2>
              <span class="text-xs font-semibold text-primary-500">
                請選擇一種類型，資訊會同步到地圖圖層
              </span>
            </div>
            <div class="type-scroll flex gap-3 overflow-x-auto pb-1">
              <button
                v-for="type in obstacleTypes"
                :key="type.id"
                type="button"
                class="flex min-w-[180px] flex-1 items-center gap-3 rounded-2xl border px-4 py-4 text-left shadow-sm transition"
                :style="getTypeStyle(type, isSelected(type.id))"
                @click="toggleType(type.id)"
              >
                <span
                  class="h-12 w-12 flex items-center justify-center rounded-full shadow-inner transition-all duration-200"
                  :style="getIconRingStyle(type, isSelected(type.id))"
                >
                  <img
                    :src="obstacleIconMap[type.id]"
                    :alt="type.label"
                    class="h-8 w-8 object-contain"
                  />
                </span>
                <div class="flex flex-col">
                  <p class="text-sm font-semibold text-grey-900">{{ type.label }}</p>
                  <p v-if="isSelected(type.id)" class="text-xs text-grey-600">已選取</p>
                  <p v-else class="text-xs text-grey-500">點擊選取</p>
                </div>
              </button>
            </div>
          </div>

          <div class="rounded-2xl border border-dashed border-grey-200 p-4">
            <div class="mb-2 flex items-center justify-between">
              <h2 class="text-lg font-bold text-grey-900">問題描述</h2>
              <span class="text-xs text-grey-500">{{ description.length }}/200</span>
            </div>
            <textarea
              v-model="description"
              rows="5"
              maxlength="200"
              class="w-full rounded-xl border border-grey-200 p-3 text-sm text-grey-800 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
              placeholder="請描述發生時間、影響範圍與目前狀態..."
            ></textarea>
            <p class="mt-2 text-xs text-grey-500">
              完整描述有助於後端研判處理優先順序，亦可補充現場聯絡方式。
            </p>
          </div>
        </div>
      </section>

      <!-- 提交按鈕區 -->
      <section class="rounded-2xl bg-white px-4 py-4 shadow-sm">
        <div class="flex flex-col gap-3">
          <div class="grid grid-cols-2 gap-3">
            <Button
              outline
              class="w-full rounded-2xl border-2 border-primary-500 bg-white py-3 text-primary-500"
              @click="resetForm"
            >
              重新設定
            </Button>
            <Button
              class="w-full rounded-2xl bg-primary-500 py-4 text-white shadow-lg"
              :disabled="!canSubmit || isSubmitting"
              @click="submitReport"
            >
              {{ isSubmitting ? '送出中...' : '障礙回報' }}
            </Button>
          </div>
          <p class="text-xs text-grey-500">
            送出後將記錄於障礙清單並通知交通指揮中心，回報紀錄會同步於個人頁。
          </p>
        </div>
      </section>
    </main>

    <Transition name="toast">
      <div
        v-if="showSuccess"
        class="fixed inset-x-6 bottom-28 z-50 rounded-2xl bg-[#1F8A70] px-4 py-3 text-center text-sm font-semibold text-white shadow-xl"
      >
        回報完成，資料已送至後端 API。
      </div>
    </Transition>

    <BottomNav />
  </div>
</template>

<style scoped>
.type-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.type-scroll::-webkit-scrollbar {
  display: none;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
