import { ref } from 'vue';

/**
 * 触摸手势检测
 * 负责检测水平/垂直滑动方向
 */
export function useTouchGesture() {
  const touchStartX = ref(0);
  const touchStartY = ref(0);
  const isHorizontalGesture = ref(false);
  const gestureDetected = ref(false);

  function startGesture(event: TouchEvent) {
    const touch = event.touches[0];
    touchStartX.value = touch.clientX;
    touchStartY.value = touch.clientY;
    isHorizontalGesture.value = false;
    gestureDetected.value = false;
  }

  function detectGestureDirection(event: TouchEvent) {
    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartX.value;
    const deltaY = touch.clientY - touchStartY.value;

    // 首次检测手势方向
    if (!gestureDetected.value && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
      gestureDetected.value = true;
      isHorizontalGesture.value = Math.abs(deltaX) > Math.abs(deltaY);
    }

    return { deltaX, deltaY };
  }

  function resetGesture() {
    isHorizontalGesture.value = false;
    gestureDetected.value = false;
  }

  return {
    touchStartX,
    touchStartY,
    isHorizontalGesture,
    gestureDetected,
    startGesture,
    detectGestureDirection,
    resetGesture
  };
}
