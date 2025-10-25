# Web 前端构建优化策略

## 已实施的优化

### 1. 代码分包策略 (Code Splitting)

#### 1.1 入口分包
- **app.[hash].js** - 应用主入口，包含首屏必需代码
- **route-*.[hash].js** - 路由懒加载文件，按需加载
- **vendor-*.[hash].js** - 第三方依赖，长缓存

#### 1.2 Vendor 分包细化
```typescript
// vite.config.ts 中的配置
manualChunks: (id) => {
  if (id.includes('node_modules')) {
    // Ionic 框架单独分包 - 约 200KB
    if (id.includes('@ionic/vue') || id.includes('@ionic/core')) {
      return 'vendor-ionic';
    }
    
    // Vue 核心库单独分包 - 约 150KB
    if (id.includes('vue') && !id.includes('@ionic')) {
      return 'vendor-vue';
    }
    
    // 图标库单独分包 - 约 3KB
    if (id.includes('ionicons')) {
      return 'vendor-icons';
    }
    
    // Axios 单独分包 - 约 30KB
    if (id.includes('axios')) {
      return 'vendor-axios';
    }
    
    // 其他第三方库
    return 'vendor-libs';
  }
}
```

#### 1.3 业务代码分包
- **composables.[hash].js** - 组合式函数
- **services.[hash].js** - 服务层代码
- **components.[hash].js** - 通用组件
- **utils.[hash].js** - 工具函数

### 2. 懒加载策略 (Lazy Loading)

#### 2.1 路由懒加载
```typescript
// src/router/index.ts
const routes: Array<RouteRecordRaw> = [
  {
    path: '/home',
    component: () => import('../views/HomePage.vue') // ✅ 已实现
  }
]
```

#### 2.2 组件懒加载建议
需要对以下大型组件实施懒加载：

**高优先级（首屏不需要）：**
- GeneratorPage - 生成器页面
- BackdropsPage - 背景选择页面
- FaceUploadedPage - 上传照片页面
- UserCenterPage - 用户中心
- 所有侧边栏菜单页面（Terms, Privacy, Pricing 等）

**中优先级（低频使用）：**
- DebugPopup - 调试弹窗
- SmartLoadingDebug - 智能加载调试
- UploadProgressModal - 上传进度弹窗

### 3. Tree Shaking 优化

#### 3.1 已配置
```json
// package.json
{
  "sideEffects": false  // ✅ 已添加
}
```

#### 3.2 构建目标
```typescript
// vite.config.ts
build: {
  target: 'es2020',  // 现代浏览器，支持更多 ES 特性
  minify: 'terser',  // 使用 Terser 压缩
}
```

### 4. 内容指纹 + 长缓存

#### 4.1 文件命名策略
```typescript
// vite.config.ts
output: {
  entryFileNames: 'assets/app.[hash].js',
  chunkFileNames: (chunkInfo) => {
    if (chunkInfo.name.includes('views') || chunkInfo.name.includes('pages')) {
      return 'assets/route-[name].[hash].js';
    }
    return 'assets/[name].[hash].js';
  },
  assetFileNames: (assetInfo) => {
    if (assetInfo.name?.endsWith('.css')) {
      return 'assets/[name].[hash].css';
    }
    return 'assets/[name].[hash].[ext]';
  }
}
```

