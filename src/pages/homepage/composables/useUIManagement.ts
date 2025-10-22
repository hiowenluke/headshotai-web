// 主页 UI 状态管理组合式函数
// 处理滚动控制、DOM 引用和其他 UI 相关的状态管理

import { ref } from 'vue';
import { usePersistentModal } from '@/composables/usePersistentModal';

export function useUIManagement() {
  // DOM 引用
  const menuScroll = ref<HTMLElement | null>(null);
  const contentWrapper = ref<HTMLElement | null>(null);

  // 偏好设置弹窗状态
  const showPreferences = usePersistentModal('preferences');

  // 滚动当前列表到顶部
  const scrollToTop = () => {
    try {
      // 1. 尝试通过 ion-content 滚动到顶部
      const ionContent = document.querySelector('ion-content');
      if (ionContent) {
        const scrollElement = ionContent.querySelector('.inner-scroll') || ionContent;
        if (scrollElement && 'scrollTop' in scrollElement) {
          scrollElement.scrollTop = 0;
        }
        if ('scrollToTop' in ionContent) {
          (ionContent as any).scrollToTop(0);
        }
      }

      // 2. 尝试滚动当前面板内容
      const panelContents = document.querySelectorAll('.panel-content');
      const currentPanel = panelContents[0] as HTMLElement; // 使用当前激活的面板
      if (currentPanel) {
        currentPanel.scrollTop = 0;
      }

      // 3. 备用：重置document滚动
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch (error) {
      console.warn('Failed to scroll to top:', error);
    }
  };

  // 初始化 DOM 引用
  function initializeDOMReferences() {
    menuScroll.value = document.querySelector('.menu-scroll') as HTMLElement | null;
    contentWrapper.value = document.querySelector('.lists-viewport') as HTMLElement | null;
  }

  return {
    // DOM 引用
    menuScroll,
    contentWrapper,

    // 状态
    showPreferences,

    // 方法
    scrollToTop,
    initializeDOMReferences
  };
}