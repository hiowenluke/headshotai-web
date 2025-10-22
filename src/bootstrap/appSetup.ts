/**
 * 应用基础设置模块
 * 处理 Vue 应用创建和基础配置
 */

import { createApp } from 'vue';
import { IonicVue } from '@ionic/vue';
import App from '@/App.vue';
import router from '@/router';

// CSS 导入
import '@/theme/variables.css';
import '@/theme/mobile-navigation.css';

// Ionic Core CSS（必需）
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

// Ionic Optional CSS（已移除未使用的 utility CSS）
// 以下 CSS 文件未在项目中使用，已注释以减少包体积：
// - padding.css: 未使用 ion-padding 等类
// - float-elements.css: 未使用 ion-float 等类
// - text-alignment.css: 未使用 ion-text-center 等类
// - text-transformation.css: 未使用 ion-text-uppercase 等类
// - flex-utils.css: 未使用 ion-justify-content 等类
// - display.css: 未使用 ion-hide 等类
// 如果将来需要使用这些 utility 类，可以取消注释相应的 CSS 文件

// Ionic Dark Mode（必需）
import '@ionic/vue/css/palettes/dark.class.css';

export function createAppInstance() {
  const app = createApp(App).use(IonicVue).use(router);

  // Force dark theme
  if (typeof document !== 'undefined' && !document.body.classList.contains('dark')) {
    document.body.classList.add('dark');
  }

  return app;
}
