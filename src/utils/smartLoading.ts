// 智能加载配置和管理工具
// 根据网络速度自适应调整卡片列表的加载策略

import { ref, reactive } from 'vue';

// 智能加载配置接口
export interface SmartLoadingConfig {
  // 基础配置
  cardsPerScreen: number;           // 每屏卡片数量（默认6张）
  networkSpeedThreshold: number;    // 网速判断阈值（毫秒，默认300ms）
  
  // 网络速度标记
  isSlowNetwork: boolean;           // 是否为低速网络
  networkSpeedDetected: boolean;    // 是否已检测网速
  
  // 加载策略配置
  slowNetwork: {
    screensPerLoad: number;         // 低速网络每次加载屏数（默认3屏）
  };
  fastNetwork: {
    screensPerLoad: number;         // 高速网络每次加载屏数（默认10屏）
    autoLoadOtherMenus: boolean;    // 是否自动加载其他菜单项
  };
  
  // 运行时状态
  firstMenuLoaded: boolean;         // 第一个菜单项是否已加载
  loadingStartTime: number;         // 加载开始时间
  currentLoadingCategory: string | null; // 当前正在加载的分类
}

// 全局智能加载配置
const config = reactive<SmartLoadingConfig>({
  // 基础配置
  cardsPerScreen: 6,
  networkSpeedThreshold: 300,
  
  // 网络速度标记
  isSlowNetwork: false,
  networkSpeedDetected: false,
  
  // 加载策略配置
  slowNetwork: {
    screensPerLoad: 3
  },
  fastNetwork: {
    screensPerLoad: 10,
    autoLoadOtherMenus: true
  },
  
  // 运行时状态
  firstMenuLoaded: false,
  loadingStartTime: 0,
  currentLoadingCategory: null
});

// 菜单切换状态管理
const menuSwitchState = reactive({
  isFirstMenu: true,              // 是否为第一个菜单项
  switchedMenus: new Set<string>(), // 已切换过的菜单项
  currentMenuCategory: ''         // 当前菜单分类
});

