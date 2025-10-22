import { ref } from 'vue';

/**
 * 滚动状态管理
 * 管理用户滚动、程序滚动等状态
 */
export function useScrollState() {
  const isScrolling = ref(false);
  const isUserScrolling = ref(false);
  const initialScrollLeft = ref(0);
  const initialActiveIndex = ref(0);
  const hasDirectionSwitched = ref(false);
  const lastEmittedIndex = ref(0);

  let scrollTimeout: NodeJS.Timeout | null = null;

  function startUserScroll(scrollLeft: number, activeIndex: number) {
    isUserScrolling.value = true;
    initialScrollLeft.value = scrollLeft;
    initialActiveIndex.value = activeIndex;
    hasDirectionSwitched.value = false;
  }

  function endUserScroll() {
    isUserScrolling.value = false;
    hasDirectionSwitched.value = false;
  }

  function markScrolling() {
    isScrolling.value = true;

    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    scrollTimeout = setTimeout(() => {
      isScrolling.value = false;
    }, 200);
  }

  function cleanup() {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
  }

  return {
    isScrolling,
    isUserScrolling,
    initialScrollLeft,
    initialActiveIndex,
    hasDirectionSwitched,
    lastEmittedIndex,
    startUserScroll,
    endUserScroll,
    markScrolling,
    cleanup
  };
}
