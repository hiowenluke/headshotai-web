<template>
  <ion-header ref="headerRef" class="modal-header plm-header" :class="{ 'transparent-blur': props.transparentBlur }" :translucent="false">
    <div class="topbar-wrapper">
      <ModalTopBar ref="modalTopBarRef">
        <template #back-button>
          <slot name="back-button" />
        </template>
        <template #title>
          <slot name="title" />
        </template>
        <template #toolbar-end>
          <slot name="toolbar-end" />
        </template>
      </ModalTopBar>
    </div>
    <div v-if="showMainMenu" class="main-navbar-wrapper">
      <MainNavBar 
        :menus="menus" 
        :activeIndex="activeIndex" 
        :hasSubMenus="hasSubMenus"
        @select="(i) => $emit('select', i)" 
        @scroll-to-top="() => $emit('scroll-to-top')"
      />
    </div>
    <div v-if="showSubMenu" class="sub-navbar-wrapper">
      <SubNavBar 
        :sub-menus="currentSubMenus" 
        :active-sub-index="activeSubIndex"
        :visible="showSubMenu"
        @select="(i) => $emit('select-sub', i)" 
        @scroll-to-top="() => $emit('scroll-to-top')"
      />
    </div>
  </ion-header>
</template>

<script setup lang="ts">
import { IonHeader } from '@ionic/vue';
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import ModalTopBar from '../topBar/ModalTopBar.vue';
import MainNavBar from '@/components/navBar/MainNavBar.vue';
import SubNavBar from '@/components/navBar/SubNavBar.vue';
import type { SubMenuItem } from '@/pages/homepage/menuData';

interface Props {
  showMainMenu?: boolean;
  showSubMenu?: boolean;
  menus?: string[];
  activeIndex?: number;
  hasSubMenus?: boolean[];
  currentSubMenus?: SubMenuItem[];
  activeSubIndex?: number;
  transparentBlur?: boolean; // 是否使用半透明毛玻璃效果
}

const props = withDefaults(defineProps<Props>(), {
  showMainMenu: false,
  showSubMenu: false,
  activeIndex: 0,
  activeSubIndex: 0,
  menus: () => [],
  hasSubMenus: () => [],
  currentSubMenus: () => [],
  transparentBlur: false
});

defineEmits<{
  (e: 'select', index: number): void;
  (e: 'select-sub', index: number): void;
  (e: 'scroll-to-top'): void;
}>();

const modalTopBarRef = ref<InstanceType<typeof ModalTopBar> | null>(null);
const headerRef = ref<InstanceType<typeof IonHeader> | HTMLElement | null>(null);
const modalElement = ref<HTMLElement | null>(null);
let resizeObserver: ResizeObserver | null = null;

const handleResize = () => scheduleMetricsUpdate();
const handleOrientationChange = () => scheduleMetricsUpdate();
const handleVisualViewportResize = () => scheduleMetricsUpdate();
const handleVisualViewportScroll = () => scheduleMetricsUpdate();

const getHeaderElement = (): HTMLElement | null => {
  const header = headerRef.value as any;
  if (!header) return null;
  if (header instanceof HTMLElement) return header;
  if (header.$el) return header.$el as HTMLElement;
  return null;
};

const applyHeaderMetrics = (height: number, paddingBottom: number) => {
  if (!modalElement.value && headerRef.value) {
    const headerEl = getHeaderElement();
    modalElement.value = headerEl?.closest('.page-like-modal') as HTMLElement | null;
  }
  if (modalElement.value) {
    modalElement.value.style.setProperty('--plm-header-height', `${height}px`);
    modalElement.value.style.setProperty('--plm-header-padding-bottom', `${paddingBottom}px`);
  }
};

const updateHeaderMetrics = () => {
  const headerEl = getHeaderElement();
  if (!headerEl) return;
  const height = headerEl.offsetHeight || 0;
  const paddingBottom = parseFloat(getComputedStyle(headerEl).paddingBottom || '0') || 0;
  applyHeaderMetrics(height, paddingBottom);
};

const scheduleMetricsUpdate = () => {
  nextTick(() => {
    updateHeaderMetrics();
  });
};

onMounted(() => {
  scheduleMetricsUpdate();

  const headerEl = getHeaderElement();
  if (typeof ResizeObserver !== 'undefined' && headerEl) {
    resizeObserver = new ResizeObserver(() => {
      updateHeaderMetrics();
    });
    resizeObserver.observe(headerEl);
  }

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleOrientationChange as any);
  try {
    window.visualViewport?.addEventListener('resize', handleVisualViewportResize as any);
    window.visualViewport?.addEventListener('scroll', handleVisualViewportScroll as any);
  } catch { /* ignore */ }
});

onUnmounted(() => {
  const headerEl = getHeaderElement();
  if (resizeObserver && headerEl) {
    try {
      resizeObserver.unobserve(headerEl);
    } catch { /* ignore */ }
  }
  resizeObserver?.disconnect();
  resizeObserver = null;

  window.removeEventListener('resize', handleResize);
  window.removeEventListener('orientationchange', handleOrientationChange as any);
  try {
    window.visualViewport?.removeEventListener('resize', handleVisualViewportResize as any);
    window.visualViewport?.removeEventListener('scroll', handleVisualViewportScroll as any);
  } catch { /* ignore */ }
});

watch(() => [
  props.showMainMenu,
  props.showSubMenu,
  props.activeIndex,
  props.activeSubIndex,
  props.menus?.length,
  props.currentSubMenus?.length
], () => scheduleMetricsUpdate());

// 通过 ModalTopBar 组件获取 centerRef
const centerRef = computed(() => modalTopBarRef.value?.centerRef || null);

// 导出 centerRef 供父组件使用
defineExpose({
  centerRef
});
</script>

<style scoped>

.modal-header {
  background: #25262B;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--header-z-index, 100);
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: calc(env(safe-area-inset-top, 0px)) 0 0;
  border: none !important;
  border-bottom: none !important;
  --border-width: 0 !important;
  --border-style: none !important;
  --border-color: transparent !important;
  box-shadow: none !important;
}

/* 移除 ion-header 的默认 ::after 伪元素 border */
.modal-header:not(.transparent-blur)::after {
  display: none !important;
}

/* 使用 ::part 选择器移除 Shadow DOM 中的 border */
.modal-header::part(native) {
  border: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
}

.modal-header.transparent-blur {
  background: rgba(37, 38, 43, 0.75);
  backdrop-filter: blur(18px) saturate(140%);
  box-shadow: none !important;
}

.modal-header.transparent-blur::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(to right, rgba(255,255,255,0.10), rgba(255,255,255,0.02));
  pointer-events: none;
}

.topbar-wrapper {
  padding: 6px 0 0;
}

.main-navbar-wrapper,
.sub-navbar-wrapper {
  position: relative;
  background: transparent;
  border: none !important;
  box-shadow: none !important;
  padding: 0;
}

.modal-header.transparent-blur .main-navbar-wrapper,
.modal-header.transparent-blur .sub-navbar-wrapper {
  background: transparent;
  backdrop-filter: none;
}

</style>
