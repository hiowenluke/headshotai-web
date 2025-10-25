/**
 * 应用启动入口
 * 整合所有启动模块
 */

import { loadUIState, initUIStatePersistence } from '@/state/uiState';
import '@/utils/historyControl';
import { createAppInstance } from './appSetup';
import { handleFullPageAuth, setupSessionRefresh } from './authHandler';
import { setupSafariCompatibility } from './safariCompat';
import { mountApp } from './routeManager';
import { handlePaymentCallback } from './paymentHandler';
import router from '@/router';

export async function bootstrap() {
  // 初始化 UI 状态持久化
  loadUIState();
  initUIStatePersistence();

  // 处理支付回调（Stripe 重定向）
  handlePaymentCallback();

  // 创建应用实例
  const app = createAppInstance();

  // 处理认证
  handleFullPageAuth();
  setupSessionRefresh();

  // Safari 兼容性
  setupSafariCompatibility();

  // 挂载应用
  await mountApp(app, router);
}
