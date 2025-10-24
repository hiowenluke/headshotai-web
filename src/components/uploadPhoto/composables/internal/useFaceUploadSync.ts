import { refreshSession, authState } from '@/state/authState';
import { saveFaceSelection } from '@/pages/uploadedPhotos/faceSelectionCache';
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
                // 先从 localStorage 加载选中状态（包括不在前4张的选中图片）
                state.refreshThumbBar();

                // 注册新的上传图片（保持服务端返回的顺序，不自动选中）
                // 使用 replace: true 表示这是从服务端加载的完整列表，而不是本地新上传
                state.registerUploadedPhotos([...faces], { autoSelect: false, replace: true });
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
                    // 真正新上传的图片，自动选中（追加模式，不使用 replace）
                    state.registerUploadedPhotos([props.image], { autoSelect: true, replace: false });
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
