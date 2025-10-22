# Web 前端构建优化检查清单

## ✅ 已完成项

### 构建配置
- [x] **代码分包策略** - Vite 配置中实现精细化分包
  - [x] Vendor 分包（ionic, vue, icons, axios, libs）
  - [x] 业务代码分包（composables, services, components, utils）
  - [x] 路由分包（route-*）

- [x] **文件命名策略** - 内容指纹 + 长缓存
  - [x] 入口文件：`app.[hash].js`
  - [x] Chunk 文件：`[name].[hash].js`
  - [x] 路由文件：`route-[name].[hash].js`
  - [x] 资源文件：`[name].[hash].[ext]`

- [x] **Tree Shaking** - 启用死代码消除
  - [x] package.json 添加 `sideEffects: false`
  - [x] 构建目标设置为 `es2020`

- [x] **生产环境优化**
  - [x] Terser 压缩配置
  - [x] 移除 console.log
  - [x] CSS 代码分割
  - [x] Chunk 大小警告

- [x] **构建脚本**
  - [x] 添加 `build:analyze` 命令

## ✅ 已完成项（续）

### 组件懒加载（高优先级）✅
- [x] **src/pages/homepage/index.vue**
  - [x] GeneratorPage 改为懒加载
  - [x] SmartLoadingDebug 改为懒加载

- [x] **src/pages/generator/index.vue**
  - [x] Generator1P 改为懒加载
  - [x] Generator20P 改为懒加载
  - [x] Generator40P 改为懒加载
  - [x] Generator80P 改为懒加载
  - [x] UploadProgressModal 改为懒加载
  - [x] FaceUploadController 改为懒加载
  - [x] FaceUploadedPage 改为懒加载

- [x] **src/pages/authPage/index.vue**
  - [x] TermsOfServicePage 改为懒加载
  - [x] PrivacyPolicyPage 改为懒加载
  - [x] CookiePolicyPage 改为懒加载

- [x] **src/pages/generator/tabContent/Generator20P.vue**
  - [x] BackdropsPage 改为懒加载

- [x] **其他低频组件**
  - [x] ConfirmDialog 改为懒加载（userCenter, DebugPopup）

## ⏳ 待完成项

### 资源预加载（中优先级）
- [ ] **Preload 关键资源**
  - [ ] 在 index.html 中添加关键 CSS preload
  - [ ] 添加关键字体 preload

- [ ] **Prefetch 次要资源**
  - [ ] 添加 generator 路由 prefetch
  - [ ] 添加 icons 库 prefetch

- [ ] **动态 Prefetch**
  - [ ] 创建 resourceHints.ts 工具
  - [ ] 在用户交互时预加载资源

### 服务端配置（中优先级）
- [ ] **Nginx 缓存策略**
  - [ ] 配置 vendor 文件长缓存（1年）
  - [ ] 配置 app/route 文件中等缓存（1周）
  - [ ] 配置 HTML 文件不缓存

- [ ] **压缩配置**
  - [ ] 启用 Gzip 压缩
  - [ ] 启用 Brotli 压缩（可选）

### 图片优化（低优先级）
- [ ] **现代图片格式**
  - [ ] 转换为 WebP 格式
  - [ ] 提供 AVIF 格式（可选）

- [ ] **响应式图片**
  - [ ] 使用 `<picture>` 标签
  - [ ] 提供多种尺寸

- [ ] **懒加载图片**
  - [ ] 添加 `loading="lazy"` 属性
  - [ ] 使用 Intersection Observer

### 性能监控（低优先级）
- [ ] **集成监控工具**
  - [ ] 集成 Lighthouse CI
  - [ ] 集成 Web Vitals
  - [ ] 设置性能预算

- [ ] **持续监控**
  - [ ] 设置性能基准
  - [ ] 定期性能测试
  - [ ] 性能回归检测

## 🔍 验证步骤

### 每次优化后必做
- [ ] 运行 `npm run build` 检查构建产物
- [ ] 运行 `npm run preview` 本地预览
- [ ] 检查 Network 面板资源加载
- [ ] 检查 Coverage 面板代码覆盖率
- [ ] 运行 Lighthouse 测试

### 定期检查
- [ ] 每周运行一次完整性能测试
- [ ] 每月更新性能基准数据
- [ ] 每季度审查优化策略

## 📊 性能指标跟踪

### 当前基准（优化前）
```
记录日期：____/____/____

首屏加载：
- 总大小：_______ KB (gzipped: _______ KB)
- FCP：_______ s
- LCP：_______ s
- TTI：_______ s
- CLS：_______

Lighthouse 分数：
- Performance：_______
- Accessibility：_______
- Best Practices：_______
- SEO：_______
```

### 目标指标
```
首屏加载：
- 总大小：< 700KB (gzipped: < 210KB)
- FCP：< 1.5s
- LCP：< 2.5s
- TTI：< 3.5s
- CLS：< 0.1

Lighthouse 分数：
- Performance：> 90
- Accessibility：> 90
- Best Practices：> 90
- SEO：> 90
```

### 优化后实际（记录）
```
记录日期：____/____/____

首屏加载：
- 总大小：_______ KB (gzipped: _______ KB) [改善：_______% ]
- FCP：_______ s [改善：_______% ]
- LCP：_______ s [改善：_______% ]
- TTI：_______ s [改善：_______% ]
- CLS：_______ [改善：_______% ]

Lighthouse 分数：
- Performance：_______ [改善：_______ 分]
- Accessibility：_______ [改善：_______ 分]
- Best Practices：_______ [改善：_______ 分]
- SEO：_______ [改善：_______ 分]
```

## 🚨 注意事项

### 实施前
- [ ] 创建新分支 `optimize/build-strategy`
- [ ] 备份当前构建配置
- [ ] 记录当前性能基准

### 实施中
- [ ] 每次修改后运行测试
- [ ] 确保功能正常工作
- [ ] 检查是否有破坏性变更

### 实施后
- [ ] 运行完整测试套件
- [ ] 进行性能对比
- [ ] 更新文档
- [ ] 团队代码审查

## 📝 问题记录

### 遇到的问题
```
问题 1：
描述：
解决方案：
日期：

问题 2：
描述：
解决方案：
日期：
```

### 待解决的问题
```
问题 1：
描述：
优先级：
预计解决时间：

问题 2：
描述：
优先级：
预计解决时间：
```

## 🎯 里程碑

- [ ] **里程碑 1：构建配置优化** ✅ 已完成
  - 完成日期：2025-01-10
  - 负责人：开发团队

- [ ] **里程碑 2：组件懒加载**
  - 预计完成：____/____/____
  - 负责人：__________

- [ ] **里程碑 3：资源预加载**
  - 预计完成：____/____/____
  - 负责人：__________

- [ ] **里程碑 4：服务端配置**
  - 预计完成：____/____/____
  - 负责人：__________

- [ ] **里程碑 5：性能监控**
  - 预计完成：____/____/____
  - 负责人：__________

---

**使用说明：**
1. 每完成一项，在对应的 `[ ]` 中打勾 `[x]`
2. 定期更新性能指标
3. 记录遇到的问题和解决方案
4. 保持文档更新

**最后更新：** 2025-01-10
