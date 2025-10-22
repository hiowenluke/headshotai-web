/**
 * FaceUploadedPage 选择状态缓存
 * 
 * 与 recentFacesCache 不同，这个缓存：
 * 1. 不受 MAX_THUMBS=4 限制，可以保存任意数量的选择
 * 2. 只保存选中的 URL 列表，不保存图片详情
 * 3. 用于在页面刷新后恢复选择状态
 */

import { authState } from '@/state/authState';

const CACHE_PREFIX = 'face_uploaded_selection_v1::';

/**
 * 获取当前用户标识
 */
const currentUserIdent = (): string | null => {
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

/**
 * 获取当前用户的缓存 key
 */
const getCacheKey = (): string | null => {
  const ident = currentUserIdent();
  return ident ? `${CACHE_PREFIX}${ident}` : null;
};

/**
 * 保存选择状态到 localStorage
 */
export const saveFaceSelection = (selectedUrls: string[]): void => {
  const key = getCacheKey();
  if (!key) return;
  
  try {
    localStorage.setItem(key, JSON.stringify(selectedUrls));
  } catch (error) {
    console.warn('[FaceSelectionCache] Failed to save selection:', error);
  }
};

/**
 * 从 localStorage 加载选择状态
 */
export const loadFaceSelection = (): string[] => {
  const key = getCacheKey();
  if (!key) return [];
  
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // 过滤出有效的 URL 字符串
    return parsed.filter(item => typeof item === 'string' && item.length > 0);
  } catch (error) {
    console.warn('[FaceSelectionCache] Failed to load selection:', error);
    return [];
  }
};

/**
 * 清除选择状态缓存
 */
export const clearFaceSelection = (): void => {
  const key = getCacheKey();
  if (!key) return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('[FaceSelectionCache] Failed to clear selection:', error);
  }
};
