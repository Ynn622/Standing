<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import HomeIcon from '@/assets/navicons/Setting.png';
import TrafficIcon from '@/assets/navicons/Traffic.png';
import SafeIcon from '@/assets/navicons/SafeNavigation.png';
import ReportIcon from '@/assets/navicons/Report.png';

const router = useRouter();
const route = useRoute();

const navItems = [
  { name: 'home', label: '首頁', icon: HomeIcon },
  { name: 'traffic', label: '即時路況', icon: TrafficIcon },
  { name: 'safeNavigation', label: '安全導航', icon: SafeIcon },
  { name: 'report', label: '障礙回報', icon: ReportIcon }
];

const navigateTo = (name: string) => {
  if (route.name === name) {
    return;
  }
  router.push({ name }).catch((error) => {
    if (error?.name !== 'NavigationDuplicated') {
      console.warn('[BottomNav] navigation failed', error);
    }
  });
};
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-200 shadow-lg z-50 pb-safe">
    <div class="flex justify-around items-center h-16 md:h-20">
      <button
        v-for="item in navItems"
        :key="item.name"
        type="button"
        @click="navigateTo(item.name)"
        class="flex flex-col items-center justify-center flex-1 h-full rounded-2xl mx-1"
        :class="{
          'text-primary-600 nav-active': route.name === item.name,
          'text-grey-500 nav-idle': route.name !== item.name
        }"
      >
        <span class="nav-icon" :class="{ 'nav-icon--active': route.name === item.name }">
          <img :src="item.icon" :alt="item.label" class="h-7 w-7 object-contain" />
        </span>
        <span class="text-[11px] font-medium">{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
button {
  -webkit-tap-highlight-color: transparent;
}

/* 支援 iOS 安全區域 */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-idle {
  transition: color 0.25s ease, background 0.25s ease;
}

.nav-active {
  background: rgba(98, 163, 166, 0.12);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  transition: transform 0.25s ease, background 0.25s ease;
}

.nav-icon--active {
  background: rgba(98, 163, 166, 0.18);
  box-shadow: 0 10px 20px rgba(98, 163, 166, 0.18);
  transform: scale(1.05);
}

.nav-idle .nav-icon {
  opacity: 0.75;
}

.nav-idle:active .nav-icon {
  transform: scale(0.95);
}
</style>
