/**
 * 认证处理模块
 * 处理登录状态恢复和全页认证
 */

import router from '@/router';
import { refreshSession, authState } from '@/state/authState';

export const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
export const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

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

function handleAuthRedirect(isFullPageAuth: string | null, returnPath: string | null) {
  try {
    if (isFullPageAuth === '1' && returnPath && returnPath !== '/') {
      router.replace(returnPath).catch(() => {
        router.replace('/home').catch(() => {});
      });
    } else {
      const currentPath = router.currentRoute?.value?.path;
      if (currentPath === '/' || currentPath === '' || currentPath === undefined) {
        router.replace('/home').catch(() => {});
      }
    }
  } catch {
    /* ignore auth redirect errors */
  }
}

export function handleFullPageAuth() {
  try {
    const just = localStorage.getItem('auth:justLoggedIn');
    const isFullPageAuth = localStorage.getItem('auth:isFullPageAuth');
    const returnPath = localStorage.getItem('auth:returnPath');

    if (just === '1') {
      localStorage.removeItem('auth:justLoggedIn');

      if (isFullPageAuth === '1') {
        localStorage.removeItem('auth:isFullPageAuth');
        if (returnPath) {
          localStorage.removeItem('auth:returnPath');
        }
      }

      const handleAuthSuccess = () => {
        refreshSession()
          .then(() => {
            const toastDelay = isSafari || isIOS ? 500 : 100;
            showWelcomeToast(toastDelay);
            handleAuthRedirect(isFullPageAuth, returnPath);
          })
          .catch(() => {
            try {
              window.dispatchEvent(
                new CustomEvent('app:toast', {
                  detail: {
                    message: 'Login verification failed. Please try again.',
                    type: 'error'
                  }
                })
              );
            } catch {
              /* ignore */
            }
          });
      };

      // Safari 需要等待页面完全准备就绪
      if (isSafari || isIOS) {
        if (document.readyState === 'complete') {
          setTimeout(handleAuthSuccess, 200);
        } else {
          window.addEventListener('load', () => {
            setTimeout(handleAuthSuccess, 200);
          });
        }
      } else {
        handleAuthSuccess();
      }
    } else {
      // 普通启动场景：恢复现有会话
      refreshSession()
        .then(() => {
          // 会话恢复成功
        })
        .catch(() => {});
    }

    // 处理认证失败
    const fail = localStorage.getItem('auth:authFail');
    if (fail) {
      localStorage.removeItem('auth:authFail');
      try {
        window.dispatchEvent(
          new CustomEvent('app:toast', {
            detail: { message: 'Login failed: ' + fail, type: 'error' }
          })
        );
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore */
  }
}

export function setupSessionRefresh() {
  // 轻量周期刷新：防止移动端偶发页面重载后 authState 与 cookie 脱节
  setInterval(() => {
    try {
      if (!authState.isLoggedIn) return;
      refreshSession().catch(() => {});
    } catch {
      /* ignore */
    }
  }, 120000); // 2 分钟一次
}

export function handleAuthAfterMount() {
  if (!(isSafari || isIOS)) return;

  setTimeout(() => {
    const just = localStorage.getItem('auth:justLoggedIn');
    if (just === '1') {
      localStorage.removeItem('auth:justLoggedIn');
      refreshSession()
        .then(() => {
          showWelcomeToast(100);
        })
        .catch(() => {});
    } else {
      refreshSession()
        .then(() => {
          // 会话恢复成功
        })
        .catch(() => {});
    }
  }, 500);
}
