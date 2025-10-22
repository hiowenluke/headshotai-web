/**
 * 数据管理相关的类型定义
 */

export interface DataState {
  cache: Record<string, string[]>;
  pages: Record<string, number>;
  noMoreMap: Record<string, boolean>;
  infiniteDisabledMap: Record<string, boolean>;
  loadingFirstPageMap: Record<string, boolean>;
  loadingMoreMap: Record<string, boolean>;
}

export interface PrefetchState {
  prefetched: Record<string, Record<number, string[]>>;
  prefetching: Record<string, Set<number>>;
}

export interface ErrorState {
  skippedCategories: Set<string>;
  skippedCategoriesDisplay: string[];
  loadMoreFailedCategories: Set<string>;
  loadMoreRetryCounts: Record<string, number>;
}

export interface LoadingLocks {
  firstPageLoading: Record<string, Promise<string[]>>;
  loadMoreLock: Set<string>;
}

export const PER_PAGE = 10;
export const MAX_LOAD_MORE_RETRIES = 3;
