// 模态框动画管理组合式函数
// 处理进入和退出动画

import { createVerticalEnterAnimation, createVerticalLeaveAnimation } from '@/components/animation/VerticalAnimation';
import { createHorizontalEnterAnimation, createHorizontalLeaveAnimation } from '@/components/animation/HorizontalAnimation';

export function useModalAnimation(modalMode: any, modalState: any) {
  // Modal 完全展示后触发
  function handleDidPresent() {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('modal-did-present', {
        detail: {
          type: 'PageLikeModal',
          mode: modalMode.modalDirection.value,
          timestamp: Date.now()
        }
      }));
    }
  }

  // 自定义进入动画
  const enterAnimation = (baseEl: any) => {
    if (modalMode.isVerticalMode.value) {
      return createVerticalEnterAnimation(baseEl);
    } else {
      return createHorizontalEnterAnimation(baseEl);
    }
  };

  // 自定义退出动画
  const leaveAnimation = (baseEl: any) => {
    modalState.setExiting(true);
    
    let animation;
    if (modalMode.isVerticalMode.value) {
      animation = createVerticalLeaveAnimation(baseEl);
    } else {
      animation = createHorizontalLeaveAnimation(baseEl);
    }
    
    // 动画完成后重置状态
    animation.onFinish(() => {
      modalState.setExiting(false);
    });
    
    return animation;
  };

  return {
    handleDidPresent,
    enterAnimation,
    leaveAnimation
  };
}