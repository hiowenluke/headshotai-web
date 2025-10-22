// 主页菜单管理组合式函数
// 处理主菜单、二级菜单和扁平菜单的状态管理和切换逻辑

import { ref, computed } from 'vue';
import { HOME_MENU_CONFIG, type SubMenuItem } from '../menuData';
import { generateFlatMenus, getMainMenuIndex, getFirstFlatMenuIndex } from '@/components/navBar/menuController';

export function useMenuManagement() {
  // 菜单配置和状态
  const menus = HOME_MENU_CONFIG.map(menu => menu.displayName);
  const flatMenus = generateFlatMenus(HOME_MENU_CONFIG);
  const activeIndex = ref(0); // 当前主菜单索引
  const currentFlatIndex = ref(0); // 当前扁平菜单索引
  const activeSubIndex = ref(0); // 当前二级菜单索引

  // 计算属性：哪些主菜单有子菜单
  const hasSubMenus = computed((): boolean[] => {
    return HOME_MENU_CONFIG.map(menu => !!(menu.subMenus && menu.subMenus.length > 0));
  });

  // 计算属性：是否显示二级菜单
  const showSubMenu = computed((): boolean => {
    const mainMenu = HOME_MENU_CONFIG[activeIndex.value];
    return !!(mainMenu && mainMenu.subMenus && mainMenu.subMenus.length > 0);
  });

  // 计算属性：当前二级菜单列表
  const currentSubMenus = computed((): SubMenuItem[] => {
    const mainMenu = HOME_MENU_CONFIG[activeIndex.value];
    return mainMenu?.subMenus || [];
  });

  // 计算属性：当前分类
  const currentCategory = computed(() => {
    const flatItem = flatMenus[currentFlatIndex.value];
    if (!flatItem) return '';
    return flatItem.category;
  });

  // 主菜单选择处理
  const selectMainMenu = async (index: number, loadCategoryFn?: (category: string) => Promise<void>) => {
    activeIndex.value = index;
    
    // 更新扁平菜单索引到该主菜单的第一个项目
    currentFlatIndex.value = getFirstFlatMenuIndex(index, HOME_MENU_CONFIG);
    activeSubIndex.value = 0;
    
    // 加载对应的分类
    if (loadCategoryFn) {
      const flatItem = flatMenus[currentFlatIndex.value];
      if (flatItem) {
        await loadCategoryFn(flatItem.category);
      }
    }
  };

  // 二级菜单选择处理
  const selectSubMenu = async (subIndex: number, loadCategoryFn?: (category: string) => Promise<void>) => {
    activeSubIndex.value = subIndex;
    
    // 更新扁平菜单索引
    const mainMenu = HOME_MENU_CONFIG[activeIndex.value];
    if (mainMenu && mainMenu.subMenus) {
      const subMenuId = mainMenu.subMenus[subIndex].id;
      const flatIndex = flatMenus.findIndex(item => item.id === subMenuId);
      if (flatIndex !== -1) {
        currentFlatIndex.value = flatIndex;
        if (loadCategoryFn) {
          const flatItem = flatMenus[flatIndex];
          await loadCategoryFn(flatItem.category);
        }
      }
    }
  };

  // 处理扁平菜单选择（来自 CategoryPanels 的滑动事件）
  const handleFlatMenuSelect = (flatIndex: number, loadCategoryFn?: (category: string) => Promise<void>) => {
    if (flatIndex !== currentFlatIndex.value) {
      currentFlatIndex.value = flatIndex;
      
      // 更新主菜单索引
      const newMainIndex = getMainMenuIndex(flatIndex, HOME_MENU_CONFIG);
      activeIndex.value = newMainIndex;
      
      // 更新二级菜单索引
      const flatItem = flatMenus[flatIndex];
      if (flatItem.isSubMenu && flatItem.parentId) {
        const mainMenu = HOME_MENU_CONFIG[newMainIndex];
        if (mainMenu && mainMenu.subMenus) {
          const subIndex = mainMenu.subMenus.findIndex(sub => sub.id === flatItem.id);
          activeSubIndex.value = Math.max(0, subIndex);
        }
      } else {
        activeSubIndex.value = 0;
      }
      
      // 加载新的分类
      if (loadCategoryFn) {
        loadCategoryFn(flatItem.category);
      }
    }
  };

  // 处理手势导航
  const handleNavigation = (direction: 'left' | 'right', loadCategoryFn?: (category: string) => Promise<void>) => {
    const currentIndex = currentFlatIndex.value;
    let nextIndex: number;
    
    if (direction === 'left') {
      // 向左滑动：前进到下一个菜单项
      nextIndex = Math.min(currentIndex + 1, flatMenus.length - 1);
    } else {
      // 向右滑动：后退到上一个菜单项
      nextIndex = Math.max(currentIndex - 1, 0);
    }
    
    if (nextIndex !== currentIndex) {
      currentFlatIndex.value = nextIndex;
      
      // 更新主菜单索引
      const newMainIndex = getMainMenuIndex(nextIndex, HOME_MENU_CONFIG);
      activeIndex.value = newMainIndex;
      
      // 更新二级菜单索引
      const flatItem = flatMenus[nextIndex];
      if (flatItem.isSubMenu && flatItem.parentId) {
        const mainMenu = HOME_MENU_CONFIG[newMainIndex];
        if (mainMenu && mainMenu.subMenus) {
          const subIndex = mainMenu.subMenus.findIndex(sub => sub.id === flatItem.id);
          activeSubIndex.value = Math.max(0, subIndex);
        }
      } else {
        activeSubIndex.value = 0;
      }
      
      // 加载新的分类
      if (loadCategoryFn) {
        loadCategoryFn(flatItem.category);
      }
    }
  };

  // 同步扁平菜单索引变化到主菜单和二级菜单状态
  const syncMenuStates = (newFlatIndex: number) => {
    const newMainIndex = getMainMenuIndex(newFlatIndex, HOME_MENU_CONFIG);
    if (newMainIndex !== activeIndex.value) {
      activeIndex.value = newMainIndex;
    }
    
    const flatItem = flatMenus[newFlatIndex];
    if (flatItem.isSubMenu && flatItem.parentId) {
      const mainMenu = HOME_MENU_CONFIG[newMainIndex];
      if (mainMenu && mainMenu.subMenus) {
        const subIndex = mainMenu.subMenus.findIndex(sub => sub.id === flatItem.id);
        if (subIndex !== -1 && subIndex !== activeSubIndex.value) {
          activeSubIndex.value = subIndex;
        }
      }
    } else {
      activeSubIndex.value = 0;
    }
  };

  return {
    // 状态
    menus,
    flatMenus,
    activeIndex,
    currentFlatIndex,
    activeSubIndex,
    
    // 计算属性
    hasSubMenus,
    showSubMenu,
    currentSubMenus,
    currentCategory,
    
    // 方法
    selectMainMenu,
    selectSubMenu,
    handleFlatMenuSelect,
    handleNavigation,
    syncMenuStates
  };
}