<template>
    <div class="upload-controller">
        <FaceUploadArea 
            v-show="useUploadWithDemo"
            ref="uploadAreaRef"
            :hint="hint"
            :demos="resolvedDemos"
            :selectedList="selectedDemoFaces"
            @plus="onPlusClick"
            @filesChange="handleFilesFromChild"
            @demoToggle="toggleDemoFace"
            @demoUse="useDemo"
        />
        <FaceThumbBar
            v-show="!useUploadWithDemo"
            ref="thumbBarRef"
            :images="uploadedImageUrls"
            :selectedList="selectedUploadedUrls"
            @plus="onPlusClick"
            @filesChange="handleFilesFromChild"
            @thumbToggle="() => {/* handled by selectionChange */}"
            @selectionChange="handleThumbSelectionChange"
            @cachedLoad="handleCachedLoad"
            @imagesFiltered="handleImagesFiltered"
            @viewAll="emit('viewAllFaces')"
        />
    </div>
</template>

<script setup lang="ts">
import FaceUploadArea from './FaceUploadArea.vue';
import FaceThumbBar from './FaceThumbBar.vue';
import { DEFAULT_UPLOAD_MIN_DISPLAY_MS } from '@/constants/upload';
import { useFaceUploadController } from './composables/useFaceUploadController';
import type { FaceUploadControllerProps, FaceUploadControllerEmits, FaceUploadExpose, FaceUploadControllerEmit } from './types';

const props = withDefaults(defineProps<FaceUploadControllerProps>(), {
    plan: '1P',
    demos: () => [],
    hint: 'Upload your face photos',
    uploading: false,
    uploadError: false,
    uploadedCount: 0,
    uploadTotal: 0,
    minDisplayTime: DEFAULT_UPLOAD_MIN_DISPLAY_MS,
    image: null,
    isOpen: false
});

const emit = defineEmits([
    'updateUploading',
    'updateUploadError',
    'updateUploadedCount',
    'updateUploadTotal',
    'previewImageChange',
    'demoFacesChange',
    'uploadedCountChange',
    'viewAllFaces'
]);

// 确保 emit 函数的类型正确
const typedEmit = emit as FaceUploadControllerEmit;

const bindings = useFaceUploadController(props, typedEmit);

const {
    useUploadWithDemo,
    uploadedImageUrls,
    selectedUploadedUrls,
    selectedDemoFaces,
    resolvedDemos,
    useDemo,
    toggleDemoFace,
    onPlusClick,
    handleThumbSelectionChange,
    handleCachedLoad,
    handleImagesFiltered,
    uploadAreaRef,
    thumbBarRef,
    handleFilesFromChild,
    expose
} = bindings;

const exposedBindings: FaceUploadExpose = expose;
defineExpose(exposedBindings);
</script>

<style scoped>
.upload-controller {
    width: 100%;
}
</style>
