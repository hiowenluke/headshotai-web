/**
 * 路由管理模块
 * 处理路由恢复和应用挂载
 */

import type { App } from 'vue';
import type { Router } from 'vue-router';
import { uiState } from '@/state/uiState';
import { handleAuthAfterMount } from './authHandler';
import { setupGlobalZoomPrevention, setupHistoryControl, cleanupInlineStyles } from './globalEvents';

export async function mountApp(app: App, router: Router) {
  await router.isReady();

  // 恢复路由状态
  try {
    if (uiState.route && uiState.route !== window.location.pathname + window.location.search) {
      const blocked = ['/debug'];
      if (!blocked.includes(uiState.route)) {
        router.replace(uiState.route).catch(() => {});
      } else {
        router.replace('/home').catch(() => {});
      }
    }
  } catch {
    /* ignore route restore errors */
  }

  // 挂载应用
  app.mount('#app');

  // 隐藏 App Shell
  try {
    (window as any).__hideAppShell?.();
  } catch {
    /* ignore */
  }

  // Safari 挂载后额外处理
  handleAuthAfterMount();

  // 清理内联样式
  cleanupInlineStyles();

  // 设置全局事件
  setupGlobalZoomPrevention();
  setupHistoryControl();
}
