import { useLocalPreviewManager } from '../useLocalPreviewManager';
import { uploadFilesSequential, type UploadTaskResult } from '@/services/faceUpload';
import type { FaceUploadControllerProps, FaceUploadControllerEmit, FaceUploadState } from '../../types';

interface FileUploadHandlersOptions {
    props: FaceUploadControllerProps;
    emit: FaceUploadControllerEmit;
    state: FaceUploadState;
}

export const useFileUploadHandlers = ({ props, emit, state }: FileUploadHandlersOptions) => {
    const previewManager = useLocalPreviewManager();

    const ensurePreviewRegistered = (file: File) => {
        const existing = previewManager.getPreview(file);
        if (existing) return existing;
        const localUrl = previewManager.createPreview(file);
        if (state.useUploadWithDemo.value) state.useUploadWithDemo.value = false;
        state.registerUploadedPhotos([localUrl]);
        return localUrl;
    };

    const handleUploadSuccessProgress = (file: File, serverUrl?: string | null) => {
        const previewUrl = ensurePreviewRegistered(file);
        if (serverUrl) {
            previewManager.scheduleReplacement(previewUrl, serverUrl, state.replaceUploadedPhotoUrl);
        }
    };

    const handleFilesFromChild = async (files: File[]) => {
        if (!files || !files.length) return;

        emit('updateUploading', true);
        emit('updateUploadError', false);
        emit('updateUploadedCount', 0);
        emit('updateUploadTotal', files.length);
        state.abortController.value = new AbortController();

        let results: UploadTaskResult[];
        try {
            results = await uploadFilesSequential(files, {
                signal: state.abortController.value.signal,
                minDisplayTime: props.minDisplayTime,
                userId: state.currentUserId.value,
                category: 'faces',
                aspectRatio: 1, // 人脸上传默认按 1:1 处理；Backdrop/Outfit/Pose/Hairstyle 请传 4/5
                onProgress: (e) => {
                    if (e.status === 'success') {
                        emit('updateUploadedCount', e.index + 1);
                        if (e.file && e.index < files.length) {
                            const file = files[e.index];
                            handleUploadSuccessProgress(file, e.url ?? undefined);
                        }
                    } else if (e.status === 'error' || e.status === 'canceled') {
                        const total = props.uploadTotal ?? files.length;
                        emit('updateUploadedCount', Math.min(e.index + 1, total));
                    }
                }
            });
        } catch (error) {
            console.error('[FaceUploadController] Unable to upload files without user session.', error);
            emit('updateUploading', false);
            emit('updateUploadError', true);
            previewManager.revokeAll();
            return;
        }

        const failures = results.filter(r => !r.success);

        results.forEach((result, index) => {
            if (!result.success && index < files.length) {
                const file = files[index];
                previewManager.revokePreview(file, true);
            }
        });

        emit('updateUploading', false);
        if (failures.length) {
            emit('updateUploadError', true);
            emit('updateUploading', true);
        } else {
            emit('updateUploadError', false);
        }
    };

    return {
        handleFilesFromChild
    };
};
