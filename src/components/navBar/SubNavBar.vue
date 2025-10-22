<template>
  <div class="sub-menu-bar" v-if="visible">
    <div class="sub-menu-scroll" ref="subMenuScroll">
      <div class="sub-menu-inner">
        <SubItem
          v-for="(item, index) in subMenus" 
          :key="item.id"
          :display-name="item.displayName"
          :is-active="index === activeSubIndex"
          :index="index"
          :item-width="itemWidth"
          @click="selectSubMenu"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, onUnmounted } from 'vue';
import type { SubMenuItem } from '@/pages/homepage/menuData';
import SubItem from './SubItem.vue';

const props = defineProps<{
  subMenus: SubMenuItem[];
  activeSubIndex: number;
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', index: number): void;
  (e: 'scroll-to-top'): void; // 新增：滚动到顶部事件
}>();

const subMenuScroll = ref<HTMLElement | null>(null);
const itemWidth = ref<string>('auto');

function updateItemWidth() {
  nextTick(() => {
    const el = subMenuScroll.value;
    if (!el || !props.subMenus.length) return;
    
    const style = getComputedStyle(el);
    const barWidth = el.clientWidth;
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;
    const gap = 8; // 与CSS保持一致
    const itemCount = props.subMenus.length;
    const totalGap = gap * (itemCount - 1);
    const width = (barWidth - paddingLeft - paddingRight - totalGap) / itemCount;
    itemWidth.value = width > 0 ? `${width}px` : 'auto';
  });
}

onMounted(() => {
  updateItemWidth();
  window.addEventListener('resize', updateItemWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateItemWidth);
});

watch(() => props.subMenus, updateItemWidth);

const selectSubMenu = (index: number) => {
  // 检测是否点击的是当前已激活的子菜单项
  if (index === props.activeSubIndex) {
    // 点击当前子菜单项，触发滚动到顶部
    emit('scroll-to-top');
  } else {
    // 点击不同的子菜单项，执行正常切换
    emit('select', index);
  }
  ensureVisible(index);
};

const ensureVisible = (index: number) => {
  try {
    const el = subMenuScroll.value;
    if (!el) return;
    
    const items = el.querySelectorAll('.sub-menu-item');
    const item = items[index] as HTMLElement | undefined;
    if (!item) return;
    
    const itemLeft = item.offsetLeft;
    const itemRight = itemLeft + item.offsetWidth;
    const viewLeft = el.scrollLeft;
    const viewRight = viewLeft + el.clientWidth;
    
    if (itemLeft < viewLeft || itemRight > viewRight) {
      const revealPx = 24;
      let left = Math.max(0, itemLeft - 12);
      left = Math.min(left, Math.max(0, itemRight - el.clientWidth + revealPx));
      el.scrollTo({ left, behavior: 'smooth' });
    }
  } catch {
    // ignore
  }
};

watch(() => props.activeSubIndex, (index) => {
  ensureVisible(index);
});
</script>

<style scoped>
.sub-menu-bar {
  background: transparent !important;
  padding: 0 0 8px;
  height: 44px; /* 指定高度，防止切换菜单项时，菜单栏上下抖动 */
}

.sub-menu-scroll {
  display: flex;
  gap: 8px;
  padding: 0 12px;
  overflow-x: auto;
  scrollbar-width: none;
}

.sub-menu-scroll::-webkit-scrollbar {
  display: none;
}

.sub-menu-inner {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 移除响应式代码 - 只支持移动端，直接应用移动端样式 */
.sub-menu-scroll {
  padding-left: 8px;
  padding-right: 8px;
}

.sub-menu-inner {
  gap: 6px;
}

/* .sub-menu-bar{
  background: red !important;
} */

</style>