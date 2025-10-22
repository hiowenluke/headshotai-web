/**
 * 错误处理模块
 * 处理加载失败、重试和跳过逻辑
 */

import { ref, type Ref } from 'vue';
import type { ErrorState } from './types';

export function createErrorHandler() {
  const skippedCategories = ref<Set<string>>(new Set());
  const skippedCategoriesDisplay = ref<string[]>([]);
  const loadMoreFailedCategories = ref<Set<string>>(new Set());
  const loadMoreRetryCounts: Record<string, number> = {};

  // 更新跳过的分类显示
  function updateSkippedDisplay(flatMenus?: any[]) {
    const union = new Set<string>();
    skippedCategories.value.forEach((c) => union.add(c));
    loadMoreFailedCategories.value.forEach((c) => union.add(c));

    if (flatMenus) {
      // 基于扁平菜单的分类排序
      const flatMenuCategories = flatMenus.map((item) => item.category);
      skippedCategoriesDisplay.value = Array.from(union.values()).sort(
        (a, b) => flatMenuCategories.indexOf(a) - flatMenuCategories.indexOf(b)
      );
    } else {
      skippedCategoriesDisplay.value = Array.from(union.values());
    }
  }

  // 处理预取跳过
  function onPrefetchSkip(cat: string) {
    skippedCategories.value.add(cat);
    updateSkippedDisplay();
  }

  // 清除分类的错误状态
  function clearCategoryErrors(cat: string) {
    if (loadMoreFailedCategories.value.has(cat)) {
      loadMoreFailedCategories.value.delete(cat);
    }
    if (skippedCategories.value.has(cat)) {
      skippedCategories.value.delete(cat);
    }
    delete loadMoreRetryCounts[cat];
    updateSkippedDisplay();
  }

  // 记录加载更多失败
  function recordLoadMoreFailure(cat: string) {
    loadMoreFailedCategories.value.add(cat);
    updateSkippedDisplay();
  }

  // 获取重试次数
  function getRetryCount(cat: string): number {
    return loadMoreRetryCounts[cat] || 0;
  }

  // 增加重试次数
  function incrementRetryCount(cat: string): number {
    const count = (loadMoreRetryCounts[cat] || 0) + 1;
    loadMoreRetryCounts[cat] = count;
    return count;
  }

  // 清除重试次数
  function clearRetryCount(cat: string) {
    delete loadMoreRetryCounts[cat];
  }

  // 清除所有错误状态
  function clearAllErrors() {
    loadMoreFailedCategories.value.clear();
    for (const k of Object.keys(loadMoreRetryCounts)) {
      delete loadMoreRetryCounts[k];
    }
    updateSkippedDisplay();
  }

  return {
    skippedCategories,
    skippedCategoriesDisplay,
    loadMoreFailedCategories,
    loadMoreRetryCounts,
    updateSkippedDisplay,
    onPrefetchSkip,
    clearCategoryErrors,
    recordLoadMoreFailure,
    getRetryCount,
    incrementRetryCount,
    clearRetryCount,
    clearAllErrors
  };
}
