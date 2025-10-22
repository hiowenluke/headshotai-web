import { ref, computed } from 'vue';
import { getMenuConfig, type AppPage } from '../data/menuData';

/**
 * 菜单数据管理组合式函数
 * 处理菜单项配置、选中状态等
 */
export function useMenuDataManagement() {
    // 菜单项配置
    const appPages = getMenuConfig();
    
    // 选中的菜单项索引
    const selectedIndex = ref(-1);
    
    // 演示页面显示状态
    const showDemo = ref(false);
    
    // 分离出除了用户信息之外的其他菜单项
    const otherPages = computed(() => {
        return appPages.filter(p => p.url !== '/auth');
    });
    
    // 刷新选中状态
    const refreshSelected = () => {
        try { 
            const current = window.location.pathname; 
            selectedIndex.value = appPages.findIndex(p => p.url === current); 
        } catch { 
            /* ignore */ 
        }
    };
    
    // 获取图标名称的辅助函数
    const getIconName = (menuItem: AppPage) => {
        const iconComponent = menuItem.iosIcon || menuItem.mdIcon;
        if (!iconComponent) {
            return null;
        }

        // 组件由 createIconComponent 创建，并带有 iconName 元数据
        const iconName = (iconComponent as { iconName?: string }).iconName;
        if (typeof iconName === 'string' && iconName.length > 0) {
            return iconName;
        }

        // 兜底：尝试从组件名称推断
        const componentName = iconComponent?.name || (iconComponent as any)?.__name;
        if (componentName) {
            // 将如 mailOutlineIcon 转换为 mail-outline
            const normalized = componentName
                .replace(/Icon$/i, '')
                // 替换驼峰为连字符
                .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
                .replace(/_/g, '-')
                .toLowerCase();
            if (normalized) {
                return normalized;
            }
        }

        return null;
    };
    
    return {
        // 数据
        appPages,
        otherPages,
        
        // 状态
        selectedIndex,
        showDemo,
        
        // 方法
        refreshSelected,
        getIconName
    };
}