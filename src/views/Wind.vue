<script setup lang="ts">
import { ref } from 'vue';
import BottomNav from '@/components/BottomNav.vue';
import Select from '@/components/base/Select.vue';
import Dialog from '@/components/base/Dialog.vue';
import { getWindMetrics, getWindNews } from '@/utils/api';
import type { NewsItem } from '@/utils/api';

const selectedDate = ref('today');
const selectedTime = ref('now');
const selectedRegion = ref('taipei');

const dateOptions = [
  { label: '今天', value: 'today' },
  { label: '明天', value: 'tomorrow' },
  { label: '後天', value: 'day-after' }
];

const timeOptions = [
  { label: '現在', value: 'now' },
  { label: '早上', value: 'morning' },
  { label: '中午', value: 'noon' },
  { label: '傍晚', value: 'evening' },
  { label: '晚上', value: 'night' }
];

const regionOptions = [
  { label: '台北', value: 'taipei' },
  { label: '新北', value: 'new-taipei' },
  { label: '桃園', value: 'taoyuan' },
  { label: '台中', value: 'taichung' },
  { label: '台南', value: 'tainan' },
  { label: '高雄', value: 'kaohsiung' }
];

const windData = getWindMetrics();

const news = ref<NewsItem[]>(getWindNews());

const selectedNews = ref<NewsItem | null>(null);
const showNewsDialog = ref(false);

const openNewsDetail = (newsItem: NewsItem) => {
  selectedNews.value = newsItem;
  showNewsDialog.value = true;
};

const closeNewsDialog = () => {
  showNewsDialog.value = false;
  selectedNews.value = null;
};
</script>

