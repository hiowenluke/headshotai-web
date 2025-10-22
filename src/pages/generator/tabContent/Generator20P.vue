<template>
    <div class="gen-wrapper" ref="wrapperRef">
        <div class="gen-body">
            <OptionsCardsArea
                :cardsInfos="cardsInfos"
                @openPopup="handleOpenPopup"
                @checkboxChange="handleCheckboxChange"
                instanceKey="tab-20P-options"
                ref="optionsCardsAreaRef"
            />
        </div>
        
        <!-- Options Pages -->
        <BackdropsPage
            :is-open="showBackdropsPage"
            :plan="currentPopupArgs?.plan ?? planLabel"
            :initial-selection="backdropsSelection"
            @close="handleBackdropsClose"
            @apply="handleBackdropsApply"
        />
        
        <HairstylesPage
            :is-open="showHairstylesPage"
            :plan="currentPopupArgs?.plan ?? planLabel"
            :initial-selection="hairstylesSelection"
            @close="handleHairstylesClose"
            @apply="handleHairstylesApply"
        />
        
        <OutfitsPage
            :is-open="showOutfitsPage"
            :plan="currentPopupArgs?.plan ?? planLabel"
            :initial-selection="outfitsSelection"
            @close="handleOutfitsClose"
            @apply="handleOutfitsApply"
        />
        
        <PosesPage
            :is-open="showPosesPage"
            :plan="currentPopupArgs?.plan ?? planLabel"
            :initial-selection="posesSelection"
            @close="handlePosesClose"
            @apply="handlePosesApply"
        />

        <ConfirmDialog
            :open="showNoNeedInfoDialog"
            title="Hairstyles"
            message="Selecting &quot;No Need&quot; means the generated portraits will reuse the hairstyles from your uploaded photos."
            confirm-text="Got It"
            :show-cancel="false"
            @confirm="acknowledgeNoNeedDialog"
            @close="handleNoNeedDialogClose"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed, reactive, defineAsyncComponent } from 'vue';
import OptionsCardsArea from '@/components/layout/OptionsCardsArea/index.vue';
import ConfirmDialog from '@/components/dialog/ConfirmDialog.vue';
import { uiState } from '@/state/uiState';

// 选项页面 - 懒加载（用户点击时才加载）
const BackdropsPage = defineAsyncComponent(() => 
  import('@/pages/generator/optionsPages/BackdropsPage.vue')
);
const HairstylesPage = defineAsyncComponent(() => 
  import('@/pages/generator/optionsPages/HairstylesPage.vue')
);
const OutfitsPage = defineAsyncComponent(() => 
  import('@/pages/generator/optionsPages/OutfitsPage.vue')
);
const PosesPage = defineAsyncComponent(() => 
  import('@/pages/generator/optionsPages/PosesPage.vue')
);

// 组件属性
interface Props {
    demoFaces?: string[];
    image?: string | null;
    selectedPlan: string;

}

const props = withDefaults(defineProps<Props>(), {
    image: null,
    demoFaces: () => []
});

const previewImage = ref<string | null>(null);

// 相关 DOM 引用
const wrapperRef = ref<HTMLElement | null>(null);
const optionsCardsAreaRef = ref<any>(null);

interface SelectionResult {
    total: number;
    selections: Record<string, string[]>;
    selectedUrls: string[];
}

const generating = ref(false);
const showNoNeedInfoDialog = ref(false);
const NO_NEED_DIALOG_FALLBACK_KEY = '20P_hairstyles_no_need_dialog_seen';
const noNeedDialogStorageKey = ref(NO_NEED_DIALOG_FALLBACK_KEY);

// 弹窗状态 - 使用持久化状态
const showBackdropsPage = computed({
  get: () => uiState.showBackdropsPage ?? false,
  set: (value: boolean) => {
    uiState.showBackdropsPage = value;
  }
});
const showHairstylesPage = ref(false);
const showOutfitsPage = ref(false);
const showPosesPage = ref(false);

const currentPopupArgs = ref<any>(null);
const backdropsSelection = ref<Record<string, string[]>>({});
const hairstylesSelection = ref<Record<string, string[]>>({});
const outfitsSelection = ref<Record<string, string[]>>({});
const posesSelection = ref<Record<string, string[]>>({});
const backdropsSelectedUrls = ref<string[]>([]);
const hairstylesSelectedUrls = ref<string[]>([]);
const outfitsSelectedUrls = ref<string[]>([]);
const posesSelectedUrls = ref<string[]>([]);

