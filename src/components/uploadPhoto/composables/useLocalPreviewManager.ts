const PREVIEW_REVOKE_DELAY_MS = 100;

export interface LocalPreviewManager {
    createPreview(file: File): string;
    getPreview(file: File): string | undefined;
    revokePreview(file: File, immediate?: boolean): void;
    revokeAll(): void;
    scheduleReplacement(oldUrl: string, newUrl: string, replacer: (oldUrl: string, newUrl: string) => void): void;
}

export const useLocalPreviewManager = (): LocalPreviewManager => {
    const filePreviewMap = new Map<File, string>();

    const createPreview = (file: File) => {
        const previewUrl = URL.createObjectURL(file);
        filePreviewMap.set(file, previewUrl);
        return previewUrl;
    };

    const getPreview = (file: File) => filePreviewMap.get(file);

    const revokePreview = (file: File, immediate = false) => {
        const url = filePreviewMap.get(file);
        if (!url) return;
        const revoke = () => URL.revokeObjectURL(url);
        if (immediate) {
            revoke();
        } else {
            setTimeout(revoke, PREVIEW_REVOKE_DELAY_MS);
        }
        filePreviewMap.delete(file);
    };

    const revokeAll = () => {
        filePreviewMap.forEach((url) => URL.revokeObjectURL(url));
        filePreviewMap.clear();
    };

    const scheduleReplacement = (oldUrl: string, newUrl: string, replacer: (oldUrl: string, newUrl: string) => void) => {
        setTimeout(() => {
            replacer(oldUrl, newUrl);
            URL.revokeObjectURL(oldUrl);
        }, PREVIEW_REVOKE_DELAY_MS);
    };

    return {
        createPreview,
        getPreview,
        revokePreview,
        revokeAll,
        scheduleReplacement
    };
};
