<template>
  <div class="center-card" :class="{ 'full-width': fullWidth }" ref="cardRef">
    <div v-if="title || subTitle" class="card-header">
      <h1 v-if="title" class="card-title">{{ title }}</h1>
      <p v-if="subTitle" class="card-subtitle">{{ subTitle }}</p>
    </div>
    <div v-if="$slots.content" class="card-content">
      <slot name="content"></slot>
    </div>
    <div v-if="$slots.buttons" class="card-buttons">
      <slot name="buttons"></slot>
    </div>
    <transition name="fade">
      <div v-if="errorMessage" class="card-error">{{ errorMessage }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  title?: string;
  subTitle?: string;
  errorMessage?: string;
  fullWidth?: boolean;
}

withDefaults(defineProps<Props>(), {
  fullWidth: false,
});

const cardRef = ref<HTMLElement | null>(null);

// 为了保持向后兼容，保留这个方法但不做任何操作
function recalcPosition() {
  // 已移除动态位置计算，现在使用纯CSS布局
}

defineExpose({ recalcPosition });
</script>

<style scoped>
.center-card {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 30px 25px;
  background: #2e3035;
  border-radius: 30px;
  color: #fff;  
  box-sizing: border-box;
  box-shadow: 0 12px 40px -10px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07);
}
/* 移除响应式代码 - 只支持移动端 */

/* 全宽模式 */
.center-card.full-width {
  max-width: none;
  margin: 0;
}

/* 移除响应式代码 - 只支持移动端 */

.card-header {
  margin-bottom: 25px;
  text-align: center;
}

.card-title {
  margin: 0;
  font-size: 21px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.card-subtitle {
  margin: 8px 0 0;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.3px;
  opacity: 0.85;
  line-height: 1.3;
}
.card-content {
  margin-bottom: 25px;
}
.card-error {
  margin-top: 6px;
  font-size: 14px;
  line-height: 1.4;
  color: #ff6464;
  text-align: center;
  font-weight: 600;
  word-break: break-word;
}
.fade-enter-active,.fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from,.fade-leave-to { opacity:0; }
</style>
