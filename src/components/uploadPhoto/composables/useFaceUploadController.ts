import type {
    FaceUploadControllerProps,
    FaceUploadControllerEmit,
    FaceUploadBindings,
    FaceUploadExpose
} from '../types';
import { useFaceUploadState } from './internal/useFaceUploadState';
import { useFileUploadHandlers } from './internal/useFileUploadHandlers';
import { useFaceUploadSync } from './internal/useFaceUploadSync';
import { useFaceUploadWatchers } from './internal/useFaceUploadWatchers';
import { useFaceUploadLifecycle } from './internal/useFaceUploadLifecycle';

export const useFaceUploadController = (
    props: FaceUploadControllerProps,
    emit: FaceUploadControllerEmit
): FaceUploadBindings => {
    const state = useFaceUploadState(props, emit);
    const { handleFilesFromChild } = useFileUploadHandlers({ props, emit, state });
    const { syncRecentUploads } = useFaceUploadSync(props, state);

    useFaceUploadWatchers({ props, emit, state, syncRecentUploads });
    useFaceUploadLifecycle(props, state, syncRecentUploads);

    const toggleDemoFace = (face: string) => {
        const list = state.selectedDemoFaces.value;
        const idx = list.indexOf(face);
        if (idx >= 0) {
            list.splice(idx, 1);
        } else {
            list.push(face);
        }
        emit('demoFacesChange', [...state.selectedDemoFaces.value]);
    };

    const useDemo = (face: string) => {
        emit('previewImageChange', face);
    };

    const handleImagesFiltered = (validImages: string[]) => {
        console.log('[FaceUploadController] Images filtered:', {
            before: state.uploadedImageUrls.value.length,
            after: validImages.length,
            removed: state.uploadedImageUrls.value.filter(url => !validImages.includes(url))
        });
        // 图片已被过滤，状态会通过 selectionChange 事件自动更新
        // 这里不需要额外处理
    };

    const expose: FaceUploadExpose = {
        abortController: () => state.abortController.value,
        selectedDemoFaces: state.selectedDemoFaces,
        selectedCount: state.selectedCount,
        handleExternalFiles: handleFilesFromChild,
        clearRecentFacesCache: () => {
            state.clearAllUploads({ clearCache: true });
        },
        syncRecentUploads,
        setSelectedUploadedUrls: (urls: string[]) => {
            state.updateSelection(urls);
        },
        triggerUploadDialog: state.triggerUploadDialog,
        refreshThumbBar: state.refreshThumbBar
    };

    return {
        useUploadWithDemo: state.useUploadWithDemo,
        uploadedImageUrls: state.uploadedImageUrls,
        selectedUploadedUrls: state.selectedUploadedUrls,
        selectedDemoFaces: state.selectedDemoFaces,
        selectedCount: state.selectedCount,
        resolvedDemos: state.resolvedDemos,
        useDemo,
        toggleDemoFace,
        onPlusClick: state.onPlusClick,
        handleThumbSelectionChange: state.handleThumbSelectionChange,
        handleCachedLoad: state.handleCachedLoad,
        handleImagesFiltered,
        uploadAreaRef: state.uploadAreaRef,
        thumbBarRef: state.thumbBarRef,
        handleFilesFromChild,
        triggerUploadDialog: state.triggerUploadDialog,
        expose
    } satisfies FaceUploadBindings;
};
