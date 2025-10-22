<template>
  <PageLikeModal :is-open="isOpen" :page-title="pageTitle" modal-style="horizontal" @close="$emit('close')">
    <div class="modal-page">
      <slot />
    </div>
  </PageLikeModal>
</template>

<script setup lang="ts">
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';

defineProps<{ 
  isOpen: boolean;
  pageTitle: string;
}>();
defineEmits<{ (e: 'close'): void }>();
</script>

<style scoped>
.modal-page {
  padding: 24px;
}

/* 策略条款通用样式 */
:deep(section) {
  margin-bottom: 24px;
}

:deep(section:first-child) {
  margin-top: -10px;
}

:deep(section h3) {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #4f9eff;
}

:deep(section p) {
  font-size: 20px;
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.9);
}

:deep(section ul) {
  margin: 12px 0;
  padding-left: 20px;
}

:deep(section li) {
  font-size: 20px;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.9);
}

/* 移除响应式代码 - 只支持移动端，直接应用移动端样式 */
.modal-page {
  padding: 20px;
}

:deep(section h3) {
  font-size: 22px;
}

:deep(section p),
:deep(section li) {
  font-size: 18px;
}
</style>
