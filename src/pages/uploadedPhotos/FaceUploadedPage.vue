<template>
  <PageLikeModal
    :is-open="isOpen"
    page-title="Uploaded Faces"
    modal-style="horizontal"
    :disable-content-scroll="false"
    modal-type="FaceUploaded"
    @close="handleClose"
  >
    <FiniteCardList3
      :items="faces"
      :selected-urls="selectedUrlsArray"
      :aspect-ratio="1"
      :selectable="true"
      :show-add-button="true"
      :corner-label="true"
      corner-label-position="bottom-right"
      :corner-label-formatter="formatExpiryLabel"
      :loading="loading"
      loading-text="Loading your uploads…"
      :error="error"
      :show-retry="true"
      empty-text="No uploaded faces yet."
      instance-key="face-uploaded"
      @add="triggerUpload"
      @toggle="toggleSelected"
      @retry="syncFaces"
    />

    <!-- 复用 FaceUploadController 处理上传 -->
    <FaceUploadController
      ref="uploadControllerRef"
      style="display: none;"
      :plan="'1P'"
      :is-open="isOpen"
      :uploading="uploading"
      :upload-error="uploadError"
      :uploaded-count="uploadedCount"
      :upload-total="uploadTotal"
      @updateUploading="uploading = $event"
      @updateUploadError="uploadError = $event"
      @updateUploadedCount="uploadedCount = $event"
      @updateUploadTotal="uploadTotal = $event"
      @uploadedCountChange="handleUploadedCountChange"
    />

    <!-- 上传进度弹窗 -->
    <UploadProgressModal
      :is-open="uploading"
      :has-error="uploadError"
      :uploaded-count="uploadedCount"
      :upload-total="uploadTotal"
      @cancel="cancelUpload"
      @confirm="closeErrorModal"
    />
  </PageLikeModal>
</template>

<script setup lang="ts">
import { computed, watch, ref, defineAsyncComponent, onMounted } from 'vue';
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';
import FiniteCardList3 from '@/components/cardList/FiniteCardList3.vue';
import { fetchAllUploadedFaces } from '@/services/uploadedFacesService';
import { refreshSession, authState } from '@/state/authState';
import type { FaceUploadExpose } from '@/components/uploadPhoto/types';
import { saveFaceSelection, loadFaceSelection } from './faceSelectionCache';

const FaceUploadController = defineAsyncComponent(() =>
  import('@/components/uploadPhoto/FaceUploadController.vue')
);
const UploadProgressModal = defineAsyncComponent(() =>
  import('@/components/uploading/UploadProgressModal.vue')
);

interface Props {
  isOpen: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

interface FaceItem {
  url: string;
  createdAt: number;
}

interface UiFaceItem {
  url: string;
  displayName: string;
  createdAt: number;
}

const rawFaces = ref<FaceItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedUrlSet = ref<Set<string>>(new Set());

// 组件挂载时，从缓存加载选择状态
onMounted(() => {
  const cachedSelection = loadFaceSelection();
  if (cachedSelection.length > 0) {
    selectedUrlSet.value = new Set(cachedSelection);
    console.log('[FaceUploadedPage] Loaded selection from cache:', cachedSelection.length);
    
    // 通知父组件缓存的选择状态
    // 注意：这里不使用 emitSelection，因为父组件可能还没准备好
    // 等到页面打开时再同步
  }
});

// 上传相关状态
const uploading = ref(false);
const uploadError = ref(false);
const uploadedCount = ref(0);
const uploadTotal = ref(0);
const uploadControllerRef = ref<FaceUploadExpose | null>(null);

const toArray = (set: Set<string>) => Array.from(set);
const availableUrls = computed(() => rawFaces.value.map((item) => item.url));
const selectedUrlsArray = computed(() => Array.from(selectedUrlSet.value));

// 不再需要向父组件发送选择状态，完全由 localStorage 管理

const applySelection = (urls: readonly string[]) => {
  const availableSet = availableUrls.value.length ? new Set(availableUrls.value) : null;
  const normalized = availableSet ? urls.filter((url) => availableSet.has(url)) : [...urls];
  const current = selectedUrlSet.value;
  if (normalized.length === current.size && normalized.every((url) => current.has(url))) {
    return;
  }
  selectedUrlSet.value = new Set(normalized);
  // 选择状态已保存到 localStorage，不需要通知父组件
};

const faces = computed<UiFaceItem[]>(() => {
  return rawFaces.value.map((item) => {
    return {
      url: item.url,
      displayName: new Date(item.createdAt).toLocaleDateString(),
      createdAt: item.createdAt
    };
  });
});

// 格式化过期标签
const formatExpiryLabel = (item: any) => {
  const created = item.createdAt;
  const expiryMs = created + 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const diffDays = Math.max(Math.ceil((expiryMs - now) / (24 * 60 * 60 * 1000)), 0);
  return `${diffDays}d`;
};

const syncFaces = async () => {
  if (!props.isOpen || loading.value) return;
  loading.value = true;
  error.value = null;

  const loadFaces = async () => {
    const response = await fetchAllUploadedFaces();
    rawFaces.value = response.faces || [];
    // 不要用父组件的值覆盖，保持当前的选择状态
    // applySelection 会自动过滤掉不存在的 URL
  };

  try {
    await loadFaces();
  } catch (err: any) {
    console.error('[FaceUploadedPage] Failed to fetch faces', err);
    const message = typeof err?.message === 'string' ? err.message : 'Failed to load faces.';

    if (message === 'not_authenticated') {
      try {
        await refreshSession();
        if (authState.isLoggedIn) {
          await loadFaces();
          return;
        }
      } catch (refreshErr) {
        console.error('[FaceUploadedPage] Session refresh failed', refreshErr);
      }
      error.value = 'Please sign in to view your uploads.';
      rawFaces.value = [];
    } else {
      error.value = message || 'Failed to load faces.';
      rawFaces.value = [];
    }
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      void syncFaces();
    }
  },
  { immediate: true }  // 立即执行一次，确保刷新后也能加载数据
);

