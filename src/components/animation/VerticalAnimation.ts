import { createBaseAnimation } from './BaseAnimation';

// 垂直动画函数
export function createVerticalEnterAnimation(baseEl: any) {
  return createBaseAnimation(baseEl, 'enter', 'vertical');
}

export function createVerticalLeaveAnimation(baseEl: any) {
  return createBaseAnimation(baseEl, 'leave', 'vertical');
}