const planTotal = computed(() => {
    const match = (props.selectedPlan || '').match(/\d+/);
    const value = match ? parseInt(match[0], 10) : 20;
    return Number.isFinite(value) && value > 0 ? value : 20;
});

const planLabel = computed(() => `${planTotal.value}P`);

const selectionCounts = reactive<Record<string, number>>({
    Backdrops: 0,
    Poses: 0,
    Outfits: 0,
    Hairstyles: 0
});

const cardDefinitions = [
    {
        key: 'Backdrops',
        title: 'Backdrops',
        coverUrl: '/images/demo/cardsCovers/20P/backdrop.webp',
        popup: 'pages/generator/optionsPages/BackdropsPage.vue',
        arguments: {}
    },
    {
        key: 'Poses',
        title: 'Poses',
        coverUrl: '/images/demo/cardsCovers/20P/pose.webp',
        popup: 'pages/generator/optionsPages/PosesPage.vue',
        arguments: {}
    },
    {
        key: 'Outfits',
        title: 'Outfits',
        coverUrl: '/images/demo/cardsCovers/20P/outfit.webp',
        popup: 'pages/generator/optionsPages/OutfitsPage.vue',
        arguments: { checkboxLabel: 'With Tie', optionKey: '20P-outfits-with-tie' }
    },
    {
        key: 'Hairstyles',
        title: 'Hairstyles',
        coverUrl: '/images/demo/cardsCovers/20P/hairstyle.webp',
        popup: 'pages/generator/optionsPages/HairstylesPage.vue',
        arguments: { checkboxLabel: 'No Need', optionKey: '20P-hairstyles-no-need' }
    }
] as const;

const cardsInfos = computed(() => cardDefinitions.map((card) => ({
    title: card.title,
    counter: `${selectionCounts[card.key] ?? 0}`,
    coverUrl: card.coverUrl,
    popup: card.popup,
    arguments: {
        ...card.arguments,
        plan: planLabel.value
    }
})));

// 监听 image prop 变化
watch(() => props.image, (v: string | null | undefined) => { previewImage.value = v ?? null; }, { immediate: true });

const handleGenerate = async () => { 
    generating.value = true; 
    setTimeout(() => { generating.value = false; }, 1500); 
};

// 处理打开子窗口
const handleOpenPopup = (popup: string, args: Record<string, any>) => {
    // 保存当前卡片的参数
    currentPopupArgs.value = args;
    
    // 根据 popup 字段判断打开哪个页面
    if (popup && popup.includes('BackdropsPage')) {
        showBackdropsPage.value = true;
    } else if (popup && popup.includes('HairstylesPage')) {
        showHairstylesPage.value = true;
    } else if (popup && popup.includes('OutfitsPage')) {
        showOutfitsPage.value = true;
    } else if (popup && popup.includes('PosesPage')) {
        showPosesPage.value = true;
    }
};

const getDialogStorageKey = (key?: string) => key || NO_NEED_DIALOG_FALLBACK_KEY;

const hasSeenNoNeedDialog = (key?: string) => {
    const storageKey = getDialogStorageKey(key);
    try {
        return window.localStorage.getItem(storageKey) === '1';
    } catch (err) {
        console.warn('[Generator20P] Failed to read dialog flag from localStorage', err);
        return false;
    }
};

const markNoNeedDialogSeen = (key?: string) => {
    const storageKey = getDialogStorageKey(key);
    try {
        window.localStorage.setItem(storageKey, '1');
    } catch (err) {
        console.warn('[Generator20P] Failed to persist dialog flag', err);
    }
};

interface CheckboxChangePayload {
    card: {
        title: string;
        arguments?: Record<string, any>;
    };
    checked: boolean;
}

const handleCheckboxChange = ({ card, checked }: CheckboxChangePayload) => {
    if (!checked) return;
    if (!card || card.title !== 'Hairstyles') return;
    if (card.arguments?.checkboxLabel !== 'No Need') return;

    const storageKey = card.arguments?.optionKey as string | undefined;
    if (hasSeenNoNeedDialog(storageKey)) return;

    noNeedDialogStorageKey.value = getDialogStorageKey(storageKey);
    showNoNeedInfoDialog.value = true;
};

