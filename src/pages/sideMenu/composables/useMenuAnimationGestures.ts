import { ref, nextTick, onBeforeUnmount, reactive } from 'vue';
import { createMenuAnimations } from './menuAnimation/animations';
import { createHorizontalGesture } from './menuAnimation/horizontalGesture';
import { createBounceScroll } from './menuAnimation/bounceScroll';
import type { GestureState, BounceState } from './menuAnimation/types';

/**
 * 菜单动画和手势管理组合式函数
 * 处理菜单的打开/关闭动画和滑动手势
 */
export function useMenuAnimationGestures(emit: (event: 'close') => void) {
  // DOM 引用
  const panelRef = ref<HTMLElement | null>(null);
  const scrollOuterRef = ref<HTMLElement | null>(null);
  const scrollInnerRef = ref<HTMLElement | null>(null);

  // 状态管理
  const showing = ref(false);
  const overlayAlpha = ref(0);
  let lastFocus: Element | null = null;

  // 手势状态
  const gestureState: GestureState = reactive({
    startX: null,
    startY: null,
    dragging: false,
    direction: 'none',
    lastMoveX: 0,
    lastMoveTime: 0,
    velocityX: 0
  });

  // 弹性滚动状态
  const bounceState: BounceState = reactive({
    dragging: false,
    startY: 0,
    lastY: 0,
    startX: 0,
    lastX: 0,
    lockedDirection: '',
    pulling: false,
    direction: 0,
    maxOffset: 80
  });

  /**
   * 完成关闭
   */
  function finishClose() {
    showing.value = false;
    try {
      horizontalGesture.detachGesture();
      bounceScroll.detachBounce();
    } catch {
      /* ignore */
    }
    try {
      document.documentElement.style.overflow = '';
    } catch {
      /* ignore */
    }
    try {
      (lastFocus as HTMLElement | null)?.focus();
    } catch {
      /* ignore */
    }
    emit('close');
  }

  // 创建动画处理器
  const animations = createMenuAnimations(panelRef, overlayAlpha, finishClose);

  // 创建水平手势处理器
  const horizontalGesture = createHorizontalGesture(
    panelRef,
    overlayAlpha,
    showing,
    gestureState,
    finishClose
  );

  // 创建弹性滚动处理器
  const bounceScroll = createBounceScroll(scrollOuterRef, scrollInnerRef, bounceState);

  /**
   * 打开菜单
   */
  function openInternal() {
    if (showing.value) return;

    try {
      lastFocus = document.activeElement;
    } catch {
      /* ignore */
    }
    showing.value = true;

    nextTick(() => {
      animations.doOpenAnimation();
      try {
        document.documentElement.style.overflow = 'hidden';
      } catch {
        /* ignore */
      }

      // 延迟绑定手势
      setTimeout(() => {
        horizontalGesture.attachGesture();
        // 再延迟绑定弹性滚动
        setTimeout(() => {
          bounceScroll.attachBounce();
        }, 50);
      }, 100);
    });
  }

  /**
   * 关闭菜单
   */
  function closeInternal() {
    if (!showing.value) return;
    animations.doCloseAnimation();
  }

  /**
   * 按钮关闭
   */
  function closeByBtn() {
    closeInternal();
  }

  // 清理
  onBeforeUnmount(() => {
    horizontalGesture.detachGesture();
  });

  // 热重载清理
  try {
    (import.meta as any).hot?.on?.('vite:beforeFullReload', () => {
      horizontalGesture.detachGesture();
    });
  } catch {
    /* ignore */
  }

  return {
    // DOM 引用
    panelRef,
    scrollOuterRef,
    scrollInnerRef,

    // 状态
    showing,
    overlayAlpha,

    // 动画方法
    openInternal,
    closeInternal,
    closeByBtn,

    // 手势方法
    attachGesture: horizontalGesture.attachGesture,
    detachGesture: horizontalGesture.detachGesture,

    // 弹性滚动方法
    attachBounce: bounceScroll.attachBounce,
    detachBounce: bounceScroll.detachBounce,
    getScrollEl: bounceScroll.getScrollEl
  };
}
