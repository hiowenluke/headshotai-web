import { type Ref } from 'vue';

/**
 * 菜单动画处理
 * 负责打开和关闭动画
 */
export function createMenuAnimations(
  panelRef: Ref<HTMLElement | null>,
  overlayAlpha: Ref<number>,
  onFinishClose: () => void
) {
  /**
   * 执行打开动画
   */
  function doOpenAnimation() {
    const el = panelRef.value;
    if (!el) return;

    el.style.transition = 'none';
    el.style.transform = 'translateX(-100%)';
    void el.offsetWidth; // 强制重排
    el.style.transition = 'transform 300ms cubic-bezier(0.36,0.66,0.04,1)';
    el.style.transform = 'translateX(0)';

    // 遮罩淡入
    overlayAlpha.value = 0;
    requestAnimationFrame(() => {
      overlayAlpha.value = 1;
    });
    requestAnimationFrame(() => {
      try {
        (el.querySelector('.close-btn') as HTMLButtonElement)?.focus();
      } catch {
        /* ignore */
      }
    });
  }

  /**
   * 执行关闭动画
   */
  function doCloseAnimation() {
    const el = panelRef.value;
    if (!el) return onFinishClose();

    el.style.transition = 'transform 260ms cubic-bezier(0.36,0.66,0.04,1)';
    el.style.transform = 'translateX(-100%)';

    // 遮罩淡出
    overlayAlpha.value = 0;
    setTimeout(() => onFinishClose(), 270);
  }

  return {
    doOpenAnimation,
    doCloseAnimation
  };
}
