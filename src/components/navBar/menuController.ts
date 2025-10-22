// 菜单控制器相关的类型定义和工具函数
// 这个文件包含了 MenuController 组件需要导出的类型和函数

import type { MenuItem, FlatMenuItem } from '@/pages/homepage/menuData';

// ==================== 类型定义 ====================

// 菜单导航方向
export type NavigationDirection = 'left' | 'right';

// 菜单控制器事件类型
export interface MenuControllerEvents {
  'main-select': [index: number];
  'sub-select': [index: number];
  'scroll-to-top': [];
}

// ==================== 菜单工具函数 ====================

// 生成扁平化菜单列表
export function generateFlatMenus(menuConfig: MenuItem[]): FlatMenuItem[] {
  const flatMenus: FlatMenuItem[] = [];

  menuConfig.forEach(menu => {
    if (menu.subMenus && menu.subMenus.length > 0) {
      // 有二级菜单的项目，添加所有二级菜单项
      menu.subMenus.forEach(subMenu => {
        flatMenus.push({
          id: subMenu.id,
          name: subMenu.name,
          displayName: subMenu.displayName,
          parentId: menu.id,
          isSubMenu: true,
          category: `${menu.name}/${subMenu.name}`
        });
      });
    } else {
      // 没有二级菜单的项目，直接添加
      flatMenus.push({
        id: menu.id,
        name: menu.name,
        displayName: menu.displayName,
        isSubMenu: false,
        category: menu.name
      });
    }
  });

  return flatMenus;
}

// 根据扁平菜单索引获取对应的主菜单索引
export function getMainMenuIndex(flatIndex: number, menuConfig: MenuItem[]): number {
  const flatMenus = generateFlatMenus(menuConfig);
  const flatItem = flatMenus[flatIndex];

  if (!flatItem) return 0;

  if (flatItem.isSubMenu && flatItem.parentId) {
    return menuConfig.findIndex(menu => menu.id === flatItem.parentId);
  } else {
    return menuConfig.findIndex(menu => menu.id === flatItem.id);
  }
}

// 根据主菜单索引获取第一个扁平菜单索引
export function getFirstFlatMenuIndex(mainIndex: number, menuConfig: MenuItem[]): number {
  const mainMenu = menuConfig[mainIndex];
  if (!mainMenu) return 0;

  const flatMenus = generateFlatMenus(menuConfig);

  if (mainMenu.subMenus && mainMenu.subMenus.length > 0) {
    // 有二级菜单，返回第一个二级菜单的索引
    return flatMenus.findIndex(item => item.parentId === mainMenu.id);
  } else {
    // 没有二级菜单，返回自身的索引
    return flatMenus.findIndex(item => item.id === mainMenu.id);
  }
}