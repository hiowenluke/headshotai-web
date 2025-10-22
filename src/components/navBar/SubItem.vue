<template>
  <div 
    class="sub-menu-item" 
    :class="{ active: isActive }"
    :style="{ width: itemWidth }"
    @click="handleClick"
  >
    {{ displayName }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  displayName: string;
  isActive: boolean;
  index: number;
  itemWidth?: string;
}>();

const emit = defineEmits<{
  (e: 'click', index: number): void;
}>();

function handleClick() {
  emit('click', props.index);
}
</script>

<style scoped>
.sub-menu-item {
  color: #fff;
  white-space: nowrap;
  border-radius: 50px;
  cursor: pointer;
  flex: 0 0 auto;
  transition: all 0.25s ease;
  background: #1a1a1e;
  text-align: center;
  padding: 6px 10px;
  font-size: 15px;
}

.sub-menu-item.active {
  background: #444C55;
  border: 1px solid rgba(126,139,153,0.85);
  font-weight: 600;
}

.sub-menu-item:hover {
  background: rgba(68, 76, 85, 0.5);
}

</style>
