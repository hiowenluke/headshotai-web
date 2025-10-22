import { type Ref } from 'vue';

/**
 * 事件处理器包装
 * 负责包装各种事件处理函数，添加必要的逻辑
 */
export function useEventHandlers(
  currentCategory: Ref<string>,
  currentPrefs: any,
  loadCategory: (category: string, prefs: any, isFirstMenu?: boolean) => Promise<any>,
  loadMore: (ev: any, category: string, currentCat: string, prefs: any) => Promise<any>,
  selectMainMenu: (index: number, onSelect: (category: string) => Promise<void>) => Promise<void>,
  selectSubMenu: (subIndex: number, onSelect: (category: string) => Promise<void>) => Promise<void>,
  handleFlatMenuSelect: (flatIndex: number, loadCategoryFn?: (category: string) => Promise<void>) => void
) {
  /**
   * 触发菜单切换事件
   */
  function emitMenuSwitched(category: string, isFirst: boolean) {
    window.dispatchEvent(new CustomEvent('menu-switched', {
      detail: { category, isFirst }
    }));
  }

  /**
   * 包装的加载更多处理器
   */
  function handleLoadMore(ev: any, catFromEvent: string) {
    const category = catFromEvent || currentCategory.value;
    return loadMore(ev, category, currentCategory.value, currentPrefs);
  }

  /**
   * 包装的主菜单选择处理器
   */
  function handleMainMenuSelect(index: number) {
    return selectMainMenu(index, async (category) => {
      emitMenuSwitched(category, index === 0);
      await loadCategory(category, currentPrefs, index === 0);
    });
  }

  /**
   * 包装的子菜单选择处理器
   */
  function handleSubMenuSelect(subIndex: number) {
    return selectSubMenu(subIndex, async (category) => {
      emitMenuSwitched(category, false);
      await loadCategory(category, currentPrefs, false);
    });
  }

  /**
   * 包装的扁平菜单选择处理器
   */
  function wrappedHandleFlatMenuSelect(flatIndex: number) {
    handleFlatMenuSelect(flatIndex, async (category) => {
      emitMenuSwitched(category, flatIndex === 0);
      await loadCategory(category, currentPrefs, flatIndex === 0);
    });
  }

  return {
    handleLoadMore,
    handleMainMenuSelect,
    handleSubMenuSelect,
    wrappedHandleFlatMenuSelect
  };
}
