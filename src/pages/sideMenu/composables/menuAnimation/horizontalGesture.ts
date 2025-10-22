import { type Ref } from 'vue';
import type { GestureState } from './types';

/**
 * 水平滑动手势处理
 * 负责处理关闭菜单的滑动手势
 */
export function createHorizontalGesture(
  panelRef: Ref<HTMLElement | null>,
  overlayAlpha: Ref<number>,
  showing: Ref<boolean>,
  gestureState: GestureState,
  onFinishClose: () => void
) {
  /**
   * 触摸开始
   */
  function onTouchStart(ev: TouchEvent) {
    if (!showing.value) return;

    const t = ev.touches[0];
    gestureState.startX = t.clientX;
    gestureState.startY = t.clientY;
    gestureState.dragging = true;
    gestureState.direction = 'none';
    gestureState.velocityX = 0;
    gestureState.lastMoveX = t.clientX;
    gestureState.lastMoveTime = performance.now();

    const el = panelRef.value;
    if (el) {
      el.style.transition = 'none';
    }
  }

  /**
   * 触摸移动
   */
  function onTouchMove(ev: TouchEvent) {
    if (!gestureState.dragging || gestureState.startX == null || gestureState.startY == null) return;

    const t = ev.touches[0];
    const dx = t.clientX - gestureState.startX;
    const dy = t.clientY - gestureState.startY;

    // 判断方向
    if (gestureState.direction === 'none') {
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        gestureState.direction = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
      }
    }

    if (gestureState.direction === 'h') {
      ev.preventDefault(); // 锁定为水平
      const translate = Math.min(0, dx); // 仅允许向左(负)拖动
      const el = panelRef.value;
      if (el) {
        el.style.transform = `translateX(${translate}px)`;
      }

      // 速度计算
      const now = performance.now();
      const dt = now - gestureState.lastMoveTime;
      if (dt > 0) {
        gestureState.velocityX = (t.clientX - gestureState.lastMoveX) / dt;
      }
      gestureState.lastMoveX = t.clientX;
      gestureState.lastMoveTime = now;

      // 遮罩透明度联动
      try {
        const width = panelRef.value ? panelRef.value.getBoundingClientRect().width : window.innerWidth;
        const progress = Math.min(1, Math.abs(translate) / width);
        overlayAlpha.value = 1 - progress * 0.9;
      } catch {
        /* ignore */
      }
    }
  }

  /**
   * 触摸结束
   */
  function onTouchEnd() {
    if (!gestureState.dragging) return;

    gestureState.dragging = false;
    const el = panelRef.value;
    let current = 0;

    if (el) {
      const m = /translateX\((-?\d+(?:\.\d+)?)px\)/.exec(el.style.transform || '');
      if (m) current = parseFloat(m[1]);
    }

    const width = panelRef.value ? panelRef.value.getBoundingClientRect().width : window.innerWidth;
    const progress = Math.abs(current) / width;
    const shouldClose = progress > 0.30 || gestureState.velocityX < -0.55;

    if (shouldClose) {
      // 从当前进度继续滑出
      const el2 = panelRef.value;
      if (el2) {
        const remain = 1 - progress;
        const totalMs = 260;
        const ms = Math.max(120, totalMs * remain);
        el2.style.transition = `transform ${ms}ms cubic-bezier(0.36,0.66,0.04,1)`;
        el2.style.transform = 'translateX(-100%)';
        overlayAlpha.value = 0;
        setTimeout(() => onFinishClose(), ms + 20);
      } else {
        onFinishClose();
      }
    } else {
      // 回弹
      const el3 = panelRef.value;
      if (el3) {
        el3.style.transition = 'transform 220ms ease';
        el3.style.transform = 'translateX(0)';
        setTimeout(() => {
          if (el3) {
            el3.style.transition = '';
          }
        }, 240);
      }
      overlayAlpha.value = 1;
    }

    gestureState.startX = gestureState.startY = null;
    gestureState.direction = 'none';
    gestureState.velocityX = 0;
  }

  /**
   * 绑定手势事件
   */
  function attachGesture() {
    const el = panelRef.value;
    if (!el || (el as any)._gestureBound) return;

    (el as any)._gestureBound = true;
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });
  }

  /**
   * 解绑手势事件
   */
  function detachGesture() {
    const el = panelRef.value;
    if (!el) return;

    (el as any)._gestureBound = false;
    el.removeEventListener('touchstart', onTouchStart as any);
    el.removeEventListener('touchmove', onTouchMove as any);
    el.removeEventListener('touchend', onTouchEnd as any);
    el.removeEventListener('touchcancel', onTouchEnd as any);
  }

  return {
    attachGesture,
    detachGesture
  };
}
