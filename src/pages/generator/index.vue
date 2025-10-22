<template>
    <PageLikeModal 
        :is-open="isOpen" 
        :modal-title="'AI Generator'"
        @close="$emit('close')"
        modal-style="vertical"
        :titleType="'text-tabs'"
        :tabs="tabsFromPlans"
        :model-value="selectedPlan"
        @update:model-value="handleTabChange"
        :hotDismissed="hotDismissed"
        @hot-clicked="handleHotClicked"
        :enableTabSwipe="true"
        :disableContentScroll="true"
        modal-type="GeneratorModal"
        :enableTabPersistence="true"
        class="generator-page-modal"
    >
        <template #toolbar-end>
            <!-- Recent tasks 图标按钮 -->
            <ion-button fill="clear" @click="handleRecentTasks" aria-label="Recent tasks">
                <SvgIcon name="time-outline" size="30px" />
            </ion-button>
        </template>
        
        <!-- 1P tab 内容 -->
        <template #1P>
            <Generator1P
                :demoFaces="demoFacesList"
                :image="image"
                :selectedPlan="selectedPlan"
                ref="generator1PRef"
            />
        </template>

        <!-- 20P tab 内容 -->
        <template #20P>
            <Generator20P
                :demoFaces="demoFacesList"
                :image="image"
                :selectedPlan="selectedPlan"
                @openSubPage="openSubPage"
                ref="generator20PRef"
            />
        </template>

        <!-- 40P tab 内容 -->
        <template #40P>
            <Generator40P
                :selectedPlan="selectedPlan"
                :generateLabel="generateLabel"
                :priceString="priceString"
                :formattedEta="formattedEta"
                :pricePillClass="pricePillClass"
                @openSubPage="openSubPage"
                @selectedCountChange="(count: number) => handleSelectedCountChange('40P', count)"
            />
        </template>

        <!-- 80P tab 内容 -->
        <template #80P>
            <Generator80P
                :selectedPlan="selectedPlan"
                :generateLabel="generateLabel"
                :priceString="priceString"
                :formattedEta="formattedEta"
                :pricePillClass="pricePillClass"
                @openSubPage="openSubPage"
                @selectedCountChange="(count: number) => handleSelectedCountChange('80P', count)"
            />
        </template>

        <!-- 全局固定在底部的 ButtonArea，统一控制所有 tab -->
        <template #bottom-area>
            <FixedBottomArea>
                <FaceUploadController
                    ref="uploadControllerRef"
                    :plan="currentPlanKey"
                    :is-open="isOpen"
                    :image="image"
                    v-show="showBottomFaceUploadController"
                    :demos="currentUploadDemos"
                    :hint="'Upload your face photos'"
                    :uploading="uploading"
                    :uploadError="uploadError"
                    :uploadedCount="uploadedCount"
                    :uploadTotal="uploadTotal"
                    @updateUploading="updateUploading"
                    @updateUploadError="updateUploadError"
                    @updateUploadedCount="updateUploadedCount"
                    @updateUploadTotal="updateUploadTotal"
                    @previewImageChange="handlePreviewImageChange"
                    @demoFacesChange="wrappedHandleDemoFacesChange"
                    @uploadedCountChange="wrappedHandleUploadedCountChange"
                    @viewAllFaces="openFacesLibrary"
                />
                <ButtonArea
                    :generateLabel="generateLabel"
                    :priceString="priceString"
                    :formattedEta="formattedEta"
                    :pricePillClass="pricePillClass"
                    :generating="generating"
                    @generate="handleGenerate"
                />
            </FixedBottomArea>
        </template>
    </PageLikeModal>
    
    <!-- 上传进度弹窗 -->
    <UploadProgressModal
        :is-open="uploading"
        :has-error="uploadError"
        :uploaded-count="uploadedCount"
        :upload-total="uploadTotal"
        @cancel="cancelUpload"
        @confirm="closeErrorModal"
    />

    <FaceUploadedPage
        :is-open="facesLibraryOpen"
        @close="handleFaceLibraryClose"
        @request-upload="handleFaceModalUpload"
    />
</template>

<script setup lang="ts">
// Vue 核心功能导入
import { ref, computed, onMounted, watch } from 'vue';
// Ionic 组件导入
import { IonButton } from '@ionic/vue';
import { defineAsyncComponent } from 'vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';

// 首屏必需组件 - 同步导入
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';
import ButtonArea from './buttonArea/ButtonArea.vue';
import FixedBottomArea from '@/components/layout/FixedBottomArea.vue';

// Tab 内容组件 - 懒加载（按需显示）
const Generator1P = defineAsyncComponent(() => 
  import('./tabContent/Generator1P.vue')
);
const Generator20P = defineAsyncComponent(() => 
  import('./tabContent/Generator20P.vue')
);
const Generator40P = defineAsyncComponent(() => 
  import('./tabContent/Generator40P.vue')
);
const Generator80P = defineAsyncComponent(() => 
  import('./tabContent/Generator80P.vue')
);

