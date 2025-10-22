// 模态框手势管理组合式函数
// 处理滑动手势、底部区域手势和相关事件

import { ref, watch } from 'vue';
import { useSwipeGesture } from '@/composables/useSwipeGesture';

export function useModalGestures(props: any, modalState: any, tabManagement: any) {
  // 手势配置常量
  const VELOCITY_THRESHOLD = 0.15;
  const TAB_SWIPE_THRESHOLD = 12;
  const TAB_SWIPE_MAX_TIME = 600;

  // 底部区域引用
  const bottomAreaRef = ref<HTMLElement | null>(null);
  const bottomAreaSwipeDisabled = ref(false);
  const bottomButtonAreaRef = ref<HTMLElement | null>(null);

  // 手势处理函数
  function handleSwipeStart() {
    modalState.setSwipeInProgress(true);
    modalState.setSwipeProgress(0);
  }

  function handleSwipeMove(progress: number) {
    modalState.setSwipeProgress(progress);
  }

  function handleSwipeEnd() {
    modalState.setSwipeInProgress(false);
    modalState.setSwipeProgress(0);
  }

  function handleSwipeCancel() {
    handleSwipeEnd();
  }

  // 处理手势方向锁定
  function handleGestureDirectionLocked(direction: 'vertical' | 'horizontal' | null) {
    modalState.setGestureDisabled(direction === 'vertical');
  }

  // Tab 切换手势处理
  function handleTabSwipeStart() {
    // Tab切换开始时的处理
  }

  function handleTabSwipeMove(offset: number) {
    // Tab切换移动时的处理
    offset; // 避免未使用警告
  }

  function handleTabSwipeEnd() {
    // Tab切换结束时的处理
  }

  // 滑动退出处理
  function performSwipeExit() {
    // 通知全局状态
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('modal-will-close', {
        detail: {
          type: 'PageLikeModal',
          mode: props.modalStyle,
          timestamp: Date.now()
        }
      }));
    }

    modalState.emitClose();

    // 关闭完成后通知
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('modal-did-close', {
          detail: {
            type: 'PageLikeModal',
            mode: props.modalStyle,
            timestamp: Date.now()
          }
        }));
      }
    }, 300);
  }

  // 底部区域滑动手势
  const bottomSwipe = useSwipeGesture(bottomAreaRef, {
    enableSwipe: true,
    swipeThreshold: 8,
    swipeMaxTime: 700,
    gestureDisabled: bottomAreaSwipeDisabled,
    directionLockMinDx: 10,
    horizontalDominanceRatio: 1.2,
    useCapture: true
  }, {
    onSwipeLeft: () => {
      if (!tabManagement.tabs.value?.length) return false;
      const idx = tabManagement.tabs.value.findIndex((t: any) => t.key === tabManagement.currentTab.value);
      const can = idx < tabManagement.tabs.value.length - 1;
      if (can) tabManagement.switchTab(tabManagement.tabs.value[idx + 1].key);
      return can;
    },
    onSwipeRight: () => {
      if (!tabManagement.tabs.value?.length) return false;
      const idx = tabManagement.tabs.value.findIndex((t: any) => t.key === tabManagement.currentTab.value);
      const can = idx > 0;
      if (can) tabManagement.switchTab(tabManagement.tabs.value[idx - 1].key);
      return can;
    }
  });

  // 底部按钮区域滑动手势
  const bottomButtonSwipe = useSwipeGesture(bottomButtonAreaRef, {
    enableSwipe: true,
    swipeThreshold: 8,
    swipeMaxTime: 700,
    gestureDisabled: bottomAreaSwipeDisabled,
    directionLockMinDx: 8,
    horizontalDominanceRatio: 1.1,
    useCapture: true
  }, {
    onSwipeLeft: () => {
      if (!tabManagement.tabs.value?.length) return false;
      const idx = tabManagement.tabs.value.findIndex((t: any) => t.key === tabManagement.currentTab.value);
      const can = idx < tabManagement.tabs.value.length - 1;
      if (can) tabManagement.switchTab(tabManagement.tabs.value[idx + 1].key);
      return can;
    },
    onSwipeRight: () => {
      if (!tabManagement.tabs.value?.length) return false;
      const idx = tabManagement.tabs.value.findIndex((t: any) => t.key === tabManagement.currentTab.value);
      const can = idx > 0;
      if (can) tabManagement.switchTab(tabManagement.tabs.value[idx - 1].key);
      return can;
    }
  });

  // 监听底部区域引用变化
  watch(bottomAreaRef, (el, oldEl) => {
    if (oldEl) {
      bottomSwipe.unbindEventListeners?.();
    }
    if (el) {
      requestAnimationFrame(() => bottomSwipe.bindEventListeners?.());
      bottomButtonAreaRef.value = el.querySelector('.button-area');
    }
  });

  watch(bottomButtonAreaRef, (el, oldEl) => {
    if (oldEl) {
      bottomButtonSwipe.unbindEventListeners?.();
    }
    if (el) {
      requestAnimationFrame(() => bottomButtonSwipe.bindEventListeners?.());
    }
  });

  return {
    // 常量
    VELOCITY_THRESHOLD,
    TAB_SWIPE_THRESHOLD,
    TAB_SWIPE_MAX_TIME,
    
    // 引用
    bottomAreaRef,
    bottomAreaSwipeDisabled,
    bottomButtonAreaRef,
    
    // 手势处理函数
    handleSwipeStart,
    handleSwipeMove,
    handleSwipeEnd,
    handleSwipeCancel,
    handleGestureDirectionLocked,
    handleTabSwipeStart,
    handleTabSwipeMove,
    handleTabSwipeEnd,
    performSwipeExit
  };
}