const acknowledgeNoNeedDialog = () => {
    markNoNeedDialogSeen(noNeedDialogStorageKey.value);
    showNoNeedInfoDialog.value = false;
};

const handleNoNeedDialogClose = () => {
    showNoNeedInfoDialog.value = false;
};

// Backdrops 事件处理
const handleBackdropsApply = (payload: SelectionResult) => {
    const urls = payload?.selectedUrls ?? [];
    selectionCounts.Backdrops = payload?.total ?? urls.length;
    backdropsSelection.value = payload?.selections || {};
    backdropsSelectedUrls.value = urls;
};

const handleBackdropsClose = (payload?: SelectionResult) => {
    if (payload) {
        handleBackdropsApply(payload);
    }
    showBackdropsPage.value = false;
};

// Hairstyles 事件处理
const handleHairstylesApply = (payload: SelectionResult) => {
    const urls = payload?.selectedUrls ?? [];
    selectionCounts.Hairstyles = payload?.total ?? urls.length;
    hairstylesSelection.value = payload?.selections || {};
    hairstylesSelectedUrls.value = urls;
};

const handleHairstylesClose = (payload?: SelectionResult) => {
    if (payload) {
        handleHairstylesApply(payload);
    }
    showHairstylesPage.value = false;
};

// Outfits 事件处理
const handleOutfitsApply = (payload: SelectionResult) => {
    const urls = payload?.selectedUrls ?? [];
    selectionCounts.Outfits = payload?.total ?? urls.length;
    outfitsSelection.value = payload?.selections || {};
    outfitsSelectedUrls.value = urls;
};

const handleOutfitsClose = (payload?: SelectionResult) => {
    if (payload) {
        handleOutfitsApply(payload);
    }
    showOutfitsPage.value = false;
};

// Poses 事件处理
const handlePosesApply = (payload: SelectionResult) => {
    const urls = payload?.selectedUrls ?? [];
    selectionCounts.Poses = payload?.total ?? urls.length;
    posesSelection.value = payload?.selections || {};
    posesSelectedUrls.value = urls;
};

const handlePosesClose = (payload?: SelectionResult) => {
    if (payload) {
        handlePosesApply(payload);
    }
    showPosesPage.value = false;
};



// 组件挂载时初始化
onMounted(async () => {
    await nextTick();
    
    // 从新用户设置初始化 counter
    try {
        const { getOptionsCardSelNumber } = await import('@/state/newUserSettings');
        const defaultCounts = getOptionsCardSelNumber('20P');
        
        // 只在 counter 为 0 时设置默认值（表示第一次访问）
        if (selectionCounts.Backdrops === 0) {
            selectionCounts.Backdrops = defaultCounts.backdrops;
        }
        if (selectionCounts.Hairstyles === 0) {
            selectionCounts.Hairstyles = defaultCounts.hairstyles;
        }
        if (selectionCounts.Outfits === 0) {
            selectionCounts.Outfits = defaultCounts.outfits;
        }
        if (selectionCounts.Poses === 0) {
            selectionCounts.Poses = defaultCounts.poses;
        }
    } catch (e) {
        // 如果设置未加载，不设置默认值
        // 用户需要手动选择
        console.warn('New user settings not available, user will need to select manually:', e);
    }
});

// 暴露给父组件的方法
defineExpose({
    handleGenerate,
    getSelectedOptionUrls: () => ({
        backdrops: backdropsSelectedUrls.value.slice(),
        hairstyles: hairstylesSelectedUrls.value.slice(),
        outfits: outfitsSelectedUrls.value.slice(),
        poses: posesSelectedUrls.value.slice()
    })
});
</script>

<style scoped>
/* 生成器主体样式 */
.gen-wrapper {
    color: #fff;
    width: 100%;
    /* 使用容器的可用高度，而不是整个视口 */
    height: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
    --fs-normal-text: 16.5px;
    --fs-small-text: 15.4px;
    --fs-btn-large: 23.4px;
    --fs-tab: 20px;
}

.gen-body {
    /* 使用 flex: 1 让 PreviewImageArea 占用除 FixedBottomArea 外的所有空间 */
    flex: 1;
    overflow: hidden;
    position: relative;
    /* 确保触摸事件可以传播到父级模态框的手势处理器 */
    touch-action: none;
    pointer-events: auto;
}

/* 移除响应式代码 - 只支持移动端 */
</style>