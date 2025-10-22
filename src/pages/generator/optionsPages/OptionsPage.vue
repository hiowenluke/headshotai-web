<template>
    <PageLikeModal
        :is-open="isOpen"
        :page-title="pageTitle"
        modal-style="h"
        modal-type="options-page"
        :disable-content-scroll="false"
        @close="handleClose"
    >
        <template #toolbar-end>
            <span class="selected-counter">{{ selectedUrls.length }}</span>
        </template>

        <GroupedCardList
            :items="cardItems"
            :base-url="baseUrl"
            :selected-urls="selectedUrls"
            :selectable="true"
            :show-file-name="true"
            :folder-style="folderStyle"
            :loading="loading"
            :error="error"
            :show-retry="true"
            :loading-text="loadingText"
            :empty-text="emptyText"
            @toggle="handleToggle"
            @retry="loadOptions"
        />
    </PageLikeModal>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';
import GroupedCardList from '@/components/cardList/GroupedCardList.vue';
import { fetchDemoOptionsImages } from '@/services/imageService';

interface Props {
    isOpen: boolean;
    optionType: 'backdrops' | 'hairstyles' | 'outfits' | 'poses'; // 选项类型
    pageTitle: string; // 页面标题
    plan?: string;
    initialSelection?: Record<string, string[]>;
    sourceContext?: string; // 来源上下文标识
    folderStyle?: boolean; // 是否使用文件夹样式
}

const props = withDefaults(defineProps<Props>(), {
    plan: '20P',
    initialSelection: () => ({}),
    sourceContext: 'default',
    folderStyle: false
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

// 状态
const cardItems = ref<Array<{ url: string }>>([]);
const selectedUrls = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// 计算属性
const baseUrl = `images/demo/options/${props.optionType}`;
const loadingText = `Loading ${props.pageTitle.toLowerCase()}...`;
const emptyText = `No ${props.pageTitle.toLowerCase()} available.`;

/**
 * 获取 localStorage 的 key
 */
const getStorageKey = () => {
    return `${props.optionType}_selection_${props.sourceContext}`;
};

/**
 * 保存选择到 localStorage
 */
const saveToLocalStorage = () => {
    try {
        const key = getStorageKey();
        localStorage.setItem(key, JSON.stringify(selectedUrls.value));
        console.log(`[OptionsPage:${props.optionType}] Saved to localStorage:`, {
            key,
            count: selectedUrls.value.length
        });
    } catch (error) {
        console.error(`[OptionsPage:${props.optionType}] Failed to save to localStorage:`, error);
    }
};

/**
 * 从 localStorage 加载选择
 */
const loadFromLocalStorage = () => {
    try {
        const key = getStorageKey();
        const saved = localStorage.getItem(key);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                selectedUrls.value = parsed;
                console.log(`[OptionsPage:${props.optionType}] Loaded from localStorage:`, {
                    key,
                    count: parsed.length
                });
                return true;
            }
        }
    } catch (error) {
        console.error(`[OptionsPage:${props.optionType}] Failed to load from localStorage:`, error);
    }
    return false;
};

/**
 * 加载选项数据
 */
const loadOptions = async () => {
    loading.value = true;
    error.value = null;

    try {
        const result = await fetchDemoOptionsImages({
            type: props.optionType,
            category: 'all',
            page: 1,
            perPage: 1000
        });

        console.log(`[OptionsPage:${props.optionType}] API response:`, {
            total: result.total,
            hasMore: result.hasMore,
            imagesCount: result.images.length
        });

        cardItems.value = result.images.map(url => ({ url }));
    } catch (err: any) {
        console.error(`[OptionsPage:${props.optionType}] Failed to load:`, err);
        error.value = err.message || `Failed to load ${props.pageTitle.toLowerCase()}`;
    } finally {
        loading.value = false;
    }
};

/**
 * 处理图片选择切换
 */
const handleToggle = (url: string) => {
    const index = selectedUrls.value.indexOf(url);
    if (index >= 0) {
        selectedUrls.value.splice(index, 1);
    } else {
        selectedUrls.value.push(url);
    }
    saveToLocalStorage();
};

/**
 * 构建选择结果
 */
const buildSelectionResult = (): SelectionResult => {
    const selections: Record<string, string[]> = {};
    
    selectedUrls.value.forEach(url => {
        const relativePath = url.replace(`images/demo/options/${props.optionType}/`, '').replace(/^\/+/, '');
        const parts = relativePath.split('/');
        if (parts.length >= 2) {
            const category = parts[0];
            if (!selections[category]) {
                selections[category] = [];
            }
            selections[category].push(url);
        }
    });

    return {
        total: selectedUrls.value.length,
        selections,
        selectedUrls: selectedUrls.value.slice()
    };
};

/**
 * 处理关闭
 */
const handleClose = () => {
    const payload = buildSelectionResult();
    emit('apply', payload);
    emit('close', payload);
};

/**
 * 初始化选中状态
 */
const initializeSelection = () => {
    const loadedFromStorage = loadFromLocalStorage();
    if (loadedFromStorage) {
        console.log(`[OptionsPage:${props.optionType}] Initialized from localStorage`);
        return;
    }

    if (!props.initialSelection || Object.keys(props.initialSelection).length === 0) {
        selectedUrls.value = [];
        return;
    }

    const urls: string[] = [];
    Object.values(props.initialSelection).forEach(categoryUrls => {
        urls.push(...categoryUrls);
    });
    selectedUrls.value = urls;
    saveToLocalStorage();
};

// 监听 isOpen 变化
watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        initializeSelection();
        if (cardItems.value.length === 0) {
            loadOptions();
        }
    }
}, { immediate: true });

// 组件挂载时加载数据
onMounted(() => {
    if (props.isOpen) {
        loadOptions();
    }
});
</script>

<style scoped>
.selected-counter {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.88);
    font-weight: 500;
    padding-top: 6px;
    padding-right: 10px;
}
</style>
