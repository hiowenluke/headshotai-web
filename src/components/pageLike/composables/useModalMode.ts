// 模态框模式管理组合式函数
// 处理垂直/水平模式的判断和相关配置

import { computed } from 'vue';

export function useModalMode(props: any) {
  // 模式相关计算属性
  function normalizeModalStyle(style: string | undefined): 'vertical' | 'horizontal' | 'x' {
    const v = (style || '').toLowerCase();
    if (v === 'vertical' || v === 'V' || v === 'v') return 'vertical';
    if (v === 'horizontal' || v === 'H' || v === 'h') return 'horizontal';
    if (v === 'x') return 'x';
    throw new Error(`[PageLikeModal] Invalid modalStyle: ${style}`);
  }

  const modalDirection = computed(() => normalizeModalStyle(props.modalStyle));
  const isVerticalMode = computed(() => modalDirection.value === 'vertical');
  const isXMode = computed(() => modalDirection.value === 'x');

  // 排除选择器配置
  const vModeExcludeSelector = computed(() => {
    // V 模式和 X 模式都使用相同的排除选择器
    if (isVerticalMode.value || isXMode.value) {
      return '.plm-back, .return-button, .close-button, .down-button-wrapper, .primary-btn, .secondary-btn, .demo-thumb, input, textarea, select, .ion-activatable, .swiper, .scroll-area, .plm-bottom-area';
    }
    return '.plm-back';
  });

  const hModeExcludeSelector = computed(() => {
    return '.plm-back, .return-button, .close-button, .down-button-wrapper, .base-modal-button, .primary-btn, .secondary-btn, .demo-thumb, input, textarea, select, .ion-activatable:not(.gesture-enabled-list *), .swiper, .scroll-area, ion-button, button';
  });

  return {
    modalDirection,
    isVerticalMode,
    isXMode,
    vModeExcludeSelector,
    hModeExcludeSelector,
    normalizeModalStyle
  };
}