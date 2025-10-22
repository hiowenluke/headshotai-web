<template>
  <button class="mini-select-button" :disabled="disabled" @click="$emit('click')">
    {{ text }}
  </button>
</template>

<script setup lang="ts">
interface Props {
  text: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
});

const emit = defineEmits<{
  click: [];
}>();
</script>

<style scoped>
.mini-select-button {
  /* 基于 LargePrimaryButton 但缩小尺寸 */
  background: #2a78ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  min-height: 32px;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.2s;
  box-shadow: 0 4px 12px -3px rgba(0, 0, 0, 0.5);
}

.mini-select-button:hover:not(:disabled) {
  background: #1e66e6;
}

.mini-select-button:active:not(:disabled) {
  transform: scale(0.97);
  background: #1a5acc;
}

.mini-select-button:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
