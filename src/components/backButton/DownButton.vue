<template>
  <div class="down-button-wrapper" @click="handleClick" @touchend="handleTouchEnd">
    <BaseButton 
      icon="chevron-down-outline"
      button-class="down-button"
      @click="handleClick"
    />
  </div>
</template>

<script setup lang="ts">
// 图标现在通过BaseButton的icon属性传递
import BaseButton from './BaseButton.vue';

const emit = defineEmits<{
  click: [];
}>();

const handleClick = (event?: Event) => {
  event?.stopPropagation();
  emit('click');
};

const handleTouchEnd = (event: TouchEvent) => {
  event.preventDefault();
  event.stopPropagation();
  emit('click');
};
</script>

<style scoped>
.down-button-wrapper{
  z-index: 99999; 
  position: relative;
}

.down-button {
  border-radius: 50% !important;
  background: #343739 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.10) !important;
  transition: background-color 0.2s, box-shadow 0.2s;
  width: 33px !important;
  height: 33px !important;
  min-width: 33px !important;
  min-height: 33px !important;
  margin: 5px 0 0 8px !important;
}

.down-button:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16) !important;
}

.down-button:active {
  background: rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18) !important;
}
</style>
