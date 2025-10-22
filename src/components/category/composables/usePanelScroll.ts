/**
 * 面板滚动处理模块
 * 处理面板滚动和无限加载触发
 */

import { ref, watch } from 'vue';

interface ScrollOptions {
  activeIndex: number;
  menus: any[];
  infiniteDisabledMap: Record<string, boolean>;
  noMoreMap: Record<string, boolean>;
  loadingMoreMap?: Record<string, boolean>;
}

export function usePanelScroll(options: () => ScrollOptions, emit: any) {
  const panelRefs = ref<HTMLElement[]>([]);

  function setPanelRef(el: any, index: number) {
    if (el && el instanceof HTMLElement) {
      panelRefs.value[index] = el;
      // 为 ion-infinite-scroll 设置滚动容器
      el.classList.add('ion-content-scroll-host');

      // 轻量级的滚动确保机制（只在 macOS Chrome 上应用）
      const isMacChrome =
        navigator.userAgent.includes('Mac') && navigator.userAgent.includes('Chrome');
      if (isMacChrome) {
        el.style.overflowY = 'auto';
        el.style.overflowX = 'hidden';
        (el.style as any).webkitOverflowScrolling = 'touch';
      }
    }
  }

  function onPanelScroll(event: Event) {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    // 计算距离底部的距离
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const threshold = 100; // 100px 阈值

    // 当接近底部时触发加载更多
    if (distanceFromBottom <= threshold) {
      triggerLoadMore(target);
    }

    // 阻止滚动事件冒泡
    event.stopPropagation();
  }

  function triggerLoadMore(panelElement: HTMLElement) {
    try {
      const opts = options();
      const currentMenuItem = opts.menus[opts.activeIndex];
      const currentCategory = currentMenuItem.category;

      // 检查是否可以加载更多
      const isDisabled = opts.infiniteDisabledMap[currentCategory];
      const isNoMore = opts.noMoreMap[currentCategory];
      const isLoadingMore = opts.loadingMoreMap && opts.loadingMoreMap[currentCategory];

      if (isDisabled || isNoMore || isLoadingMore) {
        return;
      }

      // 查找 ion-infinite-scroll 元素并创建模拟事件
      const infiniteScroll = panelElement.querySelector('ion-infinite-scroll');
      if (infiniteScroll) {
        const mockEvent = {
          target: infiniteScroll,
          complete: () => {
            // 加载更多完成
          }
        };

        emit('load-more', { event: mockEvent, category: currentCategory });
      }
    } catch (error: any) {
      console.warn('[usePanelScroll] Load more error:', error?.message || 'Unknown error');
    }
  }

  function scrollToTop() {
    const opts = options();
    const currentPanel = panelRefs.value[opts.activeIndex];
    if (currentPanel) {
      currentPanel.scrollTop = 0;
    }
  }

  // 监听 activeIndex 变化，滚动到顶部
  watch(
    () => options().activeIndex,
    () => {
      setTimeout(() => {
        scrollToTop();
      }, 50);
    }
  );

  return {
    panelRefs,
    setPanelRef,
    onPanelScroll,
    scrollToTop
  };
}
