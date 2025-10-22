// 侧边菜单数据定义
// 这个文件包含了侧边菜单使用的所有菜单配置数据

import { mailOutline, shieldCheckmarkOutline, documentTextOutline, heartOutline, Heart, CircleDollarSign, RefundOutline, User, Cookie } from '@/components/icons/IconComponents';

// demo 不再作为正式页面的一部分
// import { Layers } from 'lucide-vue-next';

// 菜单项接口定义
export interface AppPage { 
    title: string; 
    url: string; 
    iosIcon: any; 
    mdIcon: any; 
    hero?: any;
}

// 侧边菜单配置数据
export const SIDE_MENU_CONFIG: AppPage[] = [
    { title: 'Sign In / Sign Up', url: '/auth', iosIcon: null, mdIcon: null, hero: User },
    { title: 'Preferences', url: '/preferences', iosIcon: heartOutline, mdIcon: heartOutline, hero: Heart },
    { title: 'Plans & Pricing', url: '/pricing', iosIcon: null, mdIcon: null, hero: CircleDollarSign },
    { title: 'Feedback', url: 'mailto:feedback@aip.so?subject=Feedback', iosIcon: mailOutline, mdIcon: mailOutline },
    { title: 'Refund Policy', url: '/policies/refund', iosIcon: null, mdIcon: null, hero: RefundOutline },
    { title: 'Privacy Policy', url: '/policies/privacy', iosIcon: shieldCheckmarkOutline, mdIcon: shieldCheckmarkOutline },
    { title: 'Terms of Service', url: '/policies/terms', iosIcon: documentTextOutline, mdIcon: documentTextOutline },
    { title: 'Cookie Policy', url: '/policies/cookie', iosIcon: null, mdIcon: null, hero: Cookie },
    { title: 'Debug', url: '#', iosIcon: null, mdIcon: null },
];

// 开发环境菜单项
export const DEV_MENU_ITEMS: AppPage[] = [
    // demo 不再作为正式页面的一部分
    // { title: 'PageLikeModal Demo', url: '#demo', iosIcon: null, mdIcon: null, hero: Layers }
];

// 获取完整的菜单配置（包含开发环境项）
export function getMenuConfig(): AppPage[] {
    const config = [...SIDE_MENU_CONFIG];
    
    if ((import.meta as any).env?.DEV) {
        config.push(...DEV_MENU_ITEMS);
    }
    
    return config;
}

// 事件映射配置
export const EVENT_MAP: Record<string, string> = {
    'Preferences': 'open-preferences',
    'Plans & Pricing': 'open-pricing',
    'Refund Policy': 'open-refund-policy',
    'Privacy Policy': 'open-privacy-policy',
    'Terms of Service': 'open-terms-of-service',
    'Cookie Policy': 'open-cookie-policy'
};