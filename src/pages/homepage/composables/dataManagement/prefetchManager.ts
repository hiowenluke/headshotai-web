/**
 * 预取管理模块
 * 处理数据预取逻辑
 */

import { fetchDemoHomeImages } from '@/services/imageService';
import type { PrefetchState, DataState } from './types';
import { PER_PAGE } from './types';

export function createPrefetchManager(
  prefetchState: PrefetchState,
  dataState: DataState
) {
  // 标记正在预取
  function markPrefetching(cat: string, page: number) {
    if (!prefetchState.prefetching[cat]) {
      prefetchState.prefetching[cat] = new Set();
    }
    prefetchState.prefetching[cat].add(page);
  }

  // 取消预取标记
  function unmarkPrefetching(cat: string, page: number) {
    prefetchState.prefetching[cat]?.delete(page);
  }

  // 预取下一页数据
  async function prefetchNextPage(category: string, currentPrefs: any) {
    if (dataState.noMoreMap[category]) return;

    const nextPage = (dataState.pages[category] || 1) + 1;

    // 检查是否已预取或正在预取
    if (prefetchState.prefetched[category]?.[nextPage]) return;
    if (prefetchState.prefetching[category]?.has(nextPage)) return;

    markPrefetching(category, nextPage);

    try {
      const { images, hasMore } = await fetchDemoHomeImages({
        category,
        page: nextPage,
        perPage: PER_PAGE,
        prefs: currentPrefs
      });

      if (!prefetchState.prefetched[category]) {
        prefetchState.prefetched[category] = {};
      }
      prefetchState.prefetched[category][nextPage] = images;

      // 延迟标记 noMore 直到被消费
    } catch (e) {
      console.warn('[prefetchManager] prefetchNextPage failed', category, e);
    } finally {
      unmarkPrefetching(category, nextPage);
    }
  }

  return {
    prefetchNextPage
  };
}
