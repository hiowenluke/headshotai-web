import { ref, computed, onMounted, onUnmounted, readonly, type Ref } from 'vue';

export interface SwipeGestureConfig {
  swipeThreshold?: number; // 触发切换的最小滑动距离（像素）
  swipeMaxTime?: number; // 切换滑动的最大时间（毫秒）
  enableSwipe?: boolean; // 是否启用滑动切换
  gestureDisabled?: boolean | Ref<boolean>; // 是否禁用手势，支持响应式
  // 水平方向锁定判定：更早、更宽松地识别水平手势
  directionLockMinDx?: number; // 锁定为水平前需要的最小水平位移（像素），默认 15
  horizontalDominanceRatio?: number; // 水平相对垂直的主导比例阈值，默认 1.5（dx > dy * 1.5）
  useCapture?: boolean; // 是否在捕获阶段监听，默认 false
}

export interface SwipeGestureCallbacks {
  onSwipeStart?: () => void;
  onSwipeMove?: (offset: number, direction: 'horizontal' | 'vertical') => void;
  onSwipeEnd?: () => void;
  onSwipeLeft?: () => boolean; // 返回 true 表示已处理
  onSwipeRight?: () => boolean; // 返回 true 表示已处理
  onSwipeCancel?: () => void;
}

export interface SwipeGestureState {
  isSwipeActive: boolean;
  swipeDirection: 'horizontal' | 'vertical' | null;
  swipeOffset: number;
  containerWidth: number;
}

/**
 * 通用横向滑动手势处理 Composable
 * 封装了触摸事件处理、方向检测、阈值判断等通用逻辑
 */
