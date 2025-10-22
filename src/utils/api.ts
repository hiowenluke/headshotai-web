const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

function normalizePath(path: string): string {
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
}

/**
 * Resolve a relative API path against the configured backend base.
 * Absolute HTTP(S) URLs are returned unchanged so callers can pass through fully-qualified targets.
 */
export function resolveApiUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  if (!API_BASE) {
    return normalizePath(pathOrUrl);
  }

  return `${API_BASE}${normalizePath(pathOrUrl)}`;
}

export function apiFetch(input: string, init?: RequestInit) {
  return fetch(resolveApiUrl(input), init);
}
