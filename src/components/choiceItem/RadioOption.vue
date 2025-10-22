<template>
  <button 
    type="button" 
    class="radio-option" 
    :class="{ active: isActive }"
    @click="$emit('select')"
  >
    <span class="radio">
      <span class="dot" />
    </span>
    <span class="label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  isActive: boolean;
}>();

defineEmits<{
  (e: 'select'): void;
}>();
</script>

<style scoped>
.radio-option {
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  padding: 3px 0;
  margin: 0;
  cursor: pointer;
  font-size: 16px;
  color: #e6e8eb;
  font-weight: 500;
  position: relative;
  text-align: left;
  flex: 0 0 calc((100% - 2*38px)/3);
}

.radio-option .radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #9a9ca0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color .2s, background-color .2s;
}

.radio-option .dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: transparent;
  transition: background-color .2s;
}

.radio-option.active .radio {
  background: #2a78ff;
  border: 1px solid #ffffff;
}

.radio-option.active .dot {
  background: #2a78ff;
}

.radio-option.active {
  color: #ffffff;
  font-weight: 600;
}

.label {
    margin-left: -2px;
}

/* 移除响应式代码 - 只支持移动端，直接应用移动端样式 */
.radio-option {
  font-size: 16px;
  gap: 10px;
}

.radio-option .radio {
  width: 18px;
  height: 18px;
}

.radio-option .dot {
  width: 10px;
  height: 10px;
}
</style>