export function useSwipeGesture(
  containerRef: Ref<HTMLElement | null>,
  config: SwipeGestureConfig = {},
  callbacks: SwipeGestureCallbacks = {}
) {
  const {
  swipeThreshold = 8, // 降低阈值，让手势更容易触发
  swipeMaxTime = 200, // 减少最大时间，响应更快
  enableSwipe = true,
  gestureDisabled = false,
  directionLockMinDx = 15,
  horizontalDominanceRatio = 1.5,
  useCapture = false
  } = config;

  const {
    onSwipeStart,
    onSwipeMove,
    onSwipeEnd,
    onSwipeLeft,
    onSwipeRight,
    onSwipeCancel
  } = callbacks;

  // 手势状态
  const swipeStartX = ref(0);
  const swipeStartY = ref(0);
  const swipeStartTime = ref(0);
  const isSwipeActive = ref(false);
  const swipeDirection = ref<'horizontal' | 'vertical' | null>(null);
  const swipeOffset = ref(0);
  const containerWidth = ref(0);

  // 组合状态对象
  const state = computed<SwipeGestureState>(() => ({
    isSwipeActive: isSwipeActive.value,
    swipeDirection: swipeDirection.value,
    swipeOffset: swipeOffset.value,
    containerWidth: containerWidth.value
  }));

  // 更新容器宽度
  const updateContainerWidth = () => {
    if (containerRef.value) {
      containerWidth.value = containerRef.value.clientWidth || window.innerWidth;
    } else {
      containerWidth.value = window.innerWidth;
    }
  };

  // 统一判断是否禁用（支持响应式）
  const isDisabled = () =>
    typeof gestureDisabled === 'boolean'
      ? gestureDisabled
      : (gestureDisabled?.value ?? false);

  // 触摸事件处理
  const handleTouchStart = (event: TouchEvent) => {
    if (!enableSwipe || isDisabled()) return;
    
    const touch = event.touches[0];
    swipeStartX.value = touch.clientX;
    swipeStartY.value = touch.clientY;
    swipeStartTime.value = Date.now();
    swipeDirection.value = null;
    swipeOffset.value = 0;
    isSwipeActive.value = false;
    
    onSwipeStart?.();
  };

  const handleTouchMove = (event: TouchEvent) => {
  if (!enableSwipe || isDisabled()) return;
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - swipeStartX.value;
    const deltaY = touch.clientY - swipeStartY.value;
    
    // 如果还没有确定方向，根据移动距离判断
    if (!swipeDirection.value && (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8)) {
      // 可配置的水平滑动检测：
      // 1) dx 必须超过 directionLockMinDx
      // 2) dx 必须相对 dy 具有主导性（dx > dy * horizontalDominanceRatio）
      const isHorizontal = Math.abs(deltaX) > directionLockMinDx &&
                           Math.abs(deltaX) > Math.abs(deltaY) * horizontalDominanceRatio;
      swipeDirection.value = isHorizontal ? 'horizontal' : 'vertical';
      
      if (isHorizontal) {
        isSwipeActive.value = true;
      }
    }
    
    // 只有在横向滑动时才处理和阻止默认行为
    if (swipeDirection.value === 'horizontal' && isSwipeActive.value) {
      event.preventDefault();
      event.stopPropagation();
      
      swipeOffset.value = deltaX;
      onSwipeMove?.(deltaX, 'horizontal');
    }
    // 垂直滑动时完全不干预
  };

  const handleTouchEnd = (event: TouchEvent) => {
  if (!enableSwipe || isDisabled()) return;
    
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - swipeStartX.value;
    const deltaY = touch.clientY - swipeStartY.value;
    const deltaTime = Date.now() - swipeStartTime.value;
    
    let handled = false;
    
    // 只有在横向滑动且活跃状态时才尝试处理滑动切换
    if (swipeDirection.value === 'horizontal' && isSwipeActive.value) {
      // 检查是否满足滑动条件
      const isValidSwipe = Math.abs(deltaX) >= swipeThreshold && 
                          Math.abs(deltaY) <= 50 && // 恢复合理的垂直偏移限制
                          deltaTime <= swipeMaxTime;
      
      if (isValidSwipe) {
        if (deltaX > 0) {
          // 向右滑动
          handled = onSwipeRight?.() || false;
        } else {
          // 向左滑动
          handled = onSwipeLeft?.() || false;
        }
        
        if (handled) {
          event.stopImmediatePropagation();
        }
      }
    }
    
    // 如果是垂直滑动或未处理的情况，确保不调用 onSwipeCancel
    if (!handled && swipeDirection.value === 'horizontal') {
      onSwipeCancel?.();
    }
    
    // 立即重置所有状态
    swipeDirection.value = null;
    isSwipeActive.value = false;
    swipeOffset.value = 0;
    
    onSwipeEnd?.();
  };

  // 触摸取消处理
  const handleTouchCancel = () => {
    swipeDirection.value = null;
    isSwipeActive.value = false;
    swipeOffset.value = 0;
    onSwipeCancel?.();
    onSwipeEnd?.();
  };

  // 绑定事件监听器
  const bindEventListeners = () => {
    const element = containerRef.value;
    if (element) {
      // 对于touchstart和touchend使用passive: true，提升性能
      // 只有touchmove使用passive: false，因为可能需要preventDefault
  element.addEventListener('touchstart', handleTouchStart, { passive: true, capture: useCapture });
  element.addEventListener('touchmove', handleTouchMove, { passive: false, capture: useCapture });
  element.addEventListener('touchend', handleTouchEnd, { passive: true, capture: useCapture });
  element.addEventListener('touchcancel', handleTouchCancel, { passive: true, capture: useCapture });
    }
  };

  // 移除事件监听器
  const unbindEventListeners = () => {
    const element = containerRef.value;
    if (element) {
  element.removeEventListener('touchstart', handleTouchStart, { capture: useCapture } as any);
  element.removeEventListener('touchmove', handleTouchMove, { capture: useCapture } as any);
  element.removeEventListener('touchend', handleTouchEnd, { capture: useCapture } as any);
  element.removeEventListener('touchcancel', handleTouchCancel, { capture: useCapture } as any);
    }
  };

  // 生命周期
  onMounted(() => {
    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    window.addEventListener('orientationchange', updateContainerWidth);
    bindEventListeners();
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateContainerWidth);
    window.removeEventListener('orientationchange', updateContainerWidth);
    unbindEventListeners();
  });

  // 返回状态和方法
  return {
    state: readonly(state),
    updateContainerWidth,
    bindEventListeners,
    unbindEventListeners
  };
}
