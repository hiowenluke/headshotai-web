import { authState } from '@/state/authState';

export interface CachedPhotoItem {
    url: string;
    selected: boolean;
}

export const RECENT_FACES_CACHE_PREFIX = 'recent_faces_cache_v1::';
export const RECENT_FACES_FLAG_PREFIX = 'recent_faces_flag_v1::';

export const currentUserIdent = (): string | null => {
    const direct = authState.user?.sub || authState.user?.email || null;
    if (direct) return direct;
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('user_info');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.sub || parsed?.email || null;
    } catch {
        return null;
    }
};

export const getCacheKeyForCurrentUser = (): string | null => {
    const ident = currentUserIdent();
    return ident ? `${RECENT_FACES_CACHE_PREFIX}${ident}` : null;
};

const getFlagKeyForCurrentUser = (): string | null => {
    const ident = currentUserIdent();
    return ident ? `${RECENT_FACES_FLAG_PREFIX}${ident}` : null;
};

export const persistUploadedPhotos = (photos: CachedPhotoItem[], maxThumbs = 4) => {
    const cacheKey = getCacheKeyForCurrentUser();
    if (!cacheKey) return;
    try {
        const payload = photos.slice(0, maxThumbs).map(item => ({
            url: item.url,
            selected: item.selected
        }));
        localStorage.setItem(cacheKey, JSON.stringify(payload));
    } catch {
        // ignore
    }
};

export const loadCachedUploadedPhotos = (maxThumbs = 4): CachedPhotoItem[] => {
    const cacheKey = getCacheKeyForCurrentUser();
    if (!cacheKey) return [];
    try {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        const normalized: CachedPhotoItem[] = [];
        for (const entry of parsed) {
            if (typeof entry === 'string') {
                normalized.push({ url: entry, selected: true });
            } else if (entry && typeof entry.url === 'string') {
                normalized.push({ url: entry.url, selected: Boolean(entry.selected) });
            }
            if (normalized.length >= maxThumbs) break;
        }
        return normalized;
    } catch {
        return [];
    }
};

export const clearCachedUploadedPhotos = () => {
    const cacheKey = getCacheKeyForCurrentUser();
    if (!cacheKey) return;
    try {
        localStorage.removeItem(cacheKey);
    } catch {
        // ignore
    }
};

export const markUserHasUploadedFaces = () => {
    const key = getFlagKeyForCurrentUser();
    if (!key) return;
    try {
        localStorage.setItem(key, '1');
    } catch {
        // ignore
    }
};

export const hasUserUploadedFacesHistory = (): boolean => {
    const key = getFlagKeyForCurrentUser();
    if (!key) return false;
    try {
        return localStorage.getItem(key) === '1';
    } catch {
        return false;
    }
};
