// 移动端浏览器历史控制工具
export class MobileHistoryController {
  private static instance: MobileHistoryController;
  private preventNavigationActive = false;
  private isMobile = false;
  private isIOS = false;
  private isAndroid = false;
  private initialUrl = '';

  private constructor() {
    this.detectMobile();
    this.init();
  }

  public static getInstance(): MobileHistoryController {
    if (!MobileHistoryController.instance) {
      MobileHistoryController.instance = new MobileHistoryController();
    }
    return MobileHistoryController.instance;
  }

  private detectMobile() {
    const userAgent = navigator.userAgent.toLowerCase();
    this.isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    this.isIOS = /iphone|ipad|ipod/i.test(userAgent);
    this.isAndroid = /android/i.test(userAgent);
    
    // 移动设备检测完成
  }

  private init() {
    this.initialUrl = window.location.href;
    
    // 移动端需要等待页面完全加载
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.activatePreventNavigation(), 100);
      });
    } else {
      setTimeout(() => this.activatePreventNavigation(), 100);
    }
  }

  public activatePreventNavigation() {
    if (this.preventNavigationActive) return;
    
    this.preventNavigationActive = true;
    // 激活移动端历史控制

    // 移动端特殊的历史控制
    this.mobileControlHistory();

    // 添加移动端优化的事件监听器
    this.addMobileEventListeners();

    // 移动端不需要太频繁的检查
    this.startMobilePeriodicCheck();
  }

  private mobileControlHistory() {
    try {
      // 移动端历史控制策略
      if (this.isIOS) {
        // iOS Safari 特殊处理
        this.iosHistoryControl();
      } else if (this.isAndroid) {
        // Android Chrome 特殊处理
        this.androidHistoryControl();
      } else {
        // 通用移动端处理
        this.genericMobileHistoryControl();
      }
    } catch (error) {
      console.warn('Mobile history control failed:', error);
    }
  }

  private iosHistoryControl() {
    // iOS Safari 对 history.pushState 有特殊限制
    // 使用 replaceState 更安全
    window.history.replaceState(
      { preventBack: true, timestamp: Date.now() }, 
      document.title, 
      window.location.href
    );
    
    // iOS 需要额外的状态来防止后退
    setTimeout(() => {
      window.history.pushState(
        { preventBack: true, timestamp: Date.now() },
        document.title,
        window.location.href
      );
    }, 50);
  }

  private androidHistoryControl() {
    // Android Chrome 处理
    const state = { 
      preventBack: true, 
      timestamp: Date.now(),
      originalUrl: this.initialUrl 
    };
    
    window.history.replaceState(state, document.title, window.location.href);
    
    setTimeout(() => {
      window.history.pushState(state, document.title, window.location.href);
    }, 30);
  }

  private genericMobileHistoryControl() {
    // 通用移动端处理
    const state = { 
      preventBack: true, 
      timestamp: Date.now() 
    };
    
    window.history.replaceState(state, document.title, window.location.href);
    
    setTimeout(() => {
      window.history.pushState(state, document.title, window.location.href);
    }, 20);
  }

  private addMobileEventListeners() {
    // 移动端优化的 popstate 处理
    // 轻量 popstate 监听（不阻止默认，仅重新注入一条 state 防止额外返回层）
    window.addEventListener('popstate', () => {
      try { this.mobileControlHistory(); } catch { /* ignore */ }
    });

    // 移动端页面可见性处理
  document.addEventListener('visibilitychange', this.handleMobileVisibilityChange.bind(this));

    // 移动端触摸事件（防止手势导航）
  // 移除全局 touch 拦截，避免干扰浏览器原生缓存 / BFCache

    // 移动端页面焦点处理
  // focus/blur 拦截去除

    // 移动端 beforeunload 处理
  // beforeunload 拦截去除，允许浏览器正常缓存

    // 移动端 pagehide 处理
  // pagehide 不强制阻止
  }

  // 移除侵入式 popstate handler

  private handleMobileVisibilityChange() {
    if (document.visibilityState === 'visible') {
      // 页面重新可见，重新激活历史控制
      setTimeout(() => {
        this.mobileControlHistory();
      }, 200);
    }
  }

  // 移除 touch 拦截

  // focus/blur 简化移除

  // beforeunload/pagehide 行为移除

  private startMobilePeriodicCheck() {
    // 移动端检查频率降低到1秒一次
  // 降低为被动策略：不再周期重置
  }

  public deactivatePreventNavigation() {
    this.preventNavigationActive = false;
    // 移动端历史控制已停用
  }
}

// 立即创建实例并导出
export const mobileHistoryController = MobileHistoryController.getInstance();
