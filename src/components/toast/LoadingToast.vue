<template>
  <div v-if="visible" class="loading-toast-overlay">
    <div class="loading-toast">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getGlobalZIndex } from '@/utils/zIndexManager';

const visible = ref(false);
let hideTimer: number | null = null;

function show(duration: number = 0) {
  visible.value = true;
  
  // 动态设置 z-index，确保在所有模态框之上
  const zIndex = getGlobalZIndex('LOADING');
  document.documentElement.style.setProperty('--loading-z-index', zIndex.toString());
  
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  if (duration > 0) {
    hideTimer = window.setTimeout(() => {
      visible.value = false;
      hideTimer = null;
    }, duration);
  }
}

function hide() {
  visible.value = false;
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

// 事件处理函数
function handleLoadingToastEvent(e: any) {
  const detail = e?.detail || {};
  if (detail.show) {
    show(detail.duration ?? 0);
  } else {
    hide();
  }
}

// 在组件挂载后添加全局事件监听
onMounted(() => {
  window.addEventListener('app:loading-toast', handleLoadingToastEvent);
});

onUnmounted(() => {
  if (hideTimer) clearTimeout(hideTimer);
  window.removeEventListener('app:loading-toast', handleLoadingToastEvent);
});
</script>
<style>
.loading-toast-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: var(--loading-z-index, 9100) !important;
  background: rgba(0,0,0,0.38) !important;
  backdrop-filter: blur(6px) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  pointer-events: none !important;
}
.loading-toast {
  width: 96px !important;
  height: 96px !important;
  border-radius: 18px !important;
  background: #183a6d !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18) !important;
  pointer-events: auto !important;
}
.loading-spinner {
  width: 44px !important;
  height: 44px !important;
  border: 5px solid #fff !important;
  border-top: 5px solid #3a7afe !important;
  border-radius: 50% !important;
  animation: spin 1s linear infinite !important;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
