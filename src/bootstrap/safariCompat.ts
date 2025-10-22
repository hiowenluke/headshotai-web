/**
 * Safari 兼容性处理模块
 * 处理 Safari 特有的 BFCache 和可见性变化
 */

import { refreshSession, authState } from '@/state/authState';
import { isSafari, isIOS } from './authHandler';

function showWelcomeToast(delay: number = 100) {
  try {
    const user: any = (authState as any).user;
    const baseName =
      (user && (user.name || (user.email ? user.email.split('@')[0] : ''))) || '';
    const msg = user?.is_new_user ? `Welcome, ${baseName}` : `Welcome back, ${baseName}`;

    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('app:toast', { detail: { message: msg, type: 'success' } })
      );
    }, delay);
  } catch {
    /* ignore */
  }
}

export function setupSafariCompatibility() {
  if (!(isSafari || isIOS)) return;

  // Safari BFCache 处理
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      // 页面从缓存恢复，需要重新检查认证状态
      setTimeout(() => {
        refreshSession()
          .then(() => {
            // 检查是否有待处理的认证成功状态
            const just = localStorage.getItem('auth:justLoggedIn');
            if (just === '1') {
              localStorage.removeItem('auth:justLoggedIn');
              showWelcomeToast(300);
            }
          })
          .catch(() => {
            // 忽略刷新错误
          });
      }, 100);
    }
  });

  // Safari 可见性变化处理
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      setTimeout(() => {
        const just = localStorage.getItem('auth:justLoggedIn');
        if (just === '1') {
          localStorage.removeItem('auth:justLoggedIn');
          refreshSession()
            .then(() => {
              showWelcomeToast(200);
            })
            .catch(() => {});
        } else {
          refreshSession()
            .then(() => {
              // 会话恢复成功
            })
            .catch(() => {});
        }
      }, 300);
    }
  });
}