// FaceUploadedPage 维护自己的选择状态，不依赖父组件
// 父组件的 selectedUrls 受 MAX_THUMBS=4 限制，不应该覆盖我们的选择
// 优先级：缓存 > 父组件传入的值
let hasInitialized = false;

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && !hasInitialized) {
      hasInitialized = true;
      
      // 首次打开时的初始化逻辑：
      // 从缓存加载选择状态（已在 onMounted 中加载）
      
      // 选择状态已从缓存加载，不需要通知父组件
    }
  },
  { immediate: true }  // 立即执行，确保在 rawFaces watch 之前初始化
);

// 当 rawFaces 变化时，只需要过滤掉不存在的 URL，不要用父组件的值覆盖
watch(rawFaces, () => {
  // 只保留当前选择中仍然存在的 URL
  applySelection(toArray(selectedUrlSet.value));
});

const handleClose = () => {
  // 选择状态已保存到 localStorage，不需要通知父组件
  emit('close');
};

// 触发上传
const triggerUpload = () => {
  uploadControllerRef.value?.triggerUploadDialog();
};

// 处理上传完成
// 注意：这个函数只应该在真正有新上传时才刷新列表
// 不要在页面打开时就刷新，因为 syncFaces 已经处理了
let lastUploadedCount = 0;
const handleUploadedCountChange = (count: number) => {
  // 只有当上传数量增加时才刷新（说明有新上传）
  if (count > lastUploadedCount) {
    lastUploadedCount = count;
    setTimeout(async () => {
      try {
        const response = await fetchAllUploadedFaces();
        rawFaces.value = response.faces || [];
        // 不要用父组件的值覆盖，rawFaces watch 会自动处理
      } catch (err: any) {
        console.error('[FaceUploadedPage] Failed to refresh faces after upload', err);
        // 静默失败，不影响用户体验
      }
    }, 500);
  } else {
    // 更新计数，但不刷新列表
    lastUploadedCount = count;
  }
};

// 取消上传
const cancelUpload = () => {
  const controller = uploadControllerRef.value?.abortController();
  if (controller) {
    controller.abort();
  }
  uploading.value = false;
};

// 关闭错误弹窗
const closeErrorModal = () => {
  uploadError.value = false;
  uploading.value = false;
};

const toggleSelected = (url: string) => {
  const next = new Set(selectedUrlSet.value);
  if (next.has(url)) {
    next.delete(url);
  } else {
    next.add(url);
  }
  selectedUrlSet.value = next;
  const selectedArray = toArray(next);
  
  // 保存到缓存
  saveFaceSelection(selectedArray);
  // 选择状态已保存到 localStorage，不需要通知父组件
};

// 监听选择变化，自动保存到缓存
watch(selectedUrlSet, (newSet) => {
  saveFaceSelection(toArray(newSet));
}, { deep: true });
</script>

<style scoped>
/* 页面级样式已移至 FiniteCardList3 组件 */
</style>
