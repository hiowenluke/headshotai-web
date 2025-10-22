<template>
  <BaseButton 
    icon="chevron-back-outline"
    button-class="return-button"
    @click="$emit('click')"
  />
</template>

<script setup lang="ts">
// 图标现在通过BaseButton的icon属性传递
import BaseButton from './BaseButton.vue';

defineEmits<{
  click: [];
}>();
</script>
