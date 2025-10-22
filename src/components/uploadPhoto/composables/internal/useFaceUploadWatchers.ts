import { watch } from 'vue';
import { authState } from '@/state/authState';
import type { FaceUploadControllerProps, FaceUploadControllerEmit, FaceUploadState } from '../../types';

interface FaceUploadWatchersOptions {
    props: FaceUploadControllerProps;
    emit: FaceUploadControllerEmit;
    state: FaceUploadState;
    syncRecentUploads: () => Promise<void>;
}

export const useFaceUploadWatchers = ({ props, emit, state, syncRecentUploads }: FaceUploadWatchersOptions) => {
    watch([state.planKey, state.hasUploadedImages], state.syncViewMode, { immediate: true });

    watch(state.resolvedDemos, (demos) => {
        if ((!demos || demos.length === 0) && state.selectedDemoFaces.value.length) {
            state.selectedDemoFaces.value = [];
            emit('demoFacesChange', []);
        }
    });

    watch(state.planKey, (nextPlan) => {
        if (nextPlan !== '1P' && state.selectedDemoFaces.value.length) {
            state.selectedDemoFaces.value = [];
            emit('demoFacesChange', []);
        }
    });

    watch(() => authState.isLoggedIn, (loggedIn) => {
        if (loggedIn) {
            state.refreshHasEverUploadedFlag();
            state.syncViewMode();
            if (props.isOpen) {
                void syncRecentUploads();
            }
        } else {
            state.hasEverUploaded.value = false;
            state.clearAllUploads({ clearCache: true });
        }
    });

    watch(() => props.isOpen, (open) => {
        if (open) {
            void syncRecentUploads();
        }
    });

    watch(() => props.image, (img) => {
        if (!state.looksLikeUploadedFaceUrl(img) || !authState.isLoggedIn) return;
        if (!state.uploadedImageUrls.value.includes(img) && img) {
            state.registerUploadedPhotos([img]);
        }
    });
};
