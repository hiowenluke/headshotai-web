/**
 * 加载更多处理模块
 * 处理无限滚动加载更多数据的逻辑
 */

import { fetchDemoHomeImages } from '@/services/imageService';
import { getSmartLoadingConfig } from '@/utils/smartLoading';
import type { DataState, LoadingLocks, PrefetchState } from './types';
import { PER_PAGE, MAX_LOAD_MORE_RETRIES } from './types';

export function createLoadMoreHandler(
  dataState: DataState,
  loadingLocks: LoadingLocks,
  prefetchState: PrefetchState,
  errorHandler: any,
  prefetchManager: any
) {
  const smartLoading = getSmartLoadingConfig();

  // 加载更多数据
  async function loadMore(
    ev: any,
    catFromEvent: string,
    currentCategory: string,
    currentPrefs: any
  ) {
    const category = catFromEvent || currentCategory;

    // 检查是否还有更多数据
    if (dataState.noMoreMap[category]) {
      if (ev && ev.target) ev.target.complete();
      return;
    }

    // 检查加载锁
    if (loadingLocks.loadMoreLock.has(category)) {
      if (ev && ev.target) ev.target.complete();
      return;
    }

    loadingLocks.loadMoreLock.add(category);
    dataState.loadingMoreMap[category] = true;

    // 根据网速决定加载多少屏
    const strategy = smartLoading.getLoadingStrategy(category, false);
    const cardsToLoad = smartLoading.getCardsPerLoad(strategy.screensToLoad);
    const pagesNeeded = Math.ceil(cardsToLoad / PER_PAGE);

    try {
      const allImages: string[] = [];
      let finalHasMore = true;
      const startPage = (dataState.pages[category] || 1) + 1;

      for (let i = 0; i < pagesNeeded; i++) {
        const currentPage = startPage + i;
        let images: string[] = [];
        let hasMore = true;

        // 检查是否有预取的数据
        if (prefetchState.prefetched[category]?.[currentPage]) {
          images = prefetchState.prefetched[category][currentPage];
          delete prefetchState.prefetched[category][currentPage];
        } else {
          const resp = await fetchDemoHomeImages({
            category,
            page: currentPage,
            perPage: PER_PAGE,
            prefs: currentPrefs
          });
          images = resp.images;
          hasMore = resp.hasMore;
        }

        allImages.push(...images);
        finalHasMore = hasMore;

        // 如果某页没有更多数据，提前结束
        if (!hasMore || images.length < PER_PAGE) {
          dataState.pages[category] = currentPage;
          break;
        } else {
          dataState.pages[category] = currentPage;
        }
      }

      dataState.cache[category].push(...allImages);

      if (allImages.length === 0) {
        dataState.noMoreMap[category] = true;
        dataState.infiniteDisabledMap[category] = true;
      } else if (!finalHasMore) {
        dataState.noMoreMap[category] = true;
        dataState.infiniteDisabledMap[category] = true;
      } else {
        // 根据网速决定是否预取
        if (!smartLoading.config.isSlowNetwork) {
          prefetchManager.prefetchNextPage(category, currentPrefs);
        }
      }

      // 清除错误状态
      errorHandler.clearRetryCount(category);
      if (errorHandler.loadMoreFailedCategories.value.has(category)) {
        errorHandler.loadMoreFailedCategories.value.delete(category);
        errorHandler.updateSkippedDisplay();
      }
    } catch (e) {
      console.warn('[loadMoreHandler] loadMore failed', e);

      const count = errorHandler.incrementRetryCount(category);

      if (count <= MAX_LOAD_MORE_RETRIES) {
        // 指数退避重试
        const delay = 400 * Math.pow(2, count - 1);
        setTimeout(() => {
          if (!dataState.noMoreMap[category] && currentCategory === category) {
            loadMore(null, category, currentCategory, currentPrefs);
          }
        }, delay);
      } else {
        errorHandler.recordLoadMoreFailure(category);
      }
    } finally {
      loadingLocks.loadMoreLock.delete(category);
      dataState.loadingMoreMap[category] = false;
      if (ev && ev.target) ev.target.complete();
    }
  }

  return {
    loadMore
  };
}
