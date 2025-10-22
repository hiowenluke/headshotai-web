/**
 * 全局事件处理模块
 * 处理防止缩放和历史控制
 */

import { isSafari, isIOS } from './authHandler';

export function setupGlobalZoomPrevention() {
  let lastTouchEnd = 0;

  function onGlobalTouchEnd(e: TouchEvent) {
    const now = Date.now();
    if (now - lastTouchEnd <= 320) {
      // 视为双击，阻止缩放
      if (e.cancelable) e.preventDefault();
    }
    lastTouchEnd = now;
  }

  // 阻止双指缩放
  function onGestureStart(e: Event) {
    e.preventDefault();
  }

  // 避免重复绑定
  if (!(window as any)._noDoubleTapBound) {
    document.addEventListener('touchend', onGlobalTouchEnd, {
      passive: false,
      capture: true
    });
    (window as any)._noDoubleTapBound = true;
  }

  if (!(window as any)._noGestureBound) {
    document.addEventListener('gesturestart', onGestureStart as any, { passive: false });
    (window as any)._noGestureBound = true;
  }
}

export function setupHistoryControl() {
  setTimeout(() => {
    if (isSafari || isIOS) {
      // Safari 使用更温和的历史控制
      try {
        window.history.replaceState({ safariAuth: true }, document.title, window.location.href);
      } catch {
        /* ignore */
      }
    } else {
      // 其他浏览器使用原有逻辑
      window.history.replaceState(null, document.title, window.location.href);
      window.history.pushState(null, document.title, window.location.href);
    }
  }, 100);
}

export function cleanupInlineStyles() {
  // 挂载后移除首屏内联防闪样式
  const inlineStyle = document.querySelector('body > style');
  if (
    inlineStyle &&
    inlineStyle.textContent &&
    inlineStyle.textContent.includes('--ion-background-color')
  ) {
    requestAnimationFrame(() => inlineStyle.remove());
  }
}
