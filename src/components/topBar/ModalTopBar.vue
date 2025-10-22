<template>
  <div class="plm-toolbar">
    <!-- 左侧按钮插槽 - 根据模式显示不同按钮 -->
    <slot name="back-button" />
    
    <!-- 中间 title 内容区域 -->
    <div class="plm-center" ref="centerRef">
      <slot name="title" />
    </div>
    
    <!-- 右侧插槽 -->
    <div class="plm-right">
      <slot name="toolbar-end" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 中心区域元素引用
const centerRef = ref<HTMLElement | null>(null);

// 导出中心区域引用供父组件使用
defineExpose({
  centerRef
});
</script>

<style scoped>
.plm-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  margin-top: 0;
  min-height: 54px;
  position: relative;
  z-index: var(--toolbar-z-index, 11);
}

.plm-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  /* plm-center 外部的左右按钮，宽度在父容器里已经留出来了，因此这里不要再扣除任何宽度 */
  width: 100%;
  max-width: 100%;
  padding: 0 4px; /* 给边缘留出一点缓冲，避免视觉贴边 */
  margin-top: 2px;
}

.plm-right {
  display: flex;
  align-items: center;
}

/* 右侧工具栏按钮样式 - 与 back-button 保持一致 */
.plm-right :deep(ion-button) {
  background: none !important;
  border: none !important;
  width: 44px !important;
  height: 44px !important;
  margin: 6px 0 0 0 !important;
  color: #fff !important;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px !important;
  transition: background-color 0.2s ease;
  min-width: 44px !important;
  min-height: 44px !important;
  position: relative;
  --background: none !important;
  --background-activated: none !important;
  --background-focused: none !important;
  --background-hover: none !important;
  --box-shadow: none !important;
  --color: #ffffff !important;
  --border-radius: 6px !important;
  --padding-start: 0 !important;
  --padding-end: 0 !important;
  --padding-top: 0 !important;
  --padding-bottom: 0 !important;
  text-transform: none !important;
}

.plm-right :deep(ion-button:hover) {
  background-color: rgba(255, 255, 255, 0.1);
}

.plm-right :deep(ion-button:active) {
  background-color: rgba(255, 255, 255, 0.2);
}

.plm-right :deep(ion-button:focus),
.plm-right :deep(ion-button:active),
.plm-right :deep(ion-button:focus-visible) {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

.plm-right :deep(ion-icon) {
  width: 30px !important;
  height: 30px !important;
  color: #ffffff !important;
  margin: 0 !important;
  padding: 0 !important;
}
</style>
