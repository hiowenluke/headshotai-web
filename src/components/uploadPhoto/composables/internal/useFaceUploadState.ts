import { ref, computed } from 'vue';
import { authState } from '@/state/authState';
import { markUserHasUploadedFaces, hasUserUploadedFacesHistory } from '../../utils/recentFacesCache';
import { loadDemoFacesCache } from '../../utils/demoFacesCache';
import { loadFaceSelection } from '@/pages/uploadedPhotos/faceSelectionCache';
import type {
    FaceUploadControllerProps,
    FaceUploadControllerEmit,
    FaceUploadState,
    UploadAreaInstance,
    ThumbBarInstance
} from '../../types';

export const useFaceUploadState = (
    props: FaceUploadControllerProps,
    emit: FaceUploadControllerEmit
): FaceUploadState => {
    const useUploadWithDemo = ref(true);
    const hasEverUploaded = ref(hasUserUploadedFacesHistory());
    const uploadAreaRef = ref<UploadAreaInstance | null>(null);
    const thumbBarRef = ref<ThumbBarInstance | null>(null);

    const selectedDemoFaces = ref<string[]>([]);
    const fallbackDemoFaces = ref<string[]>([]);
    
    // "faces 上传图片列表"：从服务端获取的最新上传的图片 URL（最多 4 张）
    const recentUploadedUrls = ref<string[]>([]);
    
    // "faces 选中图片列表"：用户选中的图片 URL（从 localStorage 加载）
    const selectedUploadedUrls = ref<string[]>([]);
    
    const syncingRecentUploads = ref(false);
    const abortController = ref<AbortController | null>(null);

    const planKey = computed(() => props.plan ?? '1P');
    const isPhotoUploadPlan = computed(() => planKey.value === '1P' || planKey.value === '20P');
    
    // FaceThumbBar 显示的图片列表（最多 4 张）
    // 逻辑：优先显示选中的图片，不足 4 张时用最新上传的图片补充
    const uploadedImageUrls = computed(() => {
        const selected = selectedUploadedUrls.value.slice(0, MAX_THUMBS);
        if (selected.length >= MAX_THUMBS) {
            return selected;
        }
        
        // 不足 4 张，用最新上传的图片补充（排除已选中的）
        const selectedSet = new Set(selected);
        const additional = recentUploadedUrls.value.filter(url => !selectedSet.has(url));
        const result = [...selected, ...additional].slice(0, MAX_THUMBS);
        
        console.log('[useFaceUploadState] uploadedImageUrls computed:', {
            selected: selected.length,
            additional: additional.length,
            result: result.length,
            urls: result
        });
        
        return result;
    });
    
    const hasUploadedImages = computed(() => recentUploadedUrls.value.length > 0);
    const currentUserId = computed(() => authState.user?.sub || authState.user?.email || '');
    const resolvedDemos = computed(() => (props.demos && props.demos.length ? props.demos : fallbackDemoFaces.value));
    const selectedCount = computed(() => {
        const uploadedSelected = selectedUploadedUrls.value.length;
        const total = selectedDemoFaces.value.length + uploadedSelected;
        return total || 1;
    });

    const emitStateChange = () => {
        // 只发送选中的数量，不发送具体的 URL 列表
        emit('uploadedCountChange', selectedUploadedUrls.value.length);
    };

    const refreshHasEverUploadedFlag = () => {
        if (hasEverUploaded.value) return true;
        if (hasUserUploadedFacesHistory()) {
            hasEverUploaded.value = true;
            return true;
        }
        return false;
    };

    const syncViewMode = () => {
        if (hasUploadedImages.value) {
            if (useUploadWithDemo.value) {
                useUploadWithDemo.value = false;
            }
        } else {
            if (hasEverUploaded.value) {
                useUploadWithDemo.value = false;
            } else {
                useUploadWithDemo.value = isPhotoUploadPlan.value;
            }
        }
    };

    // 从服务端或缓存加载最新上传的图片列表
    const loadRecentUploads = (urls: string[]) => {
        console.log('[useFaceUploadState] loadRecentUploads:', urls);
        recentUploadedUrls.value = urls.slice(0, MAX_THUMBS);
        
        if (urls.length > 0) {
            hasEverUploaded.value = true;
            markUserHasUploadedFaces();
        }
        
        syncViewMode();
    };

    // 从 localStorage 加载选中的图片列表
    const loadSelectedFromCache = () => {
        const cached = loadFaceSelection();
        console.log('[useFaceUploadState] loadSelectedFromCache:', cached);
        selectedUploadedUrls.value = cached;
        emitStateChange();
    };

    // 注册新上传的图片（自动选中并添加到最新列表）
    const registerUploadedPhotos = (urls: string[], options?: { autoSelect?: boolean }) => {
        if (!urls || !urls.length) return;
        
        const autoSelect = options?.autoSelect !== false; // 默认为 true
        
        console.log('[useFaceUploadState] registerUploadedPhotos:', {
            urls,
            autoSelect,
            currentSelected: selectedUploadedUrls.value
        });
        
        // 将新上传的图片添加到最新列表的开头
        const newRecent = [...urls, ...recentUploadedUrls.value];
        const uniqueRecent = Array.from(new Set(newRecent));
        recentUploadedUrls.value = uniqueRecent.slice(0, MAX_THUMBS);
        
        // 只有在 autoSelect 为 true 时才自动选中
        if (autoSelect) {
            const newSelected = [...urls, ...selectedUploadedUrls.value];
            const uniqueSelected = Array.from(new Set(newSelected));
            selectedUploadedUrls.value = uniqueSelected;
        }
        
        hasEverUploaded.value = true;
        markUserHasUploadedFaces();
        syncViewMode();
        emitStateChange();
    };

    // 更新选中状态（由 FaceThumbBar 或 FaceUploadedPage 调用）
    const updateSelection = (selectedUrls: string[]) => {
        console.log('[useFaceUploadState] updateSelection:', {
            before: selectedUploadedUrls.value,
            after: selectedUrls
        });
        
        selectedUploadedUrls.value = selectedUrls;
        emitStateChange();
    };

    const handleThumbSelectionChange = (payload: { selected: string[]; count: number }) => {
        updateSelection(payload.selected);
    };

    // 处理从缓存加载的数据（兼容旧的接口）
    const handleCachedLoad = (items: Array<{ url: string; selected: boolean }>) => {
        if (!items || !items.length) return false;
        
        console.log('[useFaceUploadState] handleCachedLoad:', items);
        
        // 提取 URL 列表作为最新上传列表
        const urls = items.map(item => item.url);
        loadRecentUploads(urls);
        
        // 从 localStorage 加载选中状态（不使用缓存中的 selected 字段）
        loadSelectedFromCache();
        
        return true;
    };

    const triggerUploadDialog = () => {
        if (useUploadWithDemo.value) {
            uploadAreaRef.value?.openFilePicker?.();
        } else {
            thumbBarRef.value?.openFilePicker?.();
        }
    };

    const onPlusClick = () => {
        triggerUploadDialog();
    };

    const replaceUploadedPhotoUrl = (oldUrl: string, newUrl: string) => {
        // 更新最新列表
        const idx = recentUploadedUrls.value.indexOf(oldUrl);
        if (idx >= 0) {
            recentUploadedUrls.value[idx] = newUrl;
        }
        // 更新选中列表
        const sidx = selectedUploadedUrls.value.indexOf(oldUrl);
        if (sidx >= 0) {
            selectedUploadedUrls.value[sidx] = newUrl;
        }
        emitStateChange();
    };

    const clearAllUploads = (options?: { clearCache?: boolean }) => {
        recentUploadedUrls.value = [];
        selectedUploadedUrls.value = [];
        emitStateChange();
        syncViewMode();
        if (options?.clearCache) {
            thumbBarRef.value?.clearRecentFacesCache?.();
        }
    };

    const looksLikeUploadedFaceUrl = (url: string | null | undefined): url is string => {
        if (!url) return false;
        return url.includes('/upload/');
    };

    const primeFallbackDemos = () => {
        if (props.demos?.length) return;
        fallbackDemoFaces.value = loadDemoFacesCache();
    };
    
    // 刷新 FaceThumbBar 的图片列表（从 localStorage 加载选中状态）
    const refreshThumbBar = () => {
        console.log('[useFaceUploadState] refreshThumbBar');
        loadSelectedFromCache();
    };

    return {
        useUploadWithDemo,
        hasEverUploaded,
        uploadAreaRef,
        thumbBarRef,
        selectedDemoFaces,
        fallbackDemoFaces,
        uploadedPhotos: computed(() => {
            // 兼容旧代码：将新的数据结构转换为旧的格式
            return uploadedImageUrls.value.map((url: string) => ({
                url,
                selected: selectedUploadedUrls.value.includes(url)
            }));
        }),
        syncingRecentUploads,
        abortController,
        planKey,
        isPhotoUploadPlan,
        uploadedImageUrls,
        selectedUploadedUrls,
        hasUploadedImages,
        currentUserId,
        resolvedDemos,
        selectedCount,
        emitStateChange,
        refreshHasEverUploadedFlag,
        applyCachedUploads: handleCachedLoad, // 兼容旧接口
        registerUploadedPhotos,
        updateSelection,
        handleThumbSelectionChange,
        handleCachedLoad,
        triggerUploadDialog,
        onPlusClick,
        replaceUploadedPhotoUrl,
        syncViewMode,
        clearAllUploads,
        looksLikeUploadedFaceUrl,
        primeFallbackDemos,
        refreshThumbBar
    } satisfies FaceUploadState;
};

const MAX_THUMBS = 4;
