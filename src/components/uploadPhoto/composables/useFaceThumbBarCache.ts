/**
 * FaceThumbBar 缓存管理逻辑
 * 负责加载和保存最近上传的图片到缓存
 */
import { computed, watch } from 'vue';
import {
  loadCachedUploadedPhotos,
  persistUploadedPhotos,
  clearCachedUploadedPhotos,
  type CachedPhotoItem
} from '../utils/recentFacesCache';

export interface CacheEmits {
  cachedLoad: (items: CachedPhotoItem[]) => void;
}

export function useFaceThumbBarCache(
  images: () => string[],
  selectedList: () => string[],
  totalSlots: () => number,
  emit: CacheEmits
) {
  const cacheSlotLimit = computed(() => totalSlots() ?? 4);

  /**
   * 通知父组件缓存加载完成
   */
  const emitCachedLoad = (items: CachedPhotoItem[]) => {
    if (!items.length) return;
    emit.cachedLoad(items);
  };

  /**
   * 保存当前图片和选择状态到缓存
   */
  const persistToCache = () => {
    const imageList = images();
    if (!imageList.length) return;

    const selectedSet = new Set(selectedList());
    const payload: CachedPhotoItem[] = imageList
      .slice(0, cacheSlotLimit.value)
      .map(url => ({
        url,
        selected: selectedSet.has(url)
      }));

    persistUploadedPhotos(payload, cacheSlotLimit.value);
  };

  /**
   * 从缓存加载图片
   */
  const loadCachedUploads = () => {
    const cached = loadCachedUploadedPhotos(cacheSlotLimit.value);
    if (cached.length) {
      emitCachedLoad(cached);
    }
    return cached;
  };

  /**
   * 清除缓存
   */
  const clearCache = () => {
    clearCachedUploadedPhotos();
  };

  // 监听图片和选择状态变化，自动保存到缓存
  watch([images, selectedList], () => {
    persistToCache();
  });

  return {
    cacheSlotLimit,
    loadCachedUploads,
    clearCache,
    persistToCache,
  };
}
