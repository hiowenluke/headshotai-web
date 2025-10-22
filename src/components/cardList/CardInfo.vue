<template>
  <div class="card" :class="cardClass" @click="handleClick">
    <div v-if="isLoading" class="shimmer" />
    <div v-else class="image-wrapper">
      <img :src="src" />
      <div v-if="selected" class="selection-overlay">
        <span class="checkmark">✓</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  src?: string;
  isLoading?: boolean;
  selected?: boolean;
  disabled?: boolean;
}>(), {
  selected: false,
  disabled: false
});

const emit = defineEmits<{
  (e: 'click', src: string): void;
}>();

const cardClass = computed(() => ({
  skeleton: props.isLoading,
  selected: props.selected,
  disabled: props.disabled
}));

function handleClick() {
  if (!props.isLoading && !props.disabled && props.src) {
    emit('click', props.src);
  }
}
</script>

<style scoped>
/* 卡片样式 */
.card { 
  border-radius: 16.8px; 
  overflow: hidden; 
  border: none;
  aspect-ratio: 4/5; 
  position: relative;
  width: 100%;
  height: 100%;
  box-shadow: 0 0 0 1px rgba(128, 128, 128, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card.skeleton { 
  pointer-events: none; 
  background: linear-gradient(135deg, rgba(90,96,105,0.35), rgba(60,66,75,0.35));
  box-shadow: 0 0 0 1px rgba(128,128,128,0.25), 0 2px 6px rgba(0,0,0,0.08);
  position: relative;
  overflow: hidden;
}

.card.skeleton .shimmer { 
  position: absolute; 
  inset: 0;
  background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.05) 100%);
  animation: shimmer 1.15s linear infinite;
  background-size: 200% 100%;
  mix-blend-mode: plus-lighter;
}

@keyframes shimmer { 
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 卡片图片样式 */
.image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.image-wrapper img { 
  width: 100%; 
  height: 100%; 
  display: block; 
  object-fit: cover;
  object-position: center;
  border-radius: 16.8px;
}

.card.selected {
  box-shadow: 0 0 0 2px rgba(76, 164, 255, 0.85), 0 4px 14px rgba(36, 118, 255, 0.4);
}

.selection-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 10px;
  border-radius: 16.8px;
  pointer-events: none;
}

.selection-overlay .checkmark {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(27, 102, 255, 0.9);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.card.disabled {
  cursor: default;
  pointer-events: none;
  opacity: 0.6;
}
</style>
