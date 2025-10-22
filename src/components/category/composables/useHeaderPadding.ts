/**
 * Header 高度计算模块
 * 动态计算和更新 header padding
 */

import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';

interface HeaderPaddingOptions {
  headerPadding?: number;
  autoDetectHeader?: boolean;
  headerSelector?: string;
  useFixedPosition?: boolean;
  applyAbsolutePadding?: boolean;
  additionalHeaderOffset?: number;
}

export function useHeaderPadding(options: HeaderPaddingOptions, gestureRef: any) {
  const headerPaddingTop = ref(90);
  const listVisible = ref(false);

  const panelPaddingTop = computed(() => {
    const offset = options.additionalHeaderOffset ?? 0;
    if (options.useFixedPosition) return headerPaddingTop.value + offset;
    return options.applyAbsolutePadding ? headerPaddingTop.value + offset : offset;
  });

  const cssVars = computed(() => ({
    '--header-padding': `${headerPaddingTop.value}px`,
    '--use-fixed-position': options.useFixedPosition ? '1' : '0',
    '--panel-padding-top': `${panelPaddingTop.value}px`
  }));

  function updateHeaderPadding() {
    // 如果提供了固定的 headerPadding，直接使用
    if (options.headerPadding !== undefined) {
      headerPaddingTop.value = options.headerPadding;
      return;
    }

    // 如果明确禁用自动检测，使用 0
    if (options.autoDetectHeader === false) {
      headerPaddingTop.value = 0;
      return;
    }

    // 默认行为：自动检测 header 高度
    try {
      const selector = options.headerSelector || '.home-header';
      const header = document.querySelector(selector) as HTMLElement;

      if (header) {
        const headerRect = header.getBoundingClientRect();
        const effectiveHeight = headerRect.bottom;
        headerPaddingTop.value = effectiveHeight;
      } else {
        headerPaddingTop.value = 90;
      }
    } catch (error) {
      console.warn('[useHeaderPadding] Failed to calculate header height:', error);
      headerPaddingTop.value = 90;
    }
  }

  function waitForHeaderStable(activeIndex: number) {
    try {
      let attempts = 0;
      let prev = headerPaddingTop.value;

      const tick = () => {
        updateHeaderPadding();
        const curr = headerPaddingTop.value;

        if (Math.abs(curr - prev) <= 1 || attempts >= 3) {
          listVisible.value = true;
          // 显示后立即校正水平偏移
          nextTick(() => {
            try {
              gestureRef.value?.updatePanelWidth?.();
              gestureRef.value?.scrollToPanel?.(activeIndex, false);
            } catch {
              /* ignore */
            }
          });
        } else {
          prev = curr;
          attempts += 1;
          setTimeout(tick, 80);
        }
      };

      setTimeout(tick, 80);
    } catch {
      // 兜底：即便出现异常，也不要阻塞显示
      setTimeout(() => (listVisible.value = true), 120);
    }
  }

  onMounted(() => {
    updateHeaderPadding();
    window.addEventListener('resize', updateHeaderPadding);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateHeaderPadding);
  });

  return {
    headerPaddingTop,
    listVisible,
    cssVars,
    updateHeaderPadding,
    waitForHeaderStable
  };
}
