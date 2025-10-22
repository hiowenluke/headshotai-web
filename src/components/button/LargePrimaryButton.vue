<template>
  <button class="large-primary-btn" :class="variantClass" :disabled="disabled" @click="$emit('click')">
    <span class="lpb-left" v-if="$slots.left"><slot name="left" /></span>
    <span class="lpb-label"><slot /></span>
    <span class="lpb-right" v-if="$slots.right"><slot name="right" /></span>
  </button>
</template>
<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ disabled?: boolean; variant?: 'primary' | 'inverse' | 'outline' }>();
const variantClass = computed(() => props.variant || 'primary');
defineEmits<{ (e:'click'):void }>();
</script>
<style scoped>
.large-primary-btn {
  width: 100%;
  height: 50px;
  font-size: var(--lpb-font-size, 22px);
  font-weight: 700;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  position: relative;
  cursor:pointer;
  user-select:none;
  transition: transform .18s ease, box-shadow .18s ease, background .2s, color .2s, border-color .2s;
  border: none;
}
/* primary: 原始蓝底白字 */
.large-primary-btn.primary {
  background: #2a78ff;
  color: #fff;
  box-shadow: 0 8px 24px -6px rgba(0,0,0,0.6);
}
/* inverse: 白底蓝字 */
.large-primary-btn.inverse {
  background:#fff;
  color:#2a78ff;
  box-shadow:0 4px 18px -4px rgba(0,0,0,.45),0 0 0 1px rgba(42,120,255,0.28);
  border:1px solid rgba(42,120,255,0.32);
}
.large-primary-btn.inverse:not(:disabled):hover { background:#ffffff; }
.large-primary-btn.inverse:not(:disabled):active { background:#f2f6ff; }
/* outline: 透明底蓝边 */
.large-primary-btn.outline {
  background:transparent;
  color:#2a78ff;
  border:1px solid rgba(42,120,255,0.55);
  box-shadow:0 0 0 1px rgba(42,120,255,0.28);
}
.large-primary-btn.outline:not(:disabled):hover { background:rgba(42,120,255,0.08); }
.large-primary-btn.outline:not(:disabled):active { background:rgba(42,120,255,0.14); }

.large-primary-btn:disabled { opacity:.6; cursor: default; }
.large-primary-btn:active:not(:disabled) { transform: scale(.97); }
.lpb-label { white-space: nowrap; font-weight:700; }
.lpb-left, .lpb-right { display:flex; align-items:center; }
/* 移除响应式代码 - 只支持移动端，直接应用移动端样式 */
.large-primary-btn { 
  padding: 9px 16px; 
  font-size: var(--lpb-font-size-mobile, 22px); 
}
</style>
