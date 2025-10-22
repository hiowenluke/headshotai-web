/**
 * 应用主入口
 * 启动应用并初始化所有必要的模块
 */

import { bootstrap } from './bootstrap';

// 启动应用
bootstrap().catch((error) => {
  console.error('[main] Bootstrap failed:', error);
});
