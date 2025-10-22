// 主页锁定功能
// 这个文件包含了阻止主页左边缘滑动手势的所有逻辑

// 全局触摸事件处理 - 彻底锁定主页，阻止左边缘滑动手势
// 无论是否有模态框打开，都完全阻止主页响应左边缘向右滑动的手势

const EDGE_THRESHOLD = 20; // 左边缘阈值（像素）
let isEdgeSwipeActive = false;

// 主页锁定类
export class HomePageLock {
  private isInitialized = false;
  private devMode: boolean;

  constructor(devMode = false) {
    this.devMode = devMode;
  }

  // 初始化主页锁定功能
  public initialize(): void {
    if (this.isInitialized) return;

    // 添加全局事件拦截器，确保主页在任何情况下都不响应左边缘滑动
    document.addEventListener('touchstart', this.handleGlobalTouchStart.bind(this), { 
      capture: true, 
      passive: false 
    });

    this.isInitialized = true;
  }

  // 清理主页锁定功能
  public cleanup(): void {
    if (!this.isInitialized) return;

    document.removeEventListener('touchstart', this.handleGlobalTouchStart.bind(this));
    this.isInitialized = false;
  }

  // 全局触摸开始事件处理
  private handleGlobalTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    if (touch.clientX <= EDGE_THRESHOLD) {
      // 检查事件是否来自主页或者应该被阻止的元素
      const target = event.target as HTMLElement;
      if (target && (
        target.closest('ion-router-outlet') || 
        target.tagName === 'ION-APP' ||
        !target.closest('ion-modal')
      )) {
        // 这是一个备用拦截机制，以防万一
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }

  // 应用级触摸开始事件处理
  public handleAppTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    const startX = touch.clientX;
    
    // 检查是否从左边缘开始滑动
    if (startX <= EDGE_THRESHOLD) {
      isEdgeSwipeActive = true;
      
      // 彻底锁定主页 - 无条件阻止左边缘滑动手势
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    } else {
      isEdgeSwipeActive = false;
    }
  }

  // 应用级触摸移动事件处理
  public handleAppTouchMove(event: TouchEvent): void {
    // 如果是左边缘滑动，无条件阻止
    if (isEdgeSwipeActive) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }

  // 应用级触摸结束事件处理
  public handleAppTouchEnd(event: TouchEvent): void {
    // 如果是左边缘滑动，无条件阻止
    if (isEdgeSwipeActive) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      
      // 重置状态
      isEdgeSwipeActive = false;
    }
  }

  // 应用级触摸取消事件处理
  public handleAppTouchCancel(event: TouchEvent): void {
    // 如果是左边缘滑动，无条件阻止
    if (isEdgeSwipeActive) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      
      // 重置状态
      isEdgeSwipeActive = false;
    }
  }
}

// 创建单例实例
let homePageLockInstance: HomePageLock | null = null;

// 获取主页锁定实例
export function getHomePageLock(devMode = false): HomePageLock {
  if (!homePageLockInstance) {
    homePageLockInstance = new HomePageLock(devMode);
  }
  return homePageLockInstance;
}

// 初始化主页锁定（便捷函数）
export function initializeHomePageLock(devMode = false): HomePageLock {
  const lock = getHomePageLock(devMode);
  lock.initialize();
  return lock;
}

// 清理主页锁定（便捷函数）
export function cleanupHomePageLock(): void {
  if (homePageLockInstance) {
    homePageLockInstance.cleanup();
    homePageLockInstance = null;
  }
}