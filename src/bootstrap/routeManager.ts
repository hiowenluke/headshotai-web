/**
 * 路由管理模块
 * 处理路由恢复和应用挂载
 */

/*
  消除被骨架屏 header 覆盖的处理：
  如果将来添加了其他外部服务的回调（类似 Stripe），比如：
    · 第三方支付回调（PayPal、Apple Pay 等）
    · 社交分享回调
    · 深度链接（Deep Link）处理
  那时可以参考 paymentHandler.ts 的模式，创建类似的处理模块。
*/

import type { App } from 'vue';
import type { Router } from 'vue-router';
import { uiState } from '@/state/uiState';
import { handleAuthAfterMount } from './authHandler';
import { setupGlobalZoomPrevention, setupHistoryControl, cleanupInlineStyles } from './globalEvents';
import { forceRemoveSkeleton } from '@/utils/skeletonControl';

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

  // 隐藏 App Shell（骨架屏）
  forceRemoveSkeleton();

  // Safari 挂载后额外处理
  handleAuthAfterMount();

  // 清理内联样式
  cleanupInlineStyles();

  // 设置全局事件
  setupGlobalZoomPrevention();
  setupHistoryControl();
}
