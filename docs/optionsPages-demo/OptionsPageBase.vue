<template>
    <PageLikeModal 
        :is-open="isOpen" 
        modal-style="x" 
        :page-title="pageTitle"
        modal-type="options-page"
        :show-main-menu="true"
        :show-sub-menu="showSubMenu"
        :menus="menuNames"
        :active-index="activeIndex"
        :has-sub-menus="hasSubMenus"
        :current-sub-menus="currentSubMenus"
        :active-sub-index="activeSubIndex"
        transparent-blur-header
        @close="handleClose"
        @select="handleMainMenuSelect"
        @select-sub="handleSubMenuSelect"
        @scroll-to-top="scrollToTop"
    >
        <template #toolbar-end>
            <span class="selected-counter">{{ selectedCount }}</span>
        </template>
        
        <!-- 内容区域 -->
        <CategoryPanels 
            ref="categoryPanelsRef"
            :menus="flatMenus" 
            :active-index="currentFlatIndex" 
            :card-data-map="cardDataMap"
            :no-more-map="noMoreMap"
            :infinite-disabled-map="infiniteDisabledMap" 
            :loading-first-map="loadingFirstPageMap"
            :loading-more-map="loadingMoreMap" 
            :load-category="loadCategory" 
            :prefetch-distance="1" 
            :use-fixed-position="false"
            header-selector=".plm-header .navbar-wrapper"
            apply-absolute-padding
            :additional-header-offset="10"
            enable-prefetch
            card-selectable
            :initial-selected-map="selectedMap"
            :instance-key="instanceKey"
            @select="handleFlatMenuSelect" 
            @open="handleItemSelect" 
            @load-more="handleLoadMore"
            @card-toggle="handleCardToggle"
            @prefetch-skip="onPrefetchSkip" 
        />
    </PageLikeModal>
</template>

<script setup lang="ts">
import { ref, toRef } from 'vue';
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';
import CategoryPanels from '@/components/category/CategoryPanels.vue';
import { useBackdropMenus, type MenuItemConfig } from './composables/useBackdropMenus';
import { useOptionsData } from './composables/useOptionsData';
import { useBackdropSelection } from './composables/useBackdropSelection';
import { useBackdropLifecycle } from './composables/useBackdropLifecycle';
import { getOptionsCardSelNumber } from '@/state/newUserSettings';

interface Props {
    isOpen: boolean;
    pageTitle: string;
    optionType: 'backdrops' | 'hairstyles' | 'outfits' | 'poses';
    menuConfig?: MenuItemConfig[];
    plan?: string;
    initialSelection?: Record<string, string[]>;
    instanceKey?: string; // 实例唯一标识，用于区分不同页面的布局缓存
}

const props = withDefaults(defineProps<Props>(), {
    plan: '20P',
    initialSelection: () => ({}),
    instanceKey: 'options-default'
});

interface SelectionResult {
    total: number;
    selections: Record<string, string[]>;
    selectedUrls: string[];
}

const emit = defineEmits<{
    close: [payload: SelectionResult];
    apply: [payload: SelectionResult];
}>();

// 模板引用
const categoryPanelsRef = ref<any>(null);

// 获取默认选择数量
const getDefaultSelectionCount = () => {
    try {
        // 验证 plan 值
        const validPlans = ['20P', '40P', '80P'] as const;
        const plan = props.plan as string;
        
        // 如果 plan 不在支持列表中（如 1P），静默返回 undefined
        // 这些 plan 不使用选项卡功能，不需要默认选择
        if (!validPlans.includes(plan as any)) {
            return undefined;
        }
        
        // 尝试从已加载的设置中获取
        const counts = getOptionsCardSelNumber(plan as '20P' | '40P' | '80P');
        return counts[props.optionType];
    } catch (e) {
        // 如果设置未加载，静默返回 undefined
        // 不会自动选择卡片，用户需要手动选择
        return undefined;
    }
};

// 使用 composables
const menuManagement = useBackdropMenus(props.menuConfig);
const defaultCount = getDefaultSelectionCount();
const dataManagement = useOptionsData(props.optionType, props.initialSelection, defaultCount);
const selectionManagement = useBackdropSelection(props.initialSelection);

// 解构需要的状态和方法
const {
    flatMenus,
    currentFlatIndex,
    activeIndex,
    activeSubIndex,
    showSubMenu,
    menuNames,
    hasSubMenus,
    currentSubMenus,
    handleMainMenuSelect,
    handleSubMenuSelect,
    handleFlatMenuSelect
} = menuManagement;

const {
    cardDataMap,
    noMoreMap,
    infiniteDisabledMap,
    loadingFirstPageMap,
    loadingMoreMap,
    loadCategory,
    getDefaultSelection,
    isFirstVisit
} = dataManagement;

const {
    selectedMap,
    selectedCount,
    handleCardToggle,
    cloneSelection,
    initializeSelection
} = selectionManagement;

// 生命周期设置
useBackdropLifecycle(
    toRef(props, 'isOpen'),
    currentFlatIndex,
    flatMenus,
    async (category: string) => {
        // 先加载数据
        await loadCategory(category);
        
        // 如果是第一次访问且还没有选择，应用默认选择
        if (isFirstVisit && Object.keys(selectedMap.value).length === 0) {
            const defaultSelection = getDefaultSelection();
            if (Object.keys(defaultSelection).length > 0) {
                initializeSelection(defaultSelection);
            }
        }
    }
);

// 事件处理
function buildSelectionResult(): SelectionResult {
    const selections = cloneSelection(selectedMap.value);
    const selectedUrls = Object.values(selections).flat();
    return {
        total: selectedCount.value,
        selections,
        selectedUrls
    };
}

function handleClose() {
    const payload = buildSelectionResult();
    emit('apply', payload);
    emit('close', payload);
}

function scrollToTop() {
    categoryPanelsRef.value?.scrollToTop?.();
}

function handleItemSelect(item: any) {
    console.log('Selected item:', item);
}

function handleLoadMore(payload: { event: any; category: string }) {
    console.log('Load more:', payload.category);
    payload.event.target.complete();
}

function onPrefetchSkip(category: string) {
    console.log('Prefetch skip:', category);
}
</script>

<style scoped>
/* 选项页面通用样式 */
:deep(.v-mode-content) {
    --offset-top: 0 !important;
}

.selected-counter {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.88);
    font-weight: 500;
    padding-top: 6px;
    padding-right: 10px;
}
</style>
