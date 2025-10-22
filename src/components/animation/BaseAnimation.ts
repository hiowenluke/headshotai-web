import { createAnimation } from '@ionic/vue';

// 基础动画创建函数
export function createBaseAnimation(
  baseEl: any, 
  direction: 'enter' | 'leave', 
  animationType: 'vertical' | 'horizontal'
) {
  const root = baseEl.shadowRoot || baseEl;
  const wrapper = root.querySelector('.modal-wrapper');
  const backdrop = root.querySelector('ion-backdrop');

  let wrapperAnimation;
  
  if (animationType === 'vertical') {
    if (direction === 'enter') {
      // 垂直进入：从下向上滑入
      wrapperAnimation = createAnimation()
        .addElement(wrapper)
        .beforeStyles({ 'transform-origin': 'bottom center' })
        .fromTo('transform', 'translateY(100%)', 'translateY(0)')
        .fromTo('opacity', '0.01', '1');
    } else {
      // 垂直退出：向下滑出
      wrapperAnimation = createAnimation()
        .addElement(wrapper)
        .beforeStyles({ 'transform-origin': 'bottom center' })
        .fromTo('transform', 'translateY(0)', 'translateY(100%)')
        .fromTo('opacity', '1', '0.01');
    }
  } else {
    if (direction === 'enter') {
      // 水平进入：从右向左滑入
      wrapperAnimation = createAnimation()
        .addElement(wrapper)
        .beforeStyles({ 'transform-origin': 'right center' })
        .fromTo('transform', 'translateX(100%)', 'translateX(0)')
        .fromTo('opacity', '0.01', '1');
    } else {
      // 水平退出：向右滑出
      wrapperAnimation = createAnimation()
        .addElement(wrapper)
        .beforeStyles({ 'transform-origin': 'right center' })
        .fromTo('transform', 'translateX(0)', 'translateX(100%)')
        .fromTo('opacity', '1', '0.01');
    }
  }

  // 创建backdrop动画，但进入时不改变透明度以避免闪烁
  const backdropAnimation = createAnimation()
    .addElement(backdrop);
    
  if (direction === 'enter') {
    // 进入时不动画遮罩，避免闪烁
    backdropAnimation.fromTo('opacity', '0', '0');
  } else {
    // 退出时正常淡出
    backdropAnimation.fromTo('opacity', '0.8', '0');
  }

  return createAnimation()
    .addAnimation([wrapperAnimation, backdropAnimation])
    .duration(direction === 'enter' ? 300 : 220)
    .easing('cubic-bezier(.36,.66,.04,1)');
}
