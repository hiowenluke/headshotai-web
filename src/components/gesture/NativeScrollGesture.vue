<!--
  NativeScrollGesture - 水平滚动手势组件
  
  用于面板的左右切换，提供原生滚动体验
  配合 useVerticalBounce (category/composables) 实现垂直回弹
  
  @see src/components/category/composables/useVerticalBounce.ts - 垂直滚动回弹
-->
<template>
    <div class="native-scroll-gesture" ref="viewport" :style="containerVars">
        <div class="scroll-container" 
             @scroll="onScroll" 
             @touchstart="onTouchStart"
             @touchend="onTouchEnd"
             @touchcancel="onTouchCancel"
             ref="scrollContainer">
            <div class="panels-wrapper">
                <div v-for="(item, index) in items" 
                     :key="getItemKey ? getItemKey(item, index) : index"
                     class="panel-item"
                     :class="{ active: index === activeIndex }">
                    <slot :item="item" :index="index" :isActive="index === activeIndex" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" generic="T">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useTouchGesture } from './composables/useTouchGesture';
import { useScrollPosition } from './composables/useScrollPosition';
import { useScrollState } from './composables/useScrollState';
import { usePanelSwitch } from './composables/usePanelSwitch';

interface Props<T> {
    items: T[];
    activeIndex: number;
    getItemKey?: (item: T, index: number) => string | number;
    switchThreshold?: number;
    leftMargin?: number;
    rightMargin?: number;
}

const props = withDefaults(defineProps<Props<T>>(), {
    switchThreshold: 0.05,
    leftMargin: 30,
    rightMargin: 30
});

const emit = defineEmits<{
    select: [index: number];
    'scroll-start': [];
    'scroll-end': [];
}>();

// 模板引用
const viewport = ref<HTMLElement | null>(null);
const scrollContainer = ref<HTMLElement | null>(null);

// 使用 composables
const gesture = useTouchGesture();
const { panelWidth, updatePanelWidth, scrollToPanel: scrollToPanelBase } = useScrollPosition(
    viewport,
    scrollContainer,
    props.leftMargin
);
const scrollState = useScrollState();
const panelSwitch = usePanelSwitch(panelWidth, props.items.length, props.switchThreshold);

// 初始化 lastEmittedIndex
scrollState.lastEmittedIndex.value = props.activeIndex;

// 计算属性
const containerVars = computed(() => ({
    '--panel-count': props.items.length,
    '--left-margin': `${props.leftMargin}vw`,
    '--total-margin': `${props.leftMargin + props.rightMargin}vw`
}));

// 包装 scrollToPanel 以更新状态
function scrollToPanel(index: number, useAnimation: boolean = true) {
    scrollState.isUserScrolling.value = false;
    scrollState.lastEmittedIndex.value = index;
    scrollToPanelBase(index, useAnimation);
}

// 滚动事件处理
function onScroll() {
    if (!scrollContainer.value) return;

    scrollState.markScrolling();
    const scrollLeft = scrollContainer.value.scrollLeft;

    // 如果是用户滚动，检测滑动方向并立即切换
    if (scrollState.isUserScrolling.value && !scrollState.hasDirectionSwitched.value) {
        const scrollDistance = scrollLeft - scrollState.initialScrollLeft.value;
        const { canSwitch, targetIndex } = panelSwitch.checkImmediateSwitch(
            scrollDistance,
            scrollState.initialActiveIndex.value
        );

        if (canSwitch && targetIndex !== scrollState.lastEmittedIndex.value) {
            scrollState.lastEmittedIndex.value = targetIndex;
            emit('select', targetIndex);
            scrollState.hasDirectionSwitched.value = true;
        }
    }
}

// 触摸事件处理
function onTouchStart(event: TouchEvent) {
    const scrollLeft = scrollContainer.value?.scrollLeft || 0;
    scrollState.startUserScroll(scrollLeft, props.activeIndex);
    gesture.startGesture(event);
    emit('scroll-start');
    event.stopPropagation();
}

