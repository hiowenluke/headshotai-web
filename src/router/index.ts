import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/home'
  },
  {
    path: '/home',
    component: () => import('../views/HomePage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 移动端历史控制（简化版）
let isAppNavigation = false;
let isInitialNavigation = true;

// 移动端历史控制函数 - Safari 兼容版本
function mobilePreventNavigation() {
  try {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isSafari || isIOS) {
      // Safari 使用更温和的历史控制
      const state = { 
        safariAuth: true,
        timestamp: Date.now(),
        route: window.location.pathname
      };
      window.history.replaceState(state, document.title, window.location.href);
    } else {
      // 其他浏览器使用原有逻辑
      const state = { 
        preventBack: true, 
        timestamp: Date.now(),
        route: window.location.pathname
      };
      window.history.replaceState(state, document.title, window.location.href);
      
      setTimeout(() => {
        window.history.pushState(state, document.title, window.location.href);
      }, 20);
    }
  } catch (error) {
    console.warn('Mobile history control failed:', error);
  }
}

// 标记应用内导航
router.beforeEach((to, from, next) => {
  // 允许初始导航和重定向
  if (isInitialNavigation || from.path === '' || from.path === '/' || to.redirectedFrom) {
    isInitialNavigation = false;
    next();
    // 导航完成后防止浏览器后退
    setTimeout(mobilePreventNavigation, 50);
    return;
  }
  
  if (!isAppNavigation) {
    // 如果不是应用内导航，阻止跳转并保持在当前页面
    if (from.path !== to.path) {
      next(false);
      mobilePreventNavigation();
      return;
    }
  }
  isAppNavigation = false;
  next();
  // 导航完成后防止浏览器后退
  setTimeout(mobilePreventNavigation, 50);
});

// 导航完成后的处理
router.afterEach(() => {
  // 确保每次导航后都防止浏览器后退
  setTimeout(mobilePreventNavigation, 50);
});

// 重写路由器的push和replace方法来标记应用内导航
const originalPush = router.push;
const originalReplace = router.replace;

router.push = function(...args) {
  isAppNavigation = true;
  return originalPush.apply(this, args).finally(() => {
    // 应用内导航完成后也要防止浏览器后退
    setTimeout(mobilePreventNavigation, 50);
  });
};

router.replace = function(...args) {
  isAppNavigation = true;
  return originalReplace.apply(this, args).finally(() => {
    // 应用内导航完成后也要防止浏览器后退
    setTimeout(mobilePreventNavigation, 50);
  });
};

// Safari 兼容的页面可见性处理
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Safari 需要更温和的处理
    if (isSafari || isIOS) {
      // Safari 中不强制重定向，避免干扰认证流程
      setTimeout(() => {
        try {
          mobilePreventNavigation();
        } catch { /* ignore */ }
      }, 200);
    } else {
      // 其他浏览器保持原有逻辑
      const currentPath = router.currentRoute.value.fullPath;
      if (window.location.pathname !== currentPath) {
        window.location.href = window.location.origin + currentPath;
      }
      setTimeout(mobilePreventNavigation, 100);
    }
  }
});

// ===== 可选：仅在真实移动端 & 生产环境启用离开确认，避免桌面 Chrome 模拟器频繁弹窗 =====
const ua = navigator.userAgent.toLowerCase();
const isRealMobileUA = /android|iphone|ipad|ipod/i.test(ua) && !/macintosh|windows|linux/i.test(ua);
// 如果需要在开发调试时完全关闭提示，也可强制设为 false
const enableLeaveConfirm = isRealMobileUA && !import.meta.env.DEV;

if (enableLeaveConfirm) {
  window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    event.returnValue = 'Are you sure you want to leave this app?';
    mobilePreventNavigation();
    return 'Are you sure you want to leave this app?';
  });
}

// 处理页面隐藏
window.addEventListener('pagehide', (event) => {
  event.preventDefault();
  mobilePreventNavigation();
});

// 移动端的popstate事件监听器（Safari 兼容版本）
window.addEventListener('popstate', function(event) {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isSafari || isIOS) {
    // Safari 中不阻止默认行为，避免干扰认证流程
    setTimeout(() => {
      try {
        mobilePreventNavigation();
      } catch { /* ignore */ }
    }, 100);
  } else {
    // 其他浏览器保持原有逻辑
    event.preventDefault();
    event.stopPropagation();
    mobilePreventNavigation();
    return false;
  }
}, true);

// 监听页面焦点变化
window.addEventListener('focus', () => {
  mobilePreventNavigation();
});

window.addEventListener('blur', () => {
  mobilePreventNavigation();
});

export default router
