import { onMounted, onBeforeUnmount, type Ref } from 'vue';

/**
 * 生命周期设置
 * 管理组件的初始化和清理逻辑
 */
export function useLifecycleSetup(
  devMode: boolean,
  flatMenus: any[],
  currentFlatIndex: Ref<number>,
  currentPrefs: any,
  showGenerator: Ref<boolean>,
  loadCategory: (category: string, prefs: any, isFirstMenu?: boolean) => Promise<any>,
  loadSavedPreferences: () => void,
  initializePreviewImage: () => void,
  ensureDemoFacesLoaded: () => Promise<void>,
  setupPreferencesListener: (resetAllForPrefs: () => Promise<void>, updateDemoFaces?: () => Promise<void>) => () => void,
  resetAllForPrefs: (menus: any[], index: number, prefs: any) => Promise<void>,
  updateSkippedDisplay: (menus: any[]) => void
) {
  let prefsCleanup: (() => void) | null = null;

  /**
   * 设置自动加载其他菜单的事件监听
   */
  function setupAutoLoadListener(
    loadCategory: (category: string, prefs: any, isFirstMenu?: boolean) => Promise<any>
  ) {
    const handleAutoLoadOtherMenus = async (event: any) => {
      const { excludeCategory } = event.detail || {};
      console.log('[HomePage] Auto-loading other menus, excluding:', excludeCategory);

      const loadPromises = [];
      for (let i = 0; i < flatMenus.length; i++) {
        const item = flatMenus[i];
        if (item.category !== excludeCategory) {
          loadPromises.push(loadCategory(item.category, currentPrefs, false));
        }
      }
      await Promise.all(loadPromises);
    };

    window.addEventListener('auto-load-other-menus', handleAutoLoadOtherMenus);

    return () => {
      window.removeEventListener('auto-load-other-menus', handleAutoLoadOtherMenus);
    };
  }

  /**
   * 设置开发模式的调试快捷键
   */
  function setupDebugKeyHandler() {
    if (!devMode) return null;

    const debugKeyHandler = (event: KeyboardEvent) => {
      // Ctrl+Shift+D 打开智能加载调试面板
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('smart-loading-debug-toggle'));
      }
    };

    window.addEventListener('keydown', debugKeyHandler);

    return () => {
      window.removeEventListener('keydown', debugKeyHandler);
    };
  }

  /**
   * 初始化数据加载
   */
  async function initializeDataLoading() {
    const currentFlatItem = flatMenus[currentFlatIndex.value];
    if (currentFlatItem) {
      // 触发菜单切换事件（标记为第一个菜单）
      window.dispatchEvent(new CustomEvent('menu-switched', {
        detail: {
          category: currentFlatItem.category,
          isFirst: true
        }
      }));

      await loadCategory(currentFlatItem.category, currentPrefs, true);
    }

    // 更新跳过分类显示
    updateSkippedDisplay(flatMenus);
  }

  /**
   * 组件挂载时的初始化
   */
  function setupOnMounted() {
    onMounted(async () => {
      // 初始化各个模块
      loadSavedPreferences();
      initializePreviewImage();
      
      if (showGenerator.value) {
        await ensureDemoFacesLoaded();
      }

      // 设置偏好设置监听器
      const prefsUnsubscribe = setupPreferencesListener(
        async () => { await resetAllForPrefs(flatMenus, currentFlatIndex.value, currentPrefs); }
      );

      // 设置事件监听器
      const autoLoadCleanup = setupAutoLoadListener(loadCategory);
      const debugCleanup = setupDebugKeyHandler();

      // 初始化数据加载
      await initializeDataLoading();

      // 合并清理函数
      prefsCleanup = () => {
        prefsUnsubscribe();
        autoLoadCleanup();
        if (debugCleanup) debugCleanup();
      };
    });
  }

  /**
   * 组件卸载时的清理
   */
  function setupOnBeforeUnmount() {
    onBeforeUnmount(() => {
      if (prefsCleanup) {
        prefsCleanup();
      }
    });
  }

  return {
    setupOnMounted,
    setupOnBeforeUnmount
  };
}
