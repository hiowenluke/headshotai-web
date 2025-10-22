// 主页菜单数据定义
// 这个文件包含了主页面使用的所有菜单配置数据

export interface SubMenuItem {
  id: string;
  name: string;
  displayName: string;
}

export interface MenuItem {
  id: string;
  name: string;
  displayName: string;
  subMenus?: SubMenuItem[];
}

// 扁平化的菜单项，用于导航和数据加载
export interface FlatMenuItem {
  id: string;
  name: string;
  displayName: string;
  parentId?: string;
  isSubMenu: boolean;
  category: string; // 用于API调用的分类名
}

// 主页菜单配置数据
export const HOME_MENU_CONFIG: MenuItem[] = [
  {
    id: 'hot',
    name: 'HOT',
    displayName: 'HOT'
  },
  {
    id: 'studio',
    name: 'Studio',
    displayName: 'Studio',
    subMenus: [
      { id: 'studio-dark', name: 'Dark', displayName: 'Dark' },
      { id: 'studio-light', name: 'Light', displayName: 'Light' }
    ]
  },
  {
    id: 'office',
    name: 'Office',
    displayName: 'Office',
    subMenus: [
      { id: 'office-luxury', name: 'Luxury', displayName: 'Luxury' },
      { id: 'office-small', name: 'Small', displayName: 'Small' }
    ]
  },
  {
    id: 'workplace',
    name: 'Workplace',
    displayName: 'Workplace',
    subMenus: [
      { id: 'workplace-open-space', name: 'Open Space', displayName: 'Open Space' },
      { id: 'workplace-person-desk', name: 'Person Desk', displayName: 'Person Desk' }
    ]
  },
  {
    id: 'city',
    name: 'City',
    displayName: 'City'
  },
  {
    id: 'nature',
    name: 'Nature',
    displayName: 'Nature'
  }
];