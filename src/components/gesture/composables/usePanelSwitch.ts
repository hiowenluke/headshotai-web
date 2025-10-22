import { type Ref } from 'vue';

/**
 * 面板切换逻辑
 * 根据滑动距离和阈值决定是否切换面板
 */
export function usePanelSwitch(
  panelWidth: Ref<number>,
  itemsLength: number,
  switchThreshold: number
) {
  /**
   * 检查是否应该切换面板
   */
  function shouldSwitchPanel(
    scrollDistance: number,
    initialIndex: number
  ): { shouldSwitch: boolean; targetIndex: number } {
    const scrollPercentage = Math.abs(scrollDistance) / panelWidth.value;
    const effectiveThreshold = Math.max(switchThreshold, 0.02); // 最小2%

    // 检查是否可以切换到目标面板
    const canSwitchRight = scrollDistance > 0 && initialIndex < itemsLength - 1;
    const canSwitchLeft = scrollDistance < 0 && initialIndex > 0;

    let shouldSwitch = false;
    let targetIndex = initialIndex;

    if (canSwitchRight && scrollPercentage >= effectiveThreshold) {
      shouldSwitch = true;
      targetIndex = initialIndex + 1;
    } else if (canSwitchLeft && scrollPercentage >= effectiveThreshold) {
      shouldSwitch = true;
      targetIndex = initialIndex - 1;
    }

    return { shouldSwitch, targetIndex };
  }

  /**
   * 检查滚动中是否应该立即切换（用于实时反馈）
   */
  function checkImmediateSwitch(
    scrollDistance: number,
    initialIndex: number
  ): { canSwitch: boolean; targetIndex: number } {
    const scrollPercentage = Math.abs(scrollDistance) / panelWidth.value;

    const canSwitchRight = scrollDistance > 0 && initialIndex < itemsLength - 1;
    const canSwitchLeft = scrollDistance < 0 && initialIndex > 0;

    if (scrollPercentage >= switchThreshold && (canSwitchRight || canSwitchLeft)) {
      const targetIndex = canSwitchRight ? initialIndex + 1 : initialIndex - 1;
      return { canSwitch: true, targetIndex };
    }

    return { canSwitch: false, targetIndex: initialIndex };
  }

  return {
    shouldSwitchPanel,
    checkImmediateSwitch
  };
}