#### 4.2 缓存策略
- **vendor-* 文件**：长缓存（1年），很少变化
- **app.[hash].js**：中等缓存（1周），随版本更新
- **route-*.[hash].js**：中等缓存（1周），按需加载
- **assets/**：长缓存（1年），内容指纹保证更新

### 5. 生产环境优化

#### 5.1 代码压缩
```typescript
terserOptions: {
  compress: {
    drop_console: mode === 'production',  // 移除 console
    drop_debugger: true,                   // 移除 debugger
    pure_funcs: ['console.log', 'console.info', 'console.debug']
  }
}
```

#### 5.2 CSS 代码分割
```typescript
build: {
  cssCodeSplit: true  // CSS 按需加载
}
```

## 待实施的优化

### 1. 组件懒加载改造

#### 1.1 HomePage.vue 优化
**当前：**
```typescript
// src/pages/homepage/index.vue
import GeneratorPage from '@/pages/generator/index.vue';
import SmartLoadingDebug from '@/components/debug/SmartLoadingDebug.vue';
```

**优化后：**
```typescript
// src/pages/homepage/index.vue
import { defineAsyncComponent } from 'vue';

const GeneratorPage = defineAsyncComponent(() => 
  import('@/pages/generator/index.vue')
);

const SmartLoadingDebug = defineAsyncComponent(() => 
  import('@/components/debug/SmartLoadingDebug.vue')
);
```

#### 1.2 GeneratorPage 优化
**当前：**
```typescript
// src/pages/generator/index.vue
import Generator1P from './tabContent/Generator1P.vue';
import Generator20P from './tabContent/Generator20P.vue';
import Generator40P from './tabContent/Generator40P.vue';
import Generator80P from './tabContent/Generator80P.vue';
import FaceUploadedPage from '@/pages/uploadedPhotos/FaceUploadedPage.vue';
```

**优化后：**
```typescript
// src/pages/generator/index.vue
import { defineAsyncComponent } from 'vue';

const Generator1P = defineAsyncComponent(() => 
  import('./tabContent/Generator1P.vue')
);
const Generator20P = defineAsyncComponent(() => 
  import('./tabContent/Generator20P.vue')
);
const Generator40P = defineAsyncComponent(() => 
  import('./tabContent/Generator40P.vue')
);
const Generator80P = defineAsyncComponent(() => 
  import('./tabContent/Generator80P.vue')
);
const FaceUploadedPage = defineAsyncComponent(() => 
  import('@/pages/uploadedPhotos/FaceUploadedPage.vue')
);
```

### 2. Preload/Prefetch 策略

#### 2.1 关键资源 Preload
在 `index.html` 中添加：
```html
<!-- 预加载关键 CSS -->
<link rel="preload" href="/assets/app.[hash].css" as="style">

<!-- 预加载关键字体 -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
```

#### 2.2 次要资源 Prefetch
```html
<!-- 预取可能需要的页面 -->
<link rel="prefetch" href="/assets/route-generator.[hash].js">
<link rel="prefetch" href="/assets/vendor-icons.[hash].js">
```

#### 2.3 动态 Prefetch
```typescript
// src/utils/resourceHints.ts
export function prefetchRoute(routeName: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = `/assets/route-${routeName}.[hash].js`;
  document.head.appendChild(link);
}

// 在用户可能导航前预取
// 例如：鼠标悬停在导航按钮上时
onMouseEnter(() => {
  prefetchRoute('generator');
});
```

### 3. 图片优化

#### 3.1 使用现代图片格式
- WebP 格式（减少 25-35% 体积）
- AVIF 格式（减少 50% 体积，但兼容性较差）

#### 3.2 响应式图片
```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="fallback">
</picture>
```

#### 3.3 懒加载图片
```html
<img src="placeholder.jpg" data-src="real-image.jpg" loading="lazy">
```

### 4. 服务端配置

#### 4.1 Nginx 缓存配置
```nginx
# 长缓存 - vendor 和 assets
location ~* ^/assets/(vendor-|.*\.[a-f0-9]{8}\.(js|css|woff2|jpg|png|svg))$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 中等缓存 - app 和 route
location ~* ^/assets/(app\.|route-).*\.(js|css)$ {
    expires 7d;
    add_header Cache-Control "public";
}

# 不缓存 - HTML
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

#### 4.2 Gzip/Brotli 压缩
```nginx
# Gzip 压缩
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_min_length 1000;

# Brotli 压缩（更好）
brotli on;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

## 性能指标目标

### 首屏加载
- **FCP (First Contentful Paint)**: < 1.5s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **TTI (Time to Interactive)**: < 3.5s

### 资源大小
- **初始 JS 包**: < 200KB (gzipped)
- **初始 CSS**: < 50KB (gzipped)
- **Vendor 包**: < 300KB (gzipped)

### 缓存命中率
- **Vendor 缓存命中率**: > 95%
- **静态资源缓存命中率**: > 90%

## 构建分析

### 运行构建分析
```bash
npm run build:analyze
```

### 使用 Rollup Plugin Visualizer
```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  vue(),
  visualizer({
    open: true,
    gzipSize: true,
    brotliSize: true
  })
]
```

## 监控和优化

### 1. 使用 Lighthouse
```bash
lighthouse https://your-domain.com --view
```

### 2. 使用 WebPageTest
访问 https://www.webpagetest.org/

### 3. 使用 Chrome DevTools
- Performance 面板
- Network 面板
- Coverage 面板（查找未使用的代码）

## 总结

通过以上优化策略，预期可以实现：
- ✅ 首屏加载时间减少 40-50%
- ✅ 总体积减少 30-40%
- ✅ 缓存命中率提升到 90%+
- ✅ 用户体验显著提升

## 下一步行动

1. **立即执行**：
   - ✅ 已完成 Vite 配置优化
   - ✅ 已添加 sideEffects: false
   - ⏳ 实施组件懒加载改造

2. **短期（1周内）**：
   - 添加 Preload/Prefetch
   - 配置服务端缓存策略
   - 运行构建分析

3. **中期（1月内）**：
   - 图片优化（WebP/AVIF）
   - 实施动态 Prefetch
   - 性能监控集成
