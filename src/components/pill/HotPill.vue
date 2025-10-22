<template>
  <span 
    v-if="visible" 
    class="hot-pill"
    @click="handleClick"
  >
    {{ text }}
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  visible?: boolean;
  text?: string;
}>(), {
  visible: true,
  text: 'HOT'
});

const emit = defineEmits<{
  (e: 'click'): void;
}>();

function handleClick() {
  emit('click');
}
</script>

<style scoped>
.hot-pill {
  position: absolute;
  top: -9px;
  left: 50%;
  transform: translateX(-50%);
  background: #d40000;
  color: #fff;
  font-size: 10px;
  line-height: 11px;
  padding: 0 6px;
  border-radius: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  border: 1px solid #fff;
  cursor: pointer;
}
</style>
