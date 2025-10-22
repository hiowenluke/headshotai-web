import { ref, type Ref } from 'vue';

/**
 * 滚动位置计算
 * 计算面板宽度和滚动位置
 */
export function useScrollPosition(
  viewport: Ref<HTMLElement | null>,
  scrollContainer: Ref<HTMLElement | null>,
  leftMargin: number
) {
  const panelWidth = ref(0);

  function updatePanelWidth() {
    panelWidth.value = viewport.value?.clientWidth || window.innerWidth;
  }

  function scrollToPanel(index: number, useAnimation: boolean = true) {
    if (!scrollContainer.value) return;

    // 考虑左边距，计算正确的滚动位置
    const leftMarginPx = panelWidth.value * (leftMargin / 100);
    const targetScrollLeft = index * panelWidth.value + leftMarginPx;

    scrollContainer.value.scrollTo({
      left: targetScrollLeft,
      behavior: useAnimation ? 'smooth' : 'auto'
    });
  }

  return {
    panelWidth,
    updatePanelWidth,
    scrollToPanel
  };
}
