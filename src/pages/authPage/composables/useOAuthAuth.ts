// OAuth认证逻辑组合式函数
// 处理Google、Facebook等OAuth认证流程

import { refreshSession, authState } from '@/state/authState';
import { apiFetch } from '@/utils/api';
import { useAuthState } from './useAuthState';
import { useAuthError } from './useAuthError';

export function useOAuthAuth() {
  const { 
    isProcessing, 
    authError, 
    cleanupAuth, 
    setPollTimer, 
    setFailTimer, 
    setMessageListener 
  } = useAuthState();
  
  const { mapError, ERROR_MESSAGES } = useAuthError();

  // 检测设备和浏览器类型
  function detectEnvironment() {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    return { isSafari, isIOS };
  }

  // 保存认证状态到localStorage
  function saveAuthState() {
    try {
      const currentPath = window.location.pathname || '/home';
      localStorage.setItem('auth:returnPath', currentPath);
      localStorage.setItem('auth:isFullPageAuth', '1');
      
      const { isSafari, isIOS } = detectEnvironment();
      if (isSafari || isIOS) {
        localStorage.setItem('auth:safariAuth', '1');
      }
    } catch (e) {
      console.error('[Auth] Error saving auth state:', e);
    }
  }

  // 显示加载提示
  function showLoadingToast() {
    window.dispatchEvent(new CustomEvent('app:loading-toast', { 
      detail: { show: true, duration: 3000 }
    }));
  }

  // 处理认证成功
  function handleAuthSuccess() {
    cleanupAuth();
    
    refreshSession().then(() => {
      try {
        const user: any = (authState as any).user;
        const baseName = (user && (user.name || (user.email ? user.email.split('@')[0] : ''))) || '';
        const message = user?.is_new_user ? `Welcome, ${baseName}` : `Welcome back, ${baseName}`;
        
        window.dispatchEvent(new CustomEvent('app:toast', { 
          detail: { message, type: 'success' }
        }));
      } catch {
        // 忽略错误，不影响主流程
      }
      
      // 登录成功后关闭登录页
      window.dispatchEvent(new Event('close-auth'));
    }).catch(err => {
      console.error('[Auth] Error refreshing session:', err);
      authError.value = ERROR_MESSAGES.SESSION_REFRESH_FAILED;
    });
  }

  // 处理认证失败
  function handleAuthFailure(reason?: string) {
    cleanupAuth();
    authError.value = mapError(reason);
  }

  // 设置消息监听器
  function setupMessageListener(popup: Window | null) {
    const messageHandler = (e: MessageEvent) => {
      // 基本验证：检查消息格式
      if (!e || !e.data || typeof e.data !== 'object') return;
      
      const { type, provider } = e.data;
      
      if (type === 'auth:success' && provider === 'google') {
        handleAuthSuccess();
        requestPopupClose(popup);
      } else if (type === 'auth:failure' && provider === 'google') {
        handleAuthFailure(e.data.reason);
      }
    };
    
    setMessageListener(messageHandler);
  }

  // 设置会话轮询
  function setupSessionPolling(popup: Window | null) {
    let pollCount = 0;
    const pollMax = 40; // ~60s if interval 1500ms
    const pollInterval = 1500;
    
    const pollHandler = () => {
      if (authError.value) { 
        cleanupAuth();
        return; 
      }
      
  apiFetch('/api/auth/session', { credentials: 'include' })
        .then(r => r.ok ? r.json() : { authenticated: false })
        .then(j => {
          if (j.authenticated) {
            handleAuthSuccess();
            requestPopupClose(popup);
          }
        })
        .catch(() => {
          // 忽略网络错误，继续轮询
        });
      
      pollCount++;
      if (pollCount >= pollMax) {
        cleanupAuth();
      }
    };
    
    setPollTimer(pollHandler, pollInterval);
  }

  // 设置超时处理
  function setupTimeout(popup: Window | null) {
    const timeoutHandler = () => {
      if (authError.value) return; // 已经设置了错误
      authError.value = ERROR_MESSAGES.TIMEOUT;
      cleanupAuth();
      requestPopupClose(popup);
    };
    
    setFailTimer(timeoutHandler, 120000); // 120秒超时
  }

  // 尝试打开弹窗
  function tryOpenPopup(url: string): Window | null {
    try {
      return window.open(url, 'google_auth', 'width=520,height=640');
    } catch (_) {
      return null;
    }
  }

  // 检查弹窗是否被阻止
  function isPopupBlocked(popup: Window | null): boolean {
    return !popup || popup.closed || typeof popup.closed === 'undefined';
  }

  // 启动Google认证
  async function startGoogle() {
    try {
      // 清理之前的认证状态
      cleanupAuth();
      isProcessing.value = true;

      // 获取认证URL
  const response = await apiFetch('/api/auth/google/start', { credentials: 'include' });
      const data = await response.json();

      if (!data.url) {
        const errorMsg = data.error 
          ? `Unable to start Google sign-in: ${data.error}`
          : ERROR_MESSAGES.MISSING_URL;
        authError.value = errorMsg;
        isProcessing.value = false;
        return;
      }

      // 显示加载提示
      showLoadingToast();

      // 尝试打开弹窗
      const popup = tryOpenPopup(data.url);
      
      if (isPopupBlocked(popup)) {
        // 弹窗被阻止，使用全页面跳转
        saveAuthState();
        window.location.assign(data.url);
        return;
      }

      // 设置各种监听器和定时器
      setupTimeout(popup);
      setupSessionPolling(popup);
      setupMessageListener(popup);

    } catch (err) {
      console.error('[Auth] Error starting Google auth:', err);
      isProcessing.value = false;
      authError.value = ERROR_MESSAGES.NETWORK_ERROR;
    }
  }

  function requestPopupClose(popup: Window | null) {
    if (!popup || popup.closed) return;
    let sameOrigin = false;
    try {
      void popup.location.href;
      sameOrigin = true;
    } catch {
      sameOrigin = false;
    }

    if (sameOrigin) {
      try { popup.close(); } catch { /* ignore */ }
      return;
    }

    try {
      popup.postMessage({ type: 'auth:close-popup' }, window.location.origin);
    } catch {
      try {
        popup.postMessage({ type: 'auth:close-popup' }, '*');
      } catch {
        /* ignore */
      }
    }
  }

  // 主要的登录入口
  function signIn(provider: 'google' | 'facebook') {
    authError.value = undefined;
    
    if (provider === 'google') {
      startGoogle();
    }
    // 其他认证提供商的占位符
    // else if (provider === 'facebook') {
    //   startFacebook();
    // }
  }

  return {
    // 状态
    isProcessing,
    authError,
    
    // 方法
    signIn,
    cleanupAuth
  };
}