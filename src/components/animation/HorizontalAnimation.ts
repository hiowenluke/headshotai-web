import { createBaseAnimation } from './BaseAnimation';

// 水平动画函数
export function createHorizontalEnterAnimation(baseEl: any) {
  return createBaseAnimation(baseEl, 'enter', 'horizontal');
}

export function createHorizontalLeaveAnimation(baseEl: any) {
  return createBaseAnimation(baseEl, 'leave', 'horizontal');
}
