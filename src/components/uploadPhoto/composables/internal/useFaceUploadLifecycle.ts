import { onMounted } from 'vue';
import type { FaceUploadControllerProps, FaceUploadState } from '../../types';

export const useFaceUploadLifecycle = (
    props: FaceUploadControllerProps,
    state: FaceUploadState,
    syncRecentUploads: () => Promise<void>
) => {
    onMounted(() => {
        state.primeFallbackDemos();

        state.refreshHasEverUploadedFlag();

        if (props.isOpen) {
            void syncRecentUploads();
        } else if (!state.uploadedImageUrls.value.length) {
            state.thumbBarRef.value?.loadCachedUploads?.();
            state.refreshHasEverUploadedFlag();
            state.syncViewMode();
        }
    });
};
