<template>
  <div 
    class="menu-item" 
    style="display:inline-flex;align-items:center;"
    :class="{ 
      active: isActive,
      'has-sub-menu': hasSubMenu && isActive 
    }" 
    @click="handleClick"
  >
    {{ text }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  text: string;
  isActive: boolean;
  hasSubMenu: boolean;
  index: number;
}>();

const emit = defineEmits<{
  (e: 'click', index: number): void;
}>();

function handleClick() {
  emit('click', props.index);
}
</script>

<style scoped>
.menu-item { 
  color: #fff;
  padding: 5px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  flex: 0 0 auto;
  transition: all 0.3s ease;
  /* background: red; */
}

.menu-item.active { 
  background: rgba(53,61,70,0.65);
  border: 1px solid rgba(126,139,153,0.85);
  font-weight: 700;
  border-radius: 50px;
  padding: 5px 22px;
  /* Removed backdrop-filter to keep nav bar transparent (avoid double frosted effect) */
}

/* 有子菜单时，边框颜色变深 */
.menu-item.active.has-sub-menu {
  border: 1px solid rgba(57, 63, 69, 0.85);
}

</style>
