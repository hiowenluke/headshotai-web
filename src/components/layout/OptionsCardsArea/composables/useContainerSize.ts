// 容器尺寸管理组合式函数
import { ref, computed, nextTick } from 'vue';

export function useContainerSize(instanceKey: string) {
  const containerWidth = ref(300); // 默认宽度
  const containerHeight = ref(400); // 默认高度
  const visible = ref(false);

  // 本地缓存（容器可用尺寸）
  const cacheKey = computed(() => `OptionsCardsArea:${instanceKey}:containerSize`);
  
  const readCache = () => {
    try {
      const raw = localStorage.getItem(cacheKey.value);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (typeof data?.width === 'number' && typeof data?.height === 'number') return data;
    } catch { /* ignore */ }
    return null;
  };
  
  const writeCache = (size: { width: number; height: number }) => {
    try {
      localStorage.setItem(cacheKey.value, JSON.stringify(size));
    } catch { /* ignore */ }
  };

  // 更新容器宽度和高度
  const updateContainerSize = (adaptiveContentRef: any) => {
    if (adaptiveContentRef.value?.$el) {
      const rect = adaptiveContentRef.value.$el.getBoundingClientRect();
      const newWidth = rect.width || 300;
      const newHeight = rect.height || 400;
      
      // 只有当尺寸真正改变时才更新
      if (Math.abs(containerWidth.value - newWidth) > 1 || Math.abs(containerHeight.value - newHeight) > 1) {
        containerWidth.value = newWidth;
        containerHeight.value = newHeight;
        writeCache({ width: newWidth, height: newHeight });
      }
    }
  };

  // 延迟更新函数 - 用于确保 DOM 完全渲染后再计算
  const updateContainerSizeDelayed = (adaptiveContentRef: any, delay = 100) => {
    setTimeout(() => {
      updateContainerSize(adaptiveContentRef);
    }, delay);
  };

  // 初始化尺寸
  const initializeSize = async (adaptiveContentRef: any) => {
    await nextTick();
    
    // 预热尺寸，减少首次跳动
    const cached = readCache();
    if (cached) {
      containerWidth.value = cached.width;
      containerHeight.value = cached.height;
    }
    
    // 立即更新一次
    updateContainerSize(adaptiveContentRef);
    
    // 延迟再次更新，确保 AdaptiveContentArea 完成初始化
    updateContainerSizeDelayed(adaptiveContentRef, 50);
    updateContainerSizeDelayed(adaptiveContentRef, 200);
    updateContainerSizeDelayed(adaptiveContentRef, 500);
  };

  // 检查尺寸稳定性并显示
  const checkStabilityAndShow = (adaptiveContentRef: any) => {
    let last: { w: number; h: number } | null = null;
    let stableCount = 0;
    
    const checkStable = () => {
      if (!adaptiveContentRef.value?.$el) return;
      const r = adaptiveContentRef.value.$el.getBoundingClientRect();
      const cur = { w: Math.round(r.width), h: Math.round(r.height) };
      
      if (last && Math.abs(cur.w - last.w) <= 1 && Math.abs(cur.h - last.h) <= 1) {
        stableCount++;
      } else {
        stableCount = 0;
      }
      
      last = cur;
      
      if (stableCount >= 2) {
        visible.value = true;
      } else {
        setTimeout(checkStable, 60);
      }
    };
    
    setTimeout(checkStable, 60);
  };

  return {
    containerWidth,
    containerHeight,
    visible,
    updateContainerSize,
    updateContainerSizeDelayed,
    initializeSize,
    checkStabilityAndShow
  };
}