<template>
  <div class="close-button-wrapper">
    <BaseButton 
      icon="close-outline"
      button-class="close-button"
      @click="handleClick"
    />
  </div>
</template>

<script setup lang="ts">
import BaseButton from './BaseButton.vue';

const emit = defineEmits<{
  click: [];
}>();

const handleClick = () => {
  emit('click');
};
</script>

<style scoped>
.close-button-wrapper{
  z-index: 99999; 
  position: relative;
}

.close-button {
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

.close-button:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16) !important;
}

.close-button:active {
  background: rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18) !important;
}
</style>
