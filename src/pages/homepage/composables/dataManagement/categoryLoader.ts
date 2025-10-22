/**
 * 分类加载模块
 * 处理首次加载和加载更多逻辑
 */

import { fetchDemoHomeImages } from '@/services/imageService';
import {
  getSmartLoadingConfig,
  startNetworkSpeedDetection,
  completeNetworkSpeedDetection
} from '@/utils/smartLoading';
import type { DataState, LoadingLocks } from './types';
import { PER_PAGE } from './types';

export function createCategoryLoader(
  dataState: DataState,
  loadingLocks: LoadingLocks,
  errorHandler: any,
  prefetchManager: any
) {
  const smartLoading = getSmartLoadingConfig();

  // 加载分类数据（集成智能加载逻辑）
  async function loadCategory(
    category: string,
    currentPrefs: any,
    isFirstMenu: boolean = false
  ): Promise<string[]> {
    // 检查缓存
    if (dataState.cache[category] && dataState.cache[category].length > 0) {
      return dataState.cache[category];
    }

    // 检查是否正在加载
    if (Object.prototype.hasOwnProperty.call(loadingLocks.firstPageLoading, category)) {
      return loadingLocks.firstPageLoading[category];
    }

    const loadPromise = (async () => {
      dataState.loadingFirstPageMap[category] = true;

      // 获取智能加载策略
      const strategy = smartLoading.getLoadingStrategy(category, isFirstMenu);
      const cardsToLoad = smartLoading.getCardsPerLoad(strategy.screensToLoad);
      const pagesNeeded = Math.ceil(cardsToLoad / PER_PAGE);

      // 开始网速检测（仅第一次加载）
      if (!smartLoading.config.networkSpeedDetected && isFirstMenu) {
        startNetworkSpeedDetection(category);
      }

      try {
        // 加载多页数据
        const allImages: string[] = [];
        let finalHasMore = true;

        for (let page = 1; page <= pagesNeeded; page++) {
          const { images, hasMore } = await fetchDemoHomeImages({
            category,
            page,
            perPage: PER_PAGE,
            prefs: currentPrefs
          });

          allImages.push(...images);
          finalHasMore = hasMore;

          // 如果某页没有更多数据，提前结束
          if (!hasMore || images.length < PER_PAGE) {
            break;
          }
        }

        dataState.pages[category] = pagesNeeded;
        dataState.cache[category] = allImages;
        dataState.noMoreMap[category] = !finalHasMore;
        dataState.infiniteDisabledMap[category] = !finalHasMore;

        // 完成网速检测
        if (!smartLoading.config.networkSpeedDetected && isFirstMenu) {
          completeNetworkSpeedDetection(category, true);

          // 触发后续加载策略
          if (!smartLoading.config.isSlowNetwork && strategy.shouldAutoLoadOthers) {
            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent('auto-load-other-menus', {
                  detail: { excludeCategory: category }
                })
              );
            }, 100);
          }
        }

        // 清除错误状态
        if (errorHandler.skippedCategories.value.has(category)) {
          errorHandler.skippedCategories.value.delete(category);
          errorHandler.updateSkippedDisplay();
        }

        // 根据策略决定是否预取下一页
        if (finalHasMore && !smartLoading.config.isSlowNetwork) {
          prefetchManager.prefetchNextPage(category, currentPrefs);
        }

        return dataState.cache[category];
      } catch (error) {
        // 网速检测失败处理
        if (!smartLoading.config.networkSpeedDetected && isFirstMenu) {
          completeNetworkSpeedDetection(category, false);
        }
        throw error;
      }
    })();

    loadingLocks.firstPageLoading[category] = loadPromise;

    try {
      return await loadPromise;
    } finally {
      delete loadingLocks.firstPageLoading[category];
      dataState.loadingFirstPageMap[category] = false;
    }
  }

  return {
    loadCategory
  };
}
