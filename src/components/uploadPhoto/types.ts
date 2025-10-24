import type { Ref, ComputedRef, ComponentPublicInstance } from 'vue';
import type { CachedPhotoItem } from './utils/recentFacesCache';

export type PlanKey = '1P' | '20P' | '40P' | '80P';

export interface FaceUploadControllerProps {
    plan?: PlanKey;
    demos?: string[];
    hint?: string;
    uploading?: boolean;
    uploadError?: boolean;
    uploadedCount?: number;
    uploadTotal?: number;
    minDisplayTime?: number;
    image?: string | null;
    isOpen?: boolean;
}

export interface FaceUploadControllerEmits {
    updateUploading: [value: boolean];
    updateUploadError: [value: boolean];
    updateUploadedCount: [value: number];
    updateUploadTotal: [value: number];
    previewImageChange: [url: string | null];
    demoFacesChange: [faces: string[]];
    uploadedCountChange: [count: number];
    viewAllFaces: [];
}

export type FaceUploadControllerEmit = <K extends keyof FaceUploadControllerEmits>(
    event: K,
    ...args: FaceUploadControllerEmits[K]
) => void;

export interface FaceUploadExpose {
    abortController: () => AbortController | null;
    selectedDemoFaces: Ref<string[]>;
    selectedCount: ComputedRef<number>;
    handleExternalFiles: (files: File[]) => Promise<void>;
    clearRecentFacesCache: () => void;
    syncRecentUploads: () => Promise<void>;
    setSelectedUploadedUrls: (urls: string[]) => void;
    triggerUploadDialog: () => void;
    refreshThumbBar: () => void;
}

export interface FaceUploadExposeBindings {
    expose: FaceUploadExpose;
}

export interface FaceUploadBindings extends FaceUploadExposeBindings {
    useUploadWithDemo: Ref<boolean>;
    uploadedImageUrls: ComputedRef<string[]>;
    selectedUploadedUrls: Ref<string[]>;
    selectedDemoFaces: Ref<string[]>;
    selectedCount: ComputedRef<number>;
    resolvedDemos: ComputedRef<string[]>;
    useDemo: (d: string) => void;
    toggleDemoFace: (d: string) => void;
    onPlusClick: () => void;
    handleThumbSelectionChange: (payload: { selected: string[]; count: number }) => void;
    handleCachedLoad: (items: CachedPhotoItem[]) => void;
    handleImagesFiltered: (validImages: string[]) => void;
    uploadAreaRef: Ref<ComponentInstanceOrNull>;
    thumbBarRef: Ref<ComponentInstanceOrNull>;
    handleFilesFromChild: (files: File[]) => Promise<void>;
    triggerUploadDialog: () => void;
}

type ComponentInstanceOrNull = (ComponentPublicInstance & {
    openFilePicker?: () => void;
    loadCachedUploads?: () => CachedPhotoItem[];
    clearRecentFacesCache?: () => void;
}) | null;

export type UploadAreaInstance = ComponentPublicInstance & {
    openFilePicker?: () => void;
};

export type ThumbBarInstance = ComponentPublicInstance & {
    loadCachedUploads?: () => CachedPhotoItem[];
    clearRecentFacesCache?: () => void;
    openFilePicker?: () => void;
};

export interface FaceUploadState {
    useUploadWithDemo: Ref<boolean>;
    hasEverUploaded: Ref<boolean>;
    uploadAreaRef: Ref<UploadAreaInstance | null>;
    thumbBarRef: Ref<ThumbBarInstance | null>;
    selectedDemoFaces: Ref<string[]>;
    fallbackDemoFaces: Ref<string[]>;
    uploadedPhotos: Ref<CachedPhotoItem[]>;
    syncingRecentUploads: Ref<boolean>;
    abortController: Ref<AbortController | null>;
    planKey: ComputedRef<PlanKey>;
    isPhotoUploadPlan: ComputedRef<boolean>;
    uploadedImageUrls: ComputedRef<string[]>;
    selectedUploadedUrls: Ref<string[]>;
    hasUploadedImages: ComputedRef<boolean>;
    currentUserId: ComputedRef<string>;
    resolvedDemos: ComputedRef<string[]>;
    selectedCount: ComputedRef<number>;
    emitStateChange: () => void;
    refreshHasEverUploadedFlag: () => boolean;
    applyCachedUploads: (items: CachedPhotoItem[]) => boolean;
    registerUploadedPhotos: (urls: string[], options?: { autoSelect?: boolean; replace?: boolean }) => void;
    updateSelection: (selectedUrls: string[]) => void;
    handleThumbSelectionChange: (payload: { selected: string[]; count: number }) => void;
    handleCachedLoad: (items: CachedPhotoItem[]) => void;
    triggerUploadDialog: () => void;
    onPlusClick: () => void;
    replaceUploadedPhotoUrl: (oldUrl: string, newUrl: string) => void;
    syncViewMode: () => void;
    clearAllUploads: (options?: { clearCache?: boolean }) => void;
    looksLikeUploadedFaceUrl: (url: string | null | undefined) => url is string;
    primeFallbackDemos: () => void;
    refreshThumbBar: () => void;
}
