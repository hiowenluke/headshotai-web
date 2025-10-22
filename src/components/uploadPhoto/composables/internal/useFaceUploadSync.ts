import { refreshSession, authState } from '@/state/authState';
import type { FaceUploadControllerProps, FaceUploadState } from '../../types';

export const useFaceUploadSync = (props: FaceUploadControllerProps, state: FaceUploadState) => {
    const syncRecentUploads = async () => {
        if (state.syncingRecentUploads.value) return;
        state.syncingRecentUploads.value = true;
        try {
            await refreshSession();
            if (!authState.isLoggedIn) {
                state.thumbBarRef.value?.loadCachedUploads?.();
                return;
            }

            const faces = Array.isArray(authState.recentFaces) ? authState.recentFaces : [];

            if (faces.length) {
                // 先从 localStorage 加载选中状态
                state.refreshThumbBar();
                
                // 注册新的上传图片（不自动选中，保持 localStorage 中的选中状态）
                state.registerUploadedPhotos([...faces].reverse(), { autoSelect: false });
            } else {
                // 没有上传的图片
                const hasUploaded = state.uploadedImageUrls.value.length > 0;
                if (hasUploaded) {
                    state.clearAllUploads({ clearCache: true });
                } else {
                    state.thumbBarRef.value?.loadCachedUploads?.();
                    state.refreshHasEverUploadedFlag();
                }
            }

            if (state.looksLikeUploadedFaceUrl(props.image)) {
                const alreadyHasImage = state.uploadedImageUrls.value.includes(props.image);
                if (!alreadyHasImage && props.image) {
                    // 真正新上传的图片，自动选中
                    state.registerUploadedPhotos([props.image], { autoSelect: true });
                }
            }
            state.refreshHasEverUploadedFlag();
            state.syncViewMode();
        } catch (error) {
            console.error('[FaceUploadController] Failed to sync recent uploads', error);
            if (!state.uploadedImageUrls.value.length) {
                state.thumbBarRef.value?.loadCachedUploads?.();
                state.refreshHasEverUploadedFlag();
            }
            state.syncViewMode();
        } finally {
            state.syncingRecentUploads.value = false;
        }
    };

    return {
        syncRecentUploads
    };
};