<template>
  <div class="min-h-screen bg-primary-50 pb-32 flex flex-col">
    <!-- 中間風況與篩選 -->
    <main class="flex-1 overflow-y-auto px-4 py-6">
      <!-- 篩選功能 -->
      <div class="max-w-4xl mx-auto mb-6">
        <div class="bg-white rounded-xl shadow-md p-4">
          <h2 class="text-lg font-bold text-grey-800 mb-4">篩選條件</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm text-grey-600 mb-1">日期</label>
              <Select
                v-model="selectedDate"
                :options="dateOptions"
                selectId="date-select"
                defaultSelected="選擇日期"
              />
            </div>
            <div>
              <label class="block text-sm text-grey-600 mb-1">時間</label>
              <Select
                v-model="selectedTime"
                :options="timeOptions"
                selectId="time-select"
                defaultSelected="選擇時間"
              />
            </div>
            <div>
              <label class="block text-sm text-grey-600 mb-1">地區</label>
              <Select
                v-model="selectedRegion"
                :options="regionOptions"
                selectId="region-select"
                defaultSelected="選擇地區"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 風況詳細資訊 -->
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-grey-800 mb-6 text-center">當前風況</h2>

          <!-- 風向指示器 -->
          <div class="flex justify-center mb-8">
            <div class="relative w-32 h-32">
              <div class="absolute inset-0 rounded-full border-4 border-primary-200"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-5xl transform rotate-45 text-primary-500">
                  ➤
                </div>
              </div>
              <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 text-xs text-grey-500">N</div>
              <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 text-xs text-grey-500">S</div>
              <div class="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 text-xs text-grey-500">W</div>
              <div class="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 text-xs text-grey-500">E</div>
            </div>
          </div>

          <!-- 風況數據 -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div class="bg-primary-100 rounded-lg p-4 text-center">
              <div class="text-sm text-grey-600 mb-1">風速</div>
              <div class="text-2xl font-bold text-primary-600">{{ windData.speed }}</div>
              <div class="text-xs text-grey-500">m/s</div>
            </div>
            <div class="bg-green-500 bg-opacity-10 rounded-lg p-4 text-center">
              <div class="text-sm text-grey-600 mb-1">風向</div>
              <div class="text-lg font-bold text-green-500">{{ windData.direction }}</div>
            </div>
            <div class="bg-orange-300 bg-opacity-20 rounded-lg p-4 text-center">
              <div class="text-sm text-grey-600 mb-1">溫度</div>
              <div class="text-2xl font-bold text-orange-500">{{ windData.temperature }}</div>
              <div class="text-xs text-grey-500">°C</div>
            </div>
            <div class="bg-primary-200 rounded-lg p-4 text-center">
              <div class="text-sm text-grey-600 mb-1">濕度</div>
              <div class="text-2xl font-bold text-primary-600">{{ windData.humidity }}</div>
              <div class="text-xs text-grey-500">%</div>
            </div>
            <div class="bg-secondary-100 rounded-lg p-4 text-center">
              <div class="text-sm text-grey-600 mb-1">氣壓</div>
              <div class="text-2xl font-bold text-secondary-600">{{ windData.pressure }}</div>
              <div class="text-xs text-grey-500">hPa</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 下方新聞牆 -->
    <section class="bg-white border-t-2 border-grey-200 overflow-y-auto md:overflow-visible max-h-[45vh] md:max-h-none px-4 py-4">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-xl font-bold text-grey-800 mb-4 flex items-center">
          <span class="mr-2">📰</span>
          氣象新聞
        </h2>

        <div class="space-y-3">
          <div
            v-for="item in news"
            :key="item.id"
            @click="openNewsDetail(item)"
            class="bg-grey-50 rounded-lg p-4 hover:bg-grey-100 cursor-pointer transition-colors border border-grey-200 hover:border-primary-300"
          >
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-bold text-grey-800 flex-1">{{ item.title }}</h3>
              <span class="text-xs text-grey-500 ml-2">{{ item.time }}</span>
            </div>
            <p class="text-sm text-grey-600 mb-2">{{ item.summary }}</p>
            <div class="flex items-center text-xs text-grey-500">
              <span class="px-2 py-1 bg-primary-100 text-primary-600 rounded">{{ item.source }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部導航 -->
    <BottomNav />

    <!-- 新聞詳情彈窗 -->
    <Teleport to="body">
      <Transition name="dialog">
        <div
          v-if="showNewsDialog && selectedNews"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          @click="closeNewsDialog"
        >
          <div
            class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            @click.stop
          >
            <!-- 標題區 -->
            <div class="bg-primary-500 text-white px-6 py-4">
              <div class="flex items-start justify-between">
                <h3 class="text-xl font-bold flex-1 pr-4">{{ selectedNews.title }}</h3>
                <button
                  @click="closeNewsDialog"
                  class="text-white hover:bg-white/20 rounded-full p-2 transition-colors flex-shrink-0"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="flex items-center gap-3 mt-3 text-sm">
                <span class="px-3 py-1 bg-white/20 rounded-full">{{ selectedNews.source }}</span>
                <span class="text-white/80">{{ selectedNews.time }}</span>
              </div>
            </div>

            <!-- 內容區 -->
            <div class="px-6 py-6 overflow-y-auto max-h-[calc(80vh-180px)]">
              <p class="text-grey-700 leading-relaxed whitespace-pre-line">
                {{ selectedNews.summary }}
              </p>
              
              <!-- 這裡可以添加更多詳細內容 -->
              <div class="mt-6 p-4 bg-primary-50 rounded-lg">
                <p class="text-sm text-grey-600">
                  💡 提示：這是模擬的新聞詳情內容。實際應用中，這裡會顯示完整的新聞報導、圖片等資訊。
                </p>
              </div>
            </div>

            <!-- 底部操作區 -->
            <div class="px-6 py-4 bg-grey-50 border-t border-grey-200 flex gap-3">
              <button
                @click="closeNewsDialog"
                class="flex-1 px-4 py-3 bg-grey-200 text-grey-700 rounded-lg font-medium hover:bg-grey-300 transition-colors"
              >
                關閉
              </button>
              <button
                class="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                @click="closeNewsDialog"
              >
                了解更多
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* 自訂滾動條 */
section::-webkit-scrollbar {
  width: 6px;
}

section::-webkit-scrollbar-track {
  background: #f1f1f1;
}

section::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

section::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Dialog 動畫 */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .bg-white,
.dialog-leave-active .bg-white {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.dialog-enter-from .bg-white,
.dialog-leave-to .bg-white {
  transform: scale(0.9);
  opacity: 0;
}
</style>
