const DEMO_FACES_CACHE_KEY = 'cached_demo_faces_v1';

export const demoFacesCacheKey = DEMO_FACES_CACHE_KEY;

export const loadDemoFacesCache = (): string[] => {
    try {
        const raw = localStorage.getItem(DEMO_FACES_CACHE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
            return parsed as string[];
        }
    } catch {
        // ignore read errors
    }
    return [];
};

export const saveDemoFacesCache = (faces: string[]) => {
    try {
        localStorage.setItem(DEMO_FACES_CACHE_KEY, JSON.stringify(faces));
    } catch {
        // ignore write errors
    }
};

export const clearDemoFacesCache = () => {
    try {
        localStorage.removeItem(DEMO_FACES_CACHE_KEY);
    } catch {
        // ignore remove errors
    }
};
