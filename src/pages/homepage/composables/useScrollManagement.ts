import { type Ref } from 'vue';

/**
 * 滚动管理
 * 处理页面滚动相关逻辑
 */
export function useScrollManagement(
  categoryPanelsRef: Ref<any>,
  baseScrollToTop: () => void
) {
  /**
   * 增强的滚动到顶部函数
   * 优先使用 CategoryPanels 组件的方法，失败时回退到基础方法
   */
  function scrollToTop() {
    try {
      // 优先使用 CategoryPanels 组件的 scrollToTop 方法
      if (categoryPanelsRef.value && categoryPanelsRef.value.scrollToTop) {
        categoryPanelsRef.value.scrollToTop();
      } else {
        // 回退到基础的滚动方法
        baseScrollToTop();
      }
    } catch (error) {
      console.warn('Enhanced scrollToTop failed, using fallback:', error);
      baseScrollToTop();
    }
  }

  return {
    scrollToTop
  };
}
