/**
 * 主页数据管理组合式函数
 * 处理分类数据的加载、缓存、预取、分页和错误处理
 */

import { reactive } from 'vue';
import type { DataState, PrefetchState, LoadingLocks } from './types';
import { createPrefetchManager } from './prefetchManager';
import { createErrorHandler } from './errorHandler';
import { createCategoryLoader } from './categoryLoader';
import { createLoadMoreHandler } from './loadMoreHandler';

export function useDataManagement() {
  // 数据状态
  const dataState: DataState = reactive({
    cache: {},
    pages: {},
    noMoreMap: {},
    infiniteDisabledMap: {},
    loadingFirstPageMap: {},
    loadingMoreMap: {}
  });

  // 预取状态
  const prefetchState: PrefetchState = reactive({
    prefetched: {},
    prefetching: {}
  });

  // 加载锁
  const loadingLocks: LoadingLocks = {
    firstPageLoading: {},
    loadMoreLock: new Set()
  };

  // 创建各个管理器
  const errorHandler = createErrorHandler();
  const prefetchManager = createPrefetchManager(prefetchState, dataState);
  const categoryLoader = createCategoryLoader(
    dataState,
    loadingLocks,
    errorHandler,
    prefetchManager
  );
  const loadMoreHandler = createLoadMoreHandler(
    dataState,
    loadingLocks,
    prefetchState,
    errorHandler,
    prefetchManager
  );

  // 手动重新加载分类
  async function manualLoad(cat: string, currentPrefs: any) {
    errorHandler.clearCategoryErrors(cat);
    delete dataState.cache[cat];
    await categoryLoader.loadCategory(cat, currentPrefs);
  }

  // 重置所有数据（用于偏好设置变更）
  async function resetAllForPrefs(
    flatMenus: any[],
    currentFlatIndex: number,
    currentPrefs: any
  ) {
    // 清理所有缓存和状态
    for (const k of Object.keys(dataState.cache)) delete dataState.cache[k];
    for (const k of Object.keys(dataState.pages)) delete dataState.pages[k];
    for (const k of Object.keys(dataState.noMoreMap)) delete dataState.noMoreMap[k];
    for (const k of Object.keys(dataState.infiniteDisabledMap))
      delete dataState.infiniteDisabledMap[k];
    for (const k of Object.keys(dataState.loadingFirstPageMap))
      delete dataState.loadingFirstPageMap[k];
    for (const k of Object.keys(dataState.loadingMoreMap)) delete dataState.loadingMoreMap[k];
    for (const cat of Object.keys(prefetchState.prefetched)) delete prefetchState.prefetched[cat];
    for (const cat of Object.keys(prefetchState.prefetching))
      delete prefetchState.prefetching[cat];

    errorHandler.clearAllErrors();

    // 加载当前扁平菜单项对应的分类
    const currentFlatItem = flatMenus[currentFlatIndex];
    if (currentFlatItem) {
      await categoryLoader.loadCategory(currentFlatItem.category, currentPrefs);
    }

    // 加载其他扁平菜单项的分类
    const loadPromises = [];
    for (let i = 0; i < flatMenus.length; i++) {
      if (i !== currentFlatIndex) {
        loadPromises.push(categoryLoader.loadCategory(flatMenus[i].category, currentPrefs));
      }
    }
    await Promise.all(loadPromises);
  }

  return {
    // 状态
    cache: dataState.cache,
    pages: dataState.pages,
    noMoreMap: dataState.noMoreMap,
    infiniteDisabledMap: dataState.infiniteDisabledMap,
    loadingFirstPageMap: dataState.loadingFirstPageMap,
    loadingMoreMap: dataState.loadingMoreMap,
    skippedCategories: errorHandler.skippedCategories,
    skippedCategoriesDisplay: errorHandler.skippedCategoriesDisplay,
    loadMoreFailedCategories: errorHandler.loadMoreFailedCategories,

    // 方法
    loadCategory: categoryLoader.loadCategory,
    loadMore: loadMoreHandler.loadMore,
    onPrefetchSkip: errorHandler.onPrefetchSkip,
    manualLoad,
    resetAllForPrefs,
    updateSkippedDisplay: errorHandler.updateSkippedDisplay
  };
}
