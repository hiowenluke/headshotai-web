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
import { computed, watch, ref, defineAsyncComponent } from 'vue';
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';
import FiniteCardList3 from '@/components/cardList/FiniteCardList3.vue';
import { fetchAllUploadedFaces } from '@/services/uploadedFacesService';
import { refreshSession, authState } from '@/state/authState';
import type { FaceUploadExpose } from '@/components/uploadPhoto/types';
import { loadFaceSelection } from './faceSelectionCache';

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

// 选中状态：从 FaceUploadController 获取（通过 localStorage 同步）
const selectedUrlSet = ref<Set<string>>(new Set());

// 上传相关状态
const uploading = ref(false);
const uploadError = ref(false);
const uploadedCount = ref(0);
const uploadTotal = ref(0);
const uploadControllerRef = ref<FaceUploadExpose | null>(null);

const selectedUrlsArray = computed(() => Array.from(selectedUrlSet.value));

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
      // 每次打开页面时，从 localStorage 加载选中状态
      const cachedSelection = loadFaceSelection();
      selectedUrlSet.value = new Set(cachedSelection);
      
      // 加载图片数据
      void syncFaces();
    }
  },
  { immediate: true }
);

const handleClose = () => {
  // 触发 FaceUploadController 同步最新的上传列表
  // 这样返回 GeneratorModal 后，FaceThumbBar 会显示最新上传的图片
  uploadControllerRef.value?.syncRecentUploads?.();
  
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
        
        // 刷新选中状态：从 localStorage 重新加载
        const cachedSelection = loadFaceSelection();
        selectedUrlSet.value = new Set(cachedSelection);
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
  const wasSelected = next.has(url);
  
  if (wasSelected) {
    next.delete(url);
  } else {
    next.add(url);
  }
  
  selectedUrlSet.value = next;
  const selectedArray = Array.from(next);
  
  // 通过 FaceUploadController 更新选中状态（会自动保存到 localStorage）
  uploadControllerRef.value?.setSelectedUploadedUrls?.(selectedArray);
};

// 选中状态通过 FaceUploadController 管理，不需要额外的 watch
</script>

<style scoped>
/* 页面级样式已移至 FiniteCardList3 组件 */
</style>
