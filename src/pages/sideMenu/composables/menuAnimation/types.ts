/**
 * 菜单动画相关类型定义
 */

export interface MenuAnimationState {
  showing: boolean;
  overlayAlpha: number;
  lastFocus: Element | null;
}

export interface GestureState {
  startX: number | null;
  startY: number | null;
  dragging: boolean;
  direction: 'none' | 'h' | 'v';
  lastMoveX: number;
  lastMoveTime: number;
  velocityX: number;
}

export interface BounceState {
  dragging: boolean;
  startY: number;
  lastY: number;
  startX: number;
  lastX: number;
  lockedDirection: '' | 'v' | 'h';
  pulling: boolean;
  direction: number; // 1=向下拉顶部，-1=向上推底部
  maxOffset: number; // 视觉最大位移（px）
}
