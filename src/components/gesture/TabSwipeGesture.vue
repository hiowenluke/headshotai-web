<template>
    <div class="tab-swipe-gesture" ref="gestureRef">
        <div class="tab-container" 
             :style="tabContainerStyle"
             ref="tabContainerRef">
            <div v-for="(tab, index) in tabs" 
                 :key="tab.key" 
                 class="tab-panel"
                 :style="getTabPanelStyle(index)">
                <slot :name="tab.key" :tab="tab" :index="index" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { TabItem } from '@/types/generator';
import { useSwipeGesture } from '@/composables/useSwipeGesture';

interface Props {
    tabs: TabItem[];
    currentTab: string;
    enableSwipe?: boolean; // 是否启用滑动切换，默认为 true
    swipeThreshold?: number; // 触发切换的最小滑动距离（像素）
    swipeMaxTime?: number; // 切换滑动的最大时间（毫秒）
    gestureDisabled?: boolean; // 是否禁用手势，由父组件控制
}

const props = withDefaults(defineProps<Props>(), {
    enableSwipe: true,
    swipeThreshold: 12, // 进一步降低默认阈值，让滑动切换更灵敏
    swipeMaxTime: 600,
    gestureDisabled: false
});

const emit = defineEmits<{
    tabChange: [key: string];
    swipeStart: [];
    swipeMove: [offset: number];
    swipeEnd: [];
}>();

const gestureRef = ref<HTMLElement | null>(null);
const tabContainerRef = ref<HTMLElement | null>(null);

// 手势状态
const isTabSwitching = ref(false);

// 当前标签页索引（来自父组件的受控状态）
const currentTabIndex = computed(() => props.tabs.findIndex(t => t.key === props.currentTab));

// 本地追踪的活动索引，避免快速滑动时等待外部状态同步
const activeTabIndex = ref(currentTabIndex.value >= 0 ? currentTabIndex.value : 0);

watch(currentTabIndex, (idx) => {
    activeTabIndex.value = idx >= 0 ? idx : 0;
});

// 使用通用滑动手势处理
const { state: swipeState } = useSwipeGesture(gestureRef, {
    enableSwipe: props.enableSwipe,
    swipeThreshold: props.swipeThreshold,
    swipeMaxTime: props.swipeMaxTime,
    gestureDisabled: props.gestureDisabled,
    // 更容易锁定为水平，提升识别率
    directionLockMinDx: 10,
    horizontalDominanceRatio: 1.2
}, {
    onSwipeStart: () => {
        isTabSwitching.value = false;
        emit('swipeStart');
    },
    onSwipeMove: (offset: number) => {
        emit('swipeMove', offset);
    },
    onSwipeEnd: () => {
        emit('swipeEnd');
    },
    onSwipeLeft: () => {
        // 向左滑动，切换到后一个 tab
        const baselineIdx = activeTabIndex.value;
        const newIdx = baselineIdx < props.tabs.length - 1 
            ? baselineIdx + 1 
            : 0;
        const newKey = props.tabs[newIdx].key;
        switchTab(newKey);
        return true;
    },
    onSwipeRight: () => {
        // 向右滑动，切换到前一个 tab
        const baselineIdx = activeTabIndex.value;
        const newIdx = baselineIdx > 0 
            ? baselineIdx - 1 
            : props.tabs.length - 1;
        const newKey = props.tabs[newIdx].key;
        switchTab(newKey);
        return true;
    },
    onSwipeCancel: () => {
        // 回弹到当前位置
        isTabSwitching.value = true;
        setTimeout(() => {
            isTabSwitching.value = false;
        }, 300);
    }
});

// 标签容器样式
const tabContainerStyle = computed(() => {
    if (!props.enableSwipe || !props.tabs.length) {
        return {};
    }
    
    const translateX = -(activeTabIndex.value * swipeState.value.containerWidth) + 
                     swipeState.value.swipeOffset;
    
    return {
        transform: `translateX(${translateX}px)`,
        transition: isTabSwitching.value ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
        width: `${props.tabs.length * swipeState.value.containerWidth}px`,
        display: 'flex',
        height: '100%'
    };
});

// 获取标签面板样式
const getTabPanelStyle = (index: number) => {
    if (!props.enableSwipe || !props.tabs.length) {
        // 如果未启用滑动，使用原来的显示/隐藏逻辑
        return {
            display: activeTabIndex.value === index ? 'block' : 'none',
            width: '100%',
            height: '100%'
        };
    }
    
    return {
        width: `${swipeState.value.containerWidth}px`,
        height: '100%',
        flexShrink: 0,
        position: 'relative' as const,
        overflow: 'hidden' as const
    };
};

// 切换标签
const switchTab = (key: string) => {
    if (!props.enableSwipe) {
        // 没有启用滑动时，直接切换
        emit('tabChange', key);
        return;
    }

    const idx = props.tabs.findIndex(t => t.key === key);
    if (idx >= 0) {
        activeTabIndex.value = idx;
    }

    // 启用滑动动画
    isTabSwitching.value = true;

    emit('tabChange', key);

    // 动画完成后重置状态
    setTimeout(() => {
        isTabSwitching.value = false;
    }, 300);
};

// 监听当前标签变化（包含外部触发的切换，例如 ButtonArea 或标题点击）
watch(() => props.currentTab, () => {
    const idx = props.tabs.findIndex(t => t.key === props.currentTab);
    if (idx >= 0) {
        activeTabIndex.value = idx;
    }
    // 对外部切换也启用滑动动画，以保持一致的视觉反馈
    isTabSwitching.value = true;
    setTimeout(() => {
        isTabSwitching.value = false;
    }, 300);
});
</script>

<style scoped>
.tab-swipe-gesture {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.tab-container {
    height: 100%;
    will-change: transform;
    position: relative;
}

.tab-panel {
    height: 100%;
    position: relative;
}
</style>
