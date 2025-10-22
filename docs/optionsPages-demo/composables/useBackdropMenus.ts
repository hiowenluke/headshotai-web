import { ref, computed } from 'vue';
import { HOME_MENU_CONFIG, type FlatMenuItem } from '@/pages/homepage/menuData';

/**
 * 菜单项配置接口
 */
export interface MenuItemConfig {
  id: string;
  name: string;
  displayName: string;
  subMenus?: SubMenuConfig[];
}

/**
 * 子菜单配置接口
 */
export interface SubMenuConfig {
  id: string;
  name: string;
  displayName: string;
}

/**
 * 选项页面菜单管理
 * 处理主菜单、子菜单和扁平菜单的状态同步
 * @param menuConfig - 自定义菜单配置，如果不提供则使用 HOME_MENU_CONFIG
 */
export function useBackdropMenus(menuConfig?: MenuItemConfig[]) {
  // 使用传入的菜单配置或默认配置
  const MENU_CONFIG = menuConfig || HOME_MENU_CONFIG;
  // 扁平化菜单
  function flattenMenus(): FlatMenuItem[] {
    const result: FlatMenuItem[] = [];
    MENU_CONFIG.forEach(menu => {
      if (menu.subMenus && menu.subMenus.length > 0) {
        menu.subMenus.forEach(sub => {
          result.push({
            id: sub.id,
            name: sub.name,
            displayName: sub.displayName,
            parentId: menu.id,
            isSubMenu: true,
            category: `${menu.name}/${sub.name}`
          });
        });
      } else {
        result.push({
          id: menu.id,
          name: menu.name,
          displayName: menu.displayName,
          isSubMenu: false,
          category: menu.name
        });
      }
    });
    return result;
  }

  const flatMenus = flattenMenus();
  const currentFlatIndex = ref(0);
  const activeIndex = ref(0);
  const activeSubIndex = ref(0);

  // 计算属性
  const showSubMenu = computed(() => {
    const menu = MENU_CONFIG[activeIndex.value];
    return menu && menu.subMenus && menu.subMenus.length > 0;
  });

  const menuNames = computed(() => MENU_CONFIG.map(m => m.displayName));
  
  const hasSubMenus = computed(() => 
    MENU_CONFIG.map(m => !!(m.subMenus && m.subMenus.length > 0))
  );
  
  const currentSubMenus = computed(() => {
    const menu = MENU_CONFIG[activeIndex.value];
    return menu?.subMenus || [];
  });

  /**
   * 处理主菜单选择
   */
  function handleMainMenuSelect(index: number) {
    activeIndex.value = index;
    activeSubIndex.value = 0;

    const menu = MENU_CONFIG[index];
    if (menu.subMenus && menu.subMenus.length > 0) {
      // 有子菜单，选择第一个子菜单
      const flatIndex = flatMenus.findIndex(f => f.parentId === menu.id);
      if (flatIndex !== -1) {
        currentFlatIndex.value = flatIndex;
      }
    } else {
      // 没有子菜单，直接选择主菜单
      const flatIndex = flatMenus.findIndex(f => f.id === menu.id);
      if (flatIndex !== -1) {
        currentFlatIndex.value = flatIndex;
      }
    }
  }

  /**
   * 处理子菜单选择
   */
  function handleSubMenuSelect(index: number) {
    activeSubIndex.value = index;

    const menu = MENU_CONFIG[activeIndex.value];
    if (menu.subMenus && menu.subMenus[index]) {
      const subMenu = menu.subMenus[index];
      const flatIndex = flatMenus.findIndex(f => f.id === subMenu.id);
      if (flatIndex !== -1) {
        currentFlatIndex.value = flatIndex;
      }
    }
  }

  /**
   * 处理扁平菜单选择（来自滑动）
   */
  function handleFlatMenuSelect(index: number) {
    currentFlatIndex.value = index;

    // 同步主菜单和子菜单状态
    const flatItem = flatMenus[index];
    if (flatItem.isSubMenu && flatItem.parentId) {
      const mainIndex = MENU_CONFIG.findIndex(m => m.id === flatItem.parentId);
      if (mainIndex !== -1) {
        activeIndex.value = mainIndex;
        const menu = MENU_CONFIG[mainIndex];
        if (menu.subMenus) {
          const subIndex = menu.subMenus.findIndex(s => s.id === flatItem.id);
          if (subIndex !== -1) {
            activeSubIndex.value = subIndex;
          }
        }
      }
    } else {
      const mainIndex = MENU_CONFIG.findIndex(m => m.id === flatItem.id);
      if (mainIndex !== -1) {
        activeIndex.value = mainIndex;
        activeSubIndex.value = 0;
      }
    }
  }

  return {
    flatMenus,
    currentFlatIndex,
    activeIndex,
    activeSubIndex,
    showSubMenu,
    menuNames,
    hasSubMenus,
    currentSubMenus,
    handleMainMenuSelect,
    handleSubMenuSelect,
    handleFlatMenuSelect
  };
}
