<template>
  <div class="page-footer-hint">
    <slot />
  </div>
</template>

<script setup lang="ts">
// 通用的页面底部提示组件
// 用于显示法律声明、政策链接等固定在页面底部的内容
</script>

<style scoped>
.page-footer-hint {
  width: 100%;
  margin-top: 30px;
  padding: 0 0 calc(20px + env(safe-area-inset-bottom, 0px));
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.4px;
  text-align: center;
  color: #fff;
  line-height: 1.45;
  flex-shrink: 0;
}

/* 链接样式 */
.page-footer-hint :deep(a),
.page-footer-hint :deep(.link) {
  color: #4f9eff;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.page-footer-hint :deep(a:hover),
.page-footer-hint :deep(.link:hover) {
  border-bottom-color: #4f9eff;
}
</style>
