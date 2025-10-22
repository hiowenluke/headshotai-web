<template>
  <div class="options-container" :class="'cols-' + columns">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  columns?: number;
}>();
</script>

<style scoped>
.options-container {
  display: flex;
  flex-wrap: wrap;
  gap: 18px 34px;
  padding: 5px 0 5px;
  margin-top: -13px;
  margin-bottom: 3px;
}

/* 移除响应式代码 - 只支持移动端，直接应用移动端样式 */
.options-container {
  gap: 16px 28px;
}
</style>