function onTouchEnd(event: TouchEvent) {
    if (!scrollContainer.value) return;

    const currentScrollLeft = scrollContainer.value.scrollLeft;
    const scrollDistance = currentScrollLeft - scrollState.initialScrollLeft.value;
    
    const { shouldSwitch, targetIndex } = panelSwitch.shouldSwitchPanel(
        scrollDistance,
        scrollState.initialActiveIndex.value
    );

    if (shouldSwitch) {
        scrollState.lastEmittedIndex.value = targetIndex;
        emit('select', targetIndex);
        scrollToPanel(targetIndex, true);
    } else {
        if (scrollState.hasDirectionSwitched.value) {
            scrollState.lastEmittedIndex.value = scrollState.initialActiveIndex.value;
            emit('select', scrollState.initialActiveIndex.value);
        }
        scrollToPanel(scrollState.initialActiveIndex.value, true);
    }

    event.stopPropagation();

    setTimeout(() => {
        scrollState.endUserScroll();
        gesture.resetGesture();
        emit('scroll-end');
    }, 100);
}

function onTouchMove(event: TouchEvent) {
    if (!scrollState.isUserScrolling.value) return;

    const { deltaX } = gesture.detectGestureDirection(event);

    if (gesture.gestureDetected.value && gesture.isHorizontalGesture.value) {
        if (event.cancelable) {
            event.preventDefault();
        }
        event.stopPropagation();

        if (scrollContainer.value) {
            const newScrollLeft = scrollState.initialScrollLeft.value - deltaX;
            const maxScrollLeft = scrollContainer.value.scrollWidth - scrollContainer.value.clientWidth;
            scrollContainer.value.scrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollLeft));
        }
    } else if (gesture.gestureDetected.value && !gesture.isHorizontalGesture.value) {
        event.stopPropagation();
    }
}

function onTouchCancel(event: TouchEvent) {
    scrollState.endUserScroll();
    gesture.resetGesture();
    event.stopPropagation();
}

// 暴露方法给父组件
defineExpose({
    scrollToPanel,
    updatePanelWidth
});

// 生命周期
onMounted(() => {
    updatePanelWidth();
    window.addEventListener('resize', updatePanelWidth);

    if (scrollContainer.value) {
        scrollContainer.value.style.touchAction = 'pan-x';
        scrollContainer.value.removeEventListener('touchmove', onTouchMove);
        scrollContainer.value.addEventListener('touchmove', onTouchMove, { passive: false });
    }

    setTimeout(() => {
        scrollToPanel(props.activeIndex, false);
    }, 100);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', updatePanelWidth);
    
    if (scrollContainer.value) {
        scrollContainer.value.removeEventListener('touchmove', onTouchMove);
    }
    
    scrollState.cleanup();
});

// 监听器
watch(() => props.activeIndex, (newIndex) => {
    scrollState.lastEmittedIndex.value = newIndex;

    if (!scrollState.isUserScrolling.value && !scrollState.hasDirectionSwitched.value) {
        scrollToPanel(newIndex, false);
    }
});
</script>

<style scoped>
/* 完全对应原来的 CSS 布局 */
.native-scroll-gesture {
    width: 100%;
    height: 100%;
}

.scroll-container {
    width: 100%;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;

    /* 隐藏滚动条 */
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    /* 优化触摸行为 - 只允许水平平移 */
    touch-action: pan-x;
}

.scroll-container::-webkit-scrollbar {
    display: none;
}

.panels-wrapper {
    display: flex;
    height: 100%;
    /* 计算总宽度：面板宽度 + 左右边距 */
    width: calc(100vw * var(--panel-count) + var(--total-margin));
    /* 添加左边距，右边距通过宽度计算实现 */
    margin-left: var(--left-margin);
}

.panel-item {
    width: 100vw;
    height: 100%;
    flex-shrink: 0;
}
</style>
