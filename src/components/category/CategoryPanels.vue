<template>
    <div class="category-panels" :style="cssVars">
        <NativeScrollGesture 
            ref="gestureRef"
            v-show="listVisible"
            :items="menus"
            :active-index="activeIndex"
            :get-item-key="(menu: MenuItem) => menu.category"
            @select="(index: number) => $emit('select', index)">
            <template #default="{ item: menu, index }">
                <div class="panel-content" 
                     :ref="(el: any) => wrappedSetPanelRef(el, index)"
                     @scroll="onPanelScroll">
                    <!-- 卡片列表 -->
                    <CardList
                        :items="cardDataMap[menu.category] || []"
                        :use-infinite="true"
                        :disabled="infiniteDisabledMap[menu.category]"
                        :loading-more="loadingMoreMap?.[menu.category]"
                        :loading="loadingFirstMap?.[menu.category]"
                        :no-more="noMoreMap[menu.category]"
                        :selectable="props.cardSelectable"
                        :clickable="true"
                        :selected-items="getSelectedList(menu.category)"
                        @load-more="(event) => $emit('load-more', { event, category: menu.category })"
                        @open="(item) => onCardOpen(menu.category, item)"
                        @toggle="(item) => onCardToggle(menu.category, item)"
                    />
                    
                    <!-- 透明占位块，保持底部间距 -->
                    <div class="card-list-spacer" style="height: 40px;"></div>
                </div>
            </template>
        </NativeScrollGesture>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import CardList from '@/components/cardList/CardList.vue';
import NativeScrollGesture from '@/components/gesture/NativeScrollGesture.vue';
import { useCardSelection } from './composables/useCardSelection';
import { useHeaderPadding } from './composables/useHeaderPadding';
import { usePanelScroll } from './composables/usePanelScroll';
import { useVerticalBounce } from './composables/useVerticalBounce';

export interface MenuItem {
    name: string;
    category: string;
}

const props = withDefaults(defineProps<{
    menus: MenuItem[];
    activeIndex: number;
    cardDataMap: Record<string, any[]>;
    infiniteDisabledMap: Record<string, boolean>;
    noMoreMap: Record<string, boolean>;
    loadingMoreMap?: Record<string, boolean>;
    loadingFirstMap?: Record<string, boolean>;
    loadCategory?: (category: string) => void;
    prefetchDistance?: number;
    enablePrefetch?: boolean;
    debugMode?: boolean;
    headerPadding?: number; // 固定的 header padding 值
    autoDetectHeader?: boolean; // 是否自动检测 header 高度，默认 true
    headerSelector?: string; // header 选择器，默认 '.home-header'（主页）或 '.plm-header'（模态框）
    useFixedPosition?: boolean; // 是否使用 fixed 定位，默认 true（主页），在 Modal 内应设为 false
    applyAbsolutePadding?: boolean; // 在 useFixedPosition=false 时是否仍应用 header padding
    additionalHeaderOffset?: number; // 额外增加的 header 顶部偏移量
    cardSelectable?: boolean; // 是否允许点击卡片进行选择
    initialSelectedMap?: Record<string, string[]>; // 初始选中状态
}>(), {
    autoDetectHeader: true,
    headerSelector: '.home-header',
    useFixedPosition: true,
    applyAbsolutePadding: false,
    additionalHeaderOffset: 0,
    cardSelectable: false,
    initialSelectedMap: () => ({})
});

const emit = defineEmits<{
    select: [index: number];
    'load-more': [{ event: any; category: string }];
    open: [item: any];
    'prefetch-skip': [category: string];
    'card-toggle': [{ category: string; url: string; selected: boolean; selectedList: string[] }];
    'selection-change': [{ category: string; selectedList: string[] }];
}>();

// 模板引用
const gestureRef = ref<any>(null);

// 使用卡片选择管理
const { getSelectedList, onCardToggle, getSelectedMap } = useCardSelection(
    props.initialSelectedMap,
    emit
);

// 使用 Header 高度计算
const { listVisible, cssVars, updateHeaderPadding, waitForHeaderStable } = useHeaderPadding(
    {
        headerPadding: props.headerPadding,
        autoDetectHeader: props.autoDetectHeader,
        headerSelector: props.headerSelector,
        useFixedPosition: props.useFixedPosition,
        applyAbsolutePadding: props.applyAbsolutePadding,
        additionalHeaderOffset: props.additionalHeaderOffset
    },
    gestureRef
);

// 使用面板滚动处理
const { panelRefs, setPanelRef, onPanelScroll, scrollToTop } = usePanelScroll(
    () => ({
        activeIndex: props.activeIndex,
        menus: props.menus,
        infiniteDisabledMap: props.infiniteDisabledMap,
        noMoreMap: props.noMoreMap,
        loadingMoreMap: props.loadingMoreMap
    }),
    emit
);

// 使用垂直弹性回弹
const { enableBounce, cleanup: cleanupBounce, isIOS } = useVerticalBounce();

// 包装 setPanelRef，添加弹性回弹功能
const wrappedSetPanelRef = (el: any, index: number) => {
    setPanelRef(el, index);
    
    // 为面板启用垂直弹性回弹
    if (el && el instanceof HTMLElement) {
        enableBounce(el);
    }
};

// 卡片打开处理
function onCardOpen(category: string, item: string) {
    if (props.cardSelectable) {
        onCardToggle(category, item);
    } else {
        emit('open', item);
    }
}

// 初始化
onMounted(() => {
    waitForHeaderStable(props.activeIndex);

    // macOS Chrome 滚动优化
    const isMacChrome =
        navigator.userAgent.includes('Mac') && navigator.userAgent.includes('Chrome');
    if (isMacChrome) {
        setTimeout(() => {
            panelRefs.value.forEach((panel) => {
                if (panel && panel.scrollHeight <= panel.clientHeight) {
                    // 面板内容不足以滚动时的处理
                }
            });
        }, 1000);
    }
});

// 清理
onBeforeUnmount(() => {
    cleanupBounce();
});

// 暴露方法给父组件
defineExpose({
    scrollToTop,
    updateHeaderPadding,
    getSelectedMap
});
</script>

<style scoped>
/* 默认样式（主页，使用 fixed 定位） */
.category-panels {
    width: 100%;
    position: fixed;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 1;
}

/* Modal 内部样式（使用绝对定位，固定在 ion-content 顶部） */
.category-panels[style*="--use-fixed-position: 0"] {
    position: absolute;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.panel-content {
    width: 100%;
    height: 100%;
    
    /* 垂直滚动 */
    overflow-y: auto;
    overflow-x: hidden;
    
    /* 内容从 Header 下方开始 */
    padding-top: var(--panel-padding-top, var(--header-padding, 90px));
    padding-bottom: 40px;

    /* 允许垂直滚动，但让父级处理水平手势 */
    touch-action: pan-y pinch-zoom;
    
    /* ion-infinite-scroll 识别 */
    --overflow: auto;
}

/* 透明占位块 */
.card-list-spacer {
    width: 100%;
    background: transparent;
    flex-shrink: 0;
}
</style>