// 弹窗组件 - 懒加载（用户触发时才显示）
const UploadProgressModal = defineAsyncComponent(() => 
  import('@/components/uploading/UploadProgressModal.vue')
);
const FaceUploadController = defineAsyncComponent(() => 
  import('@/components/uploadPhoto/FaceUploadController.vue')
);
const FaceUploadedPage = defineAsyncComponent(() => 
  import('@/pages/uploadedPhotos/FaceUploadedPage.vue')
);
// 组合式函数导入
import { usePriceCalculation } from '@/composables/usePriceCalculation';
import { useUploadState } from '@/composables/useUploadState';
import { authState } from '@/state/authState';
import { useGeneratorPlans } from './composables/useGeneratorPlans';
import { useGeneratorFaces } from './composables/useGeneratorFaces';
import { useGeneratorActions } from './composables/useGeneratorActions';
import { useGeneratorModals } from './composables/useGeneratorModals';

// 组件属性接口定义
interface Props {
    isOpen: boolean;
    image?: string | null;
    demoFaces?: string[];
}

const props = withDefaults(defineProps<Props>(), {
    image: null,
    demoFaces: () => []
});

defineEmits<{
    close: [];
}>();

// 组件引用
const uploadControllerRef = ref<any>(null);
const generator1PRef = ref<any>(null);
const generator20PRef = ref<any>(null);

// 计算属性
const isUserLoggedIn = computed(() => authState.isLoggedIn);
const demoFacesList = computed(() => props.demoFaces ?? []);

// 使用计划管理
const {
    selectedPlan,
    tabsFromPlans,
    currentPlanKey,
    handleTabChange,
    hotDismissed,
    handleHotClicked
} = useGeneratorPlans();

// 使用 Faces 管理
const {
    selectedDemoFaces,
    uploadedFacesCount,
    showBottomFaceUploadController,
    currentUploadDemos,
    hasSelectedFaces,
    getDemoCountForPlan,
    handleUploadedCountChange,
    handlePreviewImageChange,
    handleDemoFacesChange
} = useGeneratorFaces(currentPlanKey, demoFacesList, generator1PRef);

// 使用价格计算
const { createPriceComputed, handleSelectedCountChange, initializePrices } = usePriceCalculation();
const priceComputed = computed(() => createPriceComputed(selectedPlan.value));
const generateLabel = computed(() => priceComputed.value.generateLabel.value);
const priceString = computed(() => priceComputed.value.priceString.value);
const formattedEta = computed(() => priceComputed.value.formattedEta.value);
const pricePillClass = computed(() => priceComputed.value.pricePillClass.value);

// 使用上传状态管理
const {
    uploading,
    uploadError,
    uploadedCount,
    uploadTotal,
    updateUploading,
    updateUploadError,
    updateUploadedCount,
    updateUploadTotal
} = useUploadState();

// 使用生成操作
const { handleGenerate, handleRecentTasks } = useGeneratorActions(
    selectedPlan,
    hasSelectedFaces,
    currentUploadDemos,
    generator1PRef,
    generator20PRef
);

// 使用弹窗管理
const { facesLibraryOpen, openSubPage, openFacesLibrary, handleFaceModalUpload } =
    useGeneratorModals(uploadControllerRef);

// 生成状态
const generating = computed(() => uploading.value);

// 上传操作
const cancelUpload = () => {
    const controller = uploadControllerRef.value?.abortController?.();
    controller?.abort();
};

const closeErrorModal = () => {
    updateUploading(false);
    updateUploadError(false);
};

// 辅助函数
const updatePlanSelectionCount = (plan: typeof currentPlanKey.value, uploadedCountOverride?: number) => {
    const uploadedCount = uploadedCountOverride ?? uploadedFacesCount.value;
    const total = Math.max(uploadedCount + getDemoCountForPlan(plan), 1);
    handleSelectedCountChange(plan, total);
};

const requestRecentFacesSync = () => {
    try {
        uploadControllerRef.value?.syncRecentUploads?.();
    } catch (error) {
        console.error('[GeneratorModal] Failed to request recent faces sync', error);
    }
};

const handleFaceLibraryClose = () => {
    facesLibraryOpen.value = false;
    // 刷新 FaceThumbBar 的图片列表
    uploadControllerRef.value?.refreshThumbBar?.();
};

// 包装事件处理器以传递 updatePlanSelectionCount
const wrappedHandleUploadedCountChange = (count: number) => {
    handleUploadedCountChange(count, updatePlanSelectionCount);
};

const wrappedHandleDemoFacesChange = (faces: string[]) => {
    handleDemoFacesChange(faces, updatePlanSelectionCount);
};

// 监听器
watch(currentPlanKey, (plan) => {
    updatePlanSelectionCount(plan);
}, { immediate: true });

watch(isUserLoggedIn, (loggedIn) => {
    if (loggedIn) {
        if (props.isOpen) {
            requestRecentFacesSync();
        }
    } else {
        uploadControllerRef.value?.clearRecentFacesCache?.();
        selectedDemoFaces.value = [];
        updatePlanSelectionCount(currentPlanKey.value, getDemoCountForPlan(currentPlanKey.value));
    }
});

watch(() => props.isOpen, (open) => {
    if (open) {
        requestRecentFacesSync();
    } else {
        facesLibraryOpen.value = false;
    }
});

// 初始化
onMounted(() => {
    initializePrices();
    if (props.isOpen) {
        requestRecentFacesSync();
    }
});
</script>

<style scoped>
/* 生成器页面样式 */

/* Recent tasks 按钮样式现在由 ModalTopBar 统一处理 */

/* 覆盖 PageLikeModal 的 padding-top，避免内容下沉 */
.generator-page-modal :deep(.v-mode-content) {
  --padding-top: 0 !important;
  --offset-top: 0 !important;
}
</style>
