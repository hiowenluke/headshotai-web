// 卡片布局计算组合式函数
import { computed } from 'vue';

export function useCardLayout(containerWidth: any, containerHeight: any) {
  // 计算卡片尺寸和间距
  const cardSize = computed(() => {
    // 判断是否有足够的高度空间（高度 >= 宽度 * 1.25）
    const hasEnoughHeight = containerHeight.value >= containerWidth.value * 1.25;
    
    // 根据空间情况计算响应式间距
    const gapRatio = hasEnoughHeight ? 0.04 : 0.03; // 空间足够时增加间距
    const gap = Math.floor(containerWidth.value * gapRatio);
    
    // 可用空间（减去间距）
    const availableWidth = containerWidth.value - gap * 3; // 左右边距 + 中间间距
    const availableHeight = containerHeight.value - gap * 3; // 上下边距 + 中间间距
    
    // 每个卡片可用的最大空间（2x2 网格）
    const maxCardWidth = Math.floor(availableWidth / 2);
    const maxCardHeight = Math.floor(availableHeight / 2);
    
    // 计算容器的宽高比
    const containerRatio = containerWidth.value / containerHeight.value;
    const targetRatio = 4 / 5; // 4:5 的临界比例
    
    let cardWidth, cardHeight;
    
    if (containerRatio < targetRatio) {
      // 容器比较"瘦高"或接近正方形，优先基于高度计算
      // 先确保卡片高度能完全显示，再计算对应的宽度
      cardHeight = maxCardHeight;
      cardWidth = Math.floor(cardHeight / 1.25); // 保持1.25高宽比
      
      // 检查宽度是否超出限制
      if (cardWidth > maxCardWidth) {
        cardWidth = maxCardWidth;
        cardHeight = Math.floor(cardWidth * 1.25);
      }
    } else {
      // 容器比较"宽扁"，优先基于宽度计算
      // 先确保卡片宽度能完全显示，再计算对应的高度
      cardWidth = maxCardWidth;
      cardHeight = Math.floor(cardWidth * 1.25); // 保持1.25高宽比
      
      // 检查高度是否超出限制
      if (cardHeight > maxCardHeight) {
        cardHeight = maxCardHeight;
        cardWidth = Math.floor(cardHeight / 1.25);
      }
    }
    
    return {
      cardWidth: Math.max(cardWidth, 100), // 最小宽度100px
      cardHeight: Math.max(cardHeight, 125), // 最小高度125px
      gap,
      hasEnoughHeight // 传递给子组件使用
    };
  });

  return {
    cardSize
  };
}