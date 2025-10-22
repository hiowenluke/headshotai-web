import { type Ref } from 'vue';
import type { BounceState } from './types';

/**
 * 弹性滚动处理
 * 负责处理顶部/底部的弹性效果
 */
export function createBounceScroll(
  scrollOuterRef: Ref<HTMLElement | null>,
  scrollInnerRef: Ref<HTMLElement | null>,
  bounceState: BounceState
) {
  /**
   * 获取滚动元素
   */
  function getScrollEl(): HTMLElement | null {
    return scrollOuterRef.value;
  }

  /**
   * 触摸开始
   */
  function bounceTouchStart(e: TouchEvent) {
    const outer = getScrollEl();
    if (!outer) return;

    bounceState.dragging = true;
    bounceState.startY = e.touches[0].clientY;
    bounceState.startX = e.touches[0].clientX;
    bounceState.lastY = bounceState.startY;
    bounceState.lastX = bounceState.startX;
    bounceState.pulling = false;
    bounceState.direction = 0;
    bounceState.lockedDirection = '';
  }

  /**
   * 触摸移动
   */
  function bounceTouchMove(e: TouchEvent) {
    if (!bounceState.dragging) return;

    const outer = getScrollEl();
    const inner = scrollInnerRef.value;
    if (!outer || !inner) return;

    const y = e.touches[0].clientY;
    const x = e.touches[0].clientX;
    const dy = y - bounceState.lastY;
    const dx = x - bounceState.lastX;
    bounceState.lastY = y;
    bounceState.lastX = x;

    // 首次移动时锁定方向
    if (!bounceState.lockedDirection) {
      if (Math.abs(dy) > Math.abs(dx)) {
        bounceState.lockedDirection = 'v';
      } else if (Math.abs(dx) > Math.abs(dy)) {
        bounceState.lockedDirection = 'h';
      }
    }

    // 如果是横向滑动，直接阻止
    if (bounceState.lockedDirection === 'h') {
      if (e.cancelable) {
        e.preventDefault();
      }
      return;
    }

    const atTop = outer.scrollTop <= 0;
    const atBottom = outer.scrollTop + outer.clientHeight >= outer.scrollHeight - 1;

    // 只在即将超出边界方向上触发弹性
    if ((atTop && dy > 0) || (atBottom && dy < 0) || bounceState.pulling) {
      // 标记进入弹性模式
      if (!bounceState.pulling) {
        bounceState.pulling = true;
        bounceState.direction = dy > 0 ? 1 : -1;
      }

      // 累计总体位移
      const totalDelta = y - bounceState.startY;
      const signed = totalDelta * bounceState.direction;

      if (signed <= 0) {
        // 方向反转，结束弹性
        bounceState.pulling = false;
        bounceState.direction = 0;
        inner.style.transition = 'transform 180ms ease';
        inner.style.transform = 'translateY(0)';
        setTimeout(() => {
          if (inner) inner.style.transition = '';
        }, 190);
        return;
      }

      // 阻尼效果
      const k = 0.035;
      const raw = bounceState.maxOffset * (1 - 1 / (1 + k * signed));
      const clamped = Math.min(bounceState.maxOffset, raw);
      inner.style.transform = `translateY(${clamped * bounceState.direction}px)`;

      if (e.cancelable) {
        e.preventDefault();
      }
    }
  }

  /**
   * 触摸结束
   */
  function bounceTouchEnd() {
    if (!bounceState.dragging) return;

    bounceState.dragging = false;
    const inner = scrollInnerRef.value;

    if (inner && bounceState.pulling) {
      inner.style.transition = 'transform 220ms cubic-bezier(0.36,0.66,0.04,1)';
      inner.style.transform = 'translateY(0)';
      setTimeout(() => {
        if (inner) inner.style.transition = '';
      }, 240);
    }

    bounceState.pulling = false;
    bounceState.direction = 0;
    bounceState.lockedDirection = '';
  }

  /**
   * 绑定弹性滚动事件
   */
  function attachBounce() {
    const outer = getScrollEl();
    if (!outer || (outer as any)._bounceBound) return;

    (outer as any)._bounceBound = true;
    outer.addEventListener('touchstart', bounceTouchStart, { passive: true });
    outer.addEventListener('touchmove', bounceTouchMove, { passive: false });
    outer.addEventListener('touchend', bounceTouchEnd, { passive: true });
    outer.addEventListener('touchcancel', bounceTouchEnd, { passive: true });
  }

  /**
   * 解绑弹性滚动事件
   */
  function detachBounce() {
    const outer = getScrollEl();
    if (!outer || !(outer as any)._bounceBound) return;

    (outer as any)._bounceBound = false;
    outer.removeEventListener('touchstart', bounceTouchStart as any);
    outer.removeEventListener('touchmove', bounceTouchMove as any);
    outer.removeEventListener('touchend', bounceTouchEnd as any);
    outer.removeEventListener('touchcancel', bounceTouchEnd as any);

    const inner = scrollInnerRef.value;
    if (inner) {
      inner.style.transition = '';
      inner.style.transform = '';
    }
  }

  return {
    getScrollEl,
    attachBounce,
    detachBounce
  };
}
