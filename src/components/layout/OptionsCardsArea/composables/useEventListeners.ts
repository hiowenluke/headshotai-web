// 事件监听器管理组合式函数
import { onMounted, onUnmounted, type Ref } from 'vue';

type UpdateContainerSize = (adaptiveContentRef: Ref<any>) => void;
type UpdateContainerSizeDelayed = (adaptiveContentRef: Ref<any>, delay?: number) => void;

export function useEventListeners(
  updateContainerSize: UpdateContainerSize,
  updateContainerSizeDelayed: UpdateContainerSizeDelayed,
  adaptiveContentRef: Ref<any>
) {
  // 事件处理函数
  const handleResize = () => updateContainerSize(adaptiveContentRef);
  const handleLoad = () => updateContainerSizeDelayed(adaptiveContentRef, 100);
  const handleTabChanged = () => updateContainerSizeDelayed(adaptiveContentRef, 100);
  const handleOrientationChange = () => {
    updateContainerSizeDelayed(adaptiveContentRef, 300);
    updateContainerSizeDelayed(adaptiveContentRef, 600);
  };
  const handleVisualViewportResize = () => updateContainerSizeDelayed(adaptiveContentRef, 100);
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      updateContainerSizeDelayed(adaptiveContentRef, 200);
    }
  };

  // 初始化事件监听器
  const initializeEventListeners = () => {
    // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
    
    // 监听页面加载完成
    if (document.readyState !== 'complete') {
      window.addEventListener('load', handleLoad);
    }
    
    // 监听 tab 切换事件（如果存在的话）
  window.addEventListener('tab-changed' as any, handleTabChanged as EventListener);
    
    // 监听屏幕方向改变
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // 监听视窗大小变化（适用于移动端浏览器地址栏显示/隐藏）
    if ('visualViewport' in window) {
  window.visualViewport?.addEventListener('resize', handleVisualViewportResize);
    }
    
    // 页面可见性变化时重新计算（从后台切回前台时）
    document.addEventListener('visibilitychange', handleVisibilityChange);
  };

  // 清理事件监听器
  const cleanupEventListeners = () => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('load', handleLoad);
  window.removeEventListener('tab-changed' as any, handleTabChanged as EventListener);
  window.removeEventListener('orientationchange', handleOrientationChange);
    
    if ('visualViewport' in window) {
      window.visualViewport?.removeEventListener('resize', handleVisualViewportResize);
    }
    
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };

  // 自动管理生命周期
  onMounted(() => {
    initializeEventListeners();
  });

  onUnmounted(() => {
    cleanupEventListeners();
  });

  return {
    initializeEventListeners,
    cleanupEventListeners
  };
}