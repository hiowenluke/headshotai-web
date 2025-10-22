// 观察器管理组合式函数
import { ref, onUnmounted, type Ref } from 'vue';

type AdaptiveContentRef = Ref<{ $el?: HTMLElement } | null>;

export function useObservers() {
  // 存储观察器引用，用于清理
  const resizeObserver = ref<ResizeObserver | null>(null);
  const mutationObserver = ref<MutationObserver | null>(null);

  // 初始化监听器
  const initializeObservers = (
    adaptiveContentRef: AdaptiveContentRef,
    updateContainerSize: (ref: AdaptiveContentRef) => void,
    updateContainerSizeDelayed: (ref: AdaptiveContentRef, delay?: number) => void
  ) => {
    if (!adaptiveContentRef.value?.$el) return;

    const element = adaptiveContentRef.value.$el;

    // ResizeObserver - 监听元素尺寸变化
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver.value = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === element) {
            updateContainerSize(adaptiveContentRef);
          }
        }
      });
      resizeObserver.value.observe(element);
    }

    // MutationObserver - 监听样式变化
    mutationObserver.value = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
          updateContainerSizeDelayed(adaptiveContentRef, 50);
        }
      });
    });

    mutationObserver.value.observe(element, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  };

  // 清理观察器
  const cleanupObservers = () => {
    if (resizeObserver.value) {
      resizeObserver.value.disconnect();
      resizeObserver.value = null;
    }
    if (mutationObserver.value) {
      mutationObserver.value.disconnect();
      mutationObserver.value = null;
    }
  };

  // 组件卸载时自动清理
  onUnmounted(() => {
    cleanupObservers();
  });

  return {
    initializeObservers,
    cleanupObservers
  };
}