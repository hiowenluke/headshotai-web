<template>
  <ion-header class="home-header">
    <div class="topbar-wrapper">
      <HomeTopBar @recent="$emit('recent')" />
    </div>
    <div class="navbar-wrapper">
      <MainNavBar 
        :menus="menus" 
        :activeIndex="activeIndex" 
        :hasSubMenus="hasSubMenus"
        @select="(i)=>$emit('select', i)" 
        @scroll-to-top="()=>$emit('scroll-to-top')"
      />
    </div>
    <div class="sub-navbar-wrapper" v-if="showSubMenu">
      <SubNavBar 
        :sub-menus="currentSubMenus" 
        :active-sub-index="activeSubIndex"
        :visible="showSubMenu"
        @select="(i)=>$emit('select-sub', i)" 
        @scroll-to-top="()=>$emit('scroll-to-top')"
      />
    </div>
  </ion-header>
</template>
<script setup lang="ts">
import { IonHeader } from '@ionic/vue';
import HomeTopBar from '@/components/topBar/HomeTopBar.vue';
import MainNavBar from '@/components/navBar/MainNavBar.vue';
import SubNavBar from '@/components/navBar/SubNavBar.vue';
import type { SubMenuItem } from '@/pages/homepage/menuData';
import { onMounted, onBeforeUnmount } from 'vue';

defineProps<{ 
  menus: string[]; 
  activeIndex: number;
  showSubMenu: boolean;
  currentSubMenus: SubMenuItem[];
  activeSubIndex: number;
  hasSubMenus?: boolean[]; // 标识每个菜单是否有子菜单
}>();
defineEmits<{ 
  (e:'select', index:number):void; 
  (e:'select-sub', index:number):void;
  (e:'recent'):void;
  (e:'scroll-to-top'):void; // 新增：滚动到顶部事件
}>();

// 防止 iOS/移动端双击顶栏导致页面缩放：监听捕获阶段的 touchend，若两次间隔 < 320ms，阻止默认
let lastTouchEnd = 0;
function preventDoubleTapZoom(e: TouchEvent) {
  const now = Date.now();
  if (now - lastTouchEnd <= 320) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}
onMounted(() => {
  // 仅在顶栏区域启用：绑定到组件根元素
  try {
    const root = (document.querySelector('.home-header')) as HTMLElement | null;
    if (root) root.addEventListener('touchend', preventDoubleTapZoom, { passive: false, capture: true });
  } catch {/* ignore */}
});
onBeforeUnmount(() => {
  try {
    const root = (document.querySelector('.home-header')) as HTMLElement | null;
    if (root) root.removeEventListener('touchend', preventDoubleTapZoom as any, true);
  } catch {/* ignore */}
});
</script>
<style scoped>
.home-header { 
  background: rgba(37,38,43,0.55) !important;
  backdrop-filter: blur(18px) saturate(140%);
  box-shadow: 0 2px 12px -2px rgba(0,0,0,0.55);
  position: fixed; /* 改为固定定位 */
  top: 0;
  left: 0;
  right: 0;
  z-index: 100; /* 确保在CategoryPanels上方 */
  display: flex;
  flex-direction: column;
  padding: 0;
  --border-width: 0;
  border: none !important;
}

.home-header::after { 
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(to right, rgba(255,255,255,0.10), rgba(255,255,255,0.02));
  pointer-events: none;
}

.topbar-wrapper,
.navbar-wrapper {
  border: none !important;
  box-shadow: none !important;
  background: transparent;
}

/* 调整: 增加 HomeTopBar 到屏幕顶端的距离 */
.topbar-wrapper {
  padding-top: 8px;
}

.topbar-wrapper :deep(.app-name) {
  font-size: 20px;
}

.topbar-wrapper :deep(.right-icons ion-icon.white-icon),
.topbar-wrapper :deep(.right-icons ion-icon.menu-icon) {
  font-size: 30px !important;
}

/* 微调按钮间距，防止高度缩小时显得过于紧凑 */
.topbar-wrapper :deep(.icon-button:first-child) {
  margin-right: -18px; /* 原 -20px, 随缩放略收敛 */
}

/* 调整: 将 MainNavBar 上移 10px，并相应压缩整体 header 高度 */
.navbar-wrapper {
  margin-top: -5px; /* 上移 */
  padding-top: 0; /* 避免产生额外空隙 */
}

.sub-navbar-wrapper {
  border: none !important;
  box-shadow: none !important;
  background: transparent;
}
</style>
