<template>
  <div style="display: none;">
    <!-- 动画组件不需要渲染内容 -->
  </div>
</template>

<script setup lang="ts">
import { createBaseAnimation } from './BaseAnimation';

// 垂直动画函数
function createVerticalEnterAnimation(baseEl: any) {
  return createBaseAnimation(baseEl, 'enter', 'vertical');
}

function createVerticalLeaveAnimation(baseEl: any) {
  return createBaseAnimation(baseEl, 'leave', 'vertical');
}

// 导出动画函数供父组件使用
defineExpose({
  createVerticalEnterAnimation,
  createVerticalLeaveAnimation
});
</script>