// 创建智能加载配置管理器
export function createSmartLoadingConfig() {
  
  // 初始化配置
  const initialize = () => {
    // 从本地存储读取配置
    loadConfigFromStorage();
    
    // 监听菜单切换事件
    window.addEventListener('menu-switched', handleMenuSwitch);
    
    // console.log('[SmartLoading] Initialized with config:', config);
  };
  
  // 从本地存储加载配置
  const loadConfigFromStorage = () => {
    try {
      const saved = localStorage.getItem('smart_loading_config');
      if (saved) {
        const savedConfig = JSON.parse(saved);
        Object.assign(config, savedConfig);
      }
    } catch (error) {
      console.warn('[SmartLoading] Failed to load config from storage:', error);
    }
  };
  
  // 保存配置到本地存储
  const saveConfigToStorage = () => {
    try {
      localStorage.setItem('smart_loading_config', JSON.stringify(config));
    } catch (error) {
      console.warn('[SmartLoading] Failed to save config to storage:', error);
    }
  };
  
  // 开始网速检测
  const startNetworkSpeedDetection = (category: string) => {
    if (config.networkSpeedDetected) return;
    
    config.loadingStartTime = Date.now();
    config.currentLoadingCategory = category;
    
    // console.log('[SmartLoading] Started network speed detection for category:', category);
  };
  
  // 完成网速检测
  const completeNetworkSpeedDetection = (category: string, success: boolean = true) => {
    if (config.networkSpeedDetected || config.currentLoadingCategory !== category) return;
    
    const loadTime = Date.now() - config.loadingStartTime;
    config.isSlowNetwork = loadTime > config.networkSpeedThreshold;
    config.networkSpeedDetected = true;
    config.firstMenuLoaded = true;
    
    // console.log(`[SmartLoading] Network speed detected: ${config.isSlowNetwork ? 'SLOW' : 'FAST'} (${loadTime}ms)`);
    
    // 保存配置
    saveConfigToStorage();
    
    // 触发网速检测完成事件
    window.dispatchEvent(new CustomEvent('network-speed-detected', {
      detail: {
        isSlowNetwork: config.isSlowNetwork,
        loadTime,
        category
      }
    }));
  };
  
  // 处理菜单切换
  const handleMenuSwitch = (event: any) => {
    const { category, isFirst } = event.detail || {};
    
    if (category) {
      menuSwitchState.currentMenuCategory = category;
      menuSwitchState.isFirstMenu = isFirst || false;
      
      if (!menuSwitchState.switchedMenus.has(category)) {
        menuSwitchState.switchedMenus.add(category);
      }
      
    //   console.log('[SmartLoading] Menu switched to:', category, 'isFirst:', isFirst);
    }
  };
  
  // 获取当前加载策略
  const getLoadingStrategy = (category: string, isFirstMenu: boolean = false) => {
    // 如果还没检测网速，使用保守策略
    if (!config.networkSpeedDetected) {
      return {
        screensToLoad: 1, // 只加载第一屏用于网速检测
        shouldAutoLoadOthers: false,
        reason: 'network-speed-detection'
      };
    }
    
    // 根据网速返回相应策略
    if (config.isSlowNetwork) {
      return {
        screensToLoad: config.slowNetwork.screensPerLoad,
        shouldAutoLoadOthers: false,
        reason: 'slow-network'
      };
    } else {
      return {
        screensToLoad: config.fastNetwork.screensPerLoad,
        shouldAutoLoadOthers: config.fastNetwork.autoLoadOtherMenus && isFirstMenu,
        reason: 'fast-network'
      };
    }
  };
  
  // 计算每次加载的卡片数量
  const getCardsPerLoad = (screensToLoad: number) => {
    return config.cardsPerScreen * screensToLoad;
  };
  
  // 检查是否应该自动加载其他菜单
  const shouldAutoLoadOtherMenus = (category: string) => {
    if (!config.networkSpeedDetected || config.isSlowNetwork) return false;
    
    // 只有第一个菜单项且是高速网络才自动加载其他菜单
    return menuSwitchState.isFirstMenu && config.fastNetwork.autoLoadOtherMenus;
  };
  
  // 检查是否为第一次加载某个分类
  const isFirstLoadForCategory = (category: string) => {
    return !menuSwitchState.switchedMenus.has(category);
  };
  
  // 重置网速检测（用于测试或重新检测）
  const resetNetworkDetection = () => {
    config.networkSpeedDetected = false;
    config.firstMenuLoaded = false;
    config.isSlowNetwork = false;
    config.loadingStartTime = 0;
    config.currentLoadingCategory = null;
    menuSwitchState.switchedMenus.clear();
    
    // 清除本地存储
    localStorage.removeItem('smart_loading_config');
    
    // console.log('[SmartLoading] Network detection reset');
  };
  
  // 更新配置
  const updateConfig = (updates: Partial<SmartLoadingConfig>) => {
    Object.assign(config, updates);
    saveConfigToStorage();
  };
  
  // 清理资源
  const cleanup = () => {
    window.removeEventListener('menu-switched', handleMenuSwitch);
  };
  
  return {
    // 配置对象
    config,
    menuSwitchState,
    
    // 方法
    initialize,
    startNetworkSpeedDetection,
    completeNetworkSpeedDetection,
    getLoadingStrategy,
    getCardsPerLoad,
    shouldAutoLoadOtherMenus,
    isFirstLoadForCategory,
    resetNetworkDetection,
    updateConfig,
    cleanup
  };
}

// 导出全局实例（单例模式）
let globalSmartLoadingConfig: ReturnType<typeof createSmartLoadingConfig> | null = null;

export function getSmartLoadingConfig() {
  if (!globalSmartLoadingConfig) {
    globalSmartLoadingConfig = createSmartLoadingConfig();
  }
  return globalSmartLoadingConfig;
}

// 便捷函数
export function getLoadingStrategy(category: string, isFirstMenu: boolean = false) {
  return getSmartLoadingConfig().getLoadingStrategy(category, isFirstMenu);
}

export function startNetworkSpeedDetection(category: string) {
  return getSmartLoadingConfig().startNetworkSpeedDetection(category);
}

export function completeNetworkSpeedDetection(category: string, success: boolean = true) {
  return getSmartLoadingConfig().completeNetworkSpeedDetection(category, success);
}