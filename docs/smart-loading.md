# 智能加载系统

## 概述

智能加载系统根据用户的网络速度自动调整卡片列表的加载策略，提供最佳的用户体验。

## 功能特性

### 网速检测
- 自动检测用户网络速度（基于第一屏图片加载时间）
- 默认阈值：300ms
- 超过阈值：标记为低速网络（如 Slow 4G）
- 低于阈值：标记为高速网络（如 5G 或 WiFi）

### 加载策略

#### 低速网络策略
- 每次加载 3 屏内容（默认 18 张卡片）
- 不自动加载其他菜单项
- 只有当用户切换到相应菜单时才加载

#### 高速网络策略
- 每次加载 10 屏内容（默认 60 张卡片）
- 自动加载其他菜单项的前 10 屏
- 提供更流畅的浏览体验

### 菜单管理
- 智能识别第一个菜单项
- 跟踪已切换的菜单项
- 响应菜单切换事件

## 配置参数

```typescript
interface SmartLoadingConfig {
  cardsPerScreen: 6,              // 每屏卡片数量
  networkSpeedThreshold: 300,     // 网速判断阈值（毫秒）
  
  slowNetwork: {
    screensPerLoad: 3             // 低速网络每次加载屏数
  },
  
  fastNetwork: {
    screensPerLoad: 10,           // 高速网络每次加载屏数
    autoLoadOtherMenus: true      // 是否自动加载其他菜单项
  }
}
```

## 使用方法

### 基本使用
系统会自动工作，无需手动配置。在用户首次访问时：

1. 加载第一个菜单项的第一屏
2. 测量加载时间
3. 根据加载时间确定网络速度
4. 应用相应的加载策略

### 调试功能
在开发模式下，可以使用调试面板：

- 快捷键：`Ctrl + Shift + D`
- 查看网络状态
- 监控加载策略
- 模拟不同网络环境
- 查看事件日志

### 事件系统
系统通过自定义事件进行通信：

```typescript
// 菜单切换事件
window.dispatchEvent(new CustomEvent('menu-switched', {
  detail: { category: 'category-name', isFirst: true }
}));

// 网速检测完成事件
window.addEventListener('network-speed-detected', (event) => {
  const { isSlowNetwork, loadTime, category } = event.detail;
});

// 自动加载其他菜单事件
window.addEventListener('auto-load-other-menus', (event) => {
  const { excludeCategory } = event.detail;
});
```

## 文件结构

```
src/
├── utils/
│   └── smartLoading.ts           # 智能加载核心逻辑
├── components/
│   └── debug/
│       └── SmartLoadingDebug.vue # 调试组件
├── pages/
│   └── homepage/
│       ├── index.vue          # 主页集成
│       └── composables/
│           └── useDataManagement.ts # 数据管理集成
└── App.vue                       # 全局配置初始化
```

## 工作流程

1. **初始化**
   - App.vue 中初始化智能加载配置
   - 从本地存储恢复之前的网速检测结果

2. **首次加载**
   - 用户访问第一个菜单项
   - 开始网速检测
   - 加载第一屏内容

3. **网速检测**
   - 测量第一屏加载时间
   - 根据阈值判断网络速度
   - 保存结果到本地存储

4. **策略应用**
   - 低速网络：保守加载策略
   - 高速网络：积极加载策略 + 自动预加载

5. **后续加载**
   - 根据检测到的网速应用相应策略
   - 菜单切换时触发相应的加载逻辑

## 性能优化

- 本地存储缓存网速检测结果
- 避免重复检测
- 智能预取策略
- 分页加载优化
- 事件驱动的异步加载

## 兼容性

- 支持所有现代浏览器
- 优雅降级处理
- 错误恢复机制
- 网络异常处理

## 扩展性

系统设计为可扩展的，可以轻松添加：
- 新的网速检测算法
- 更多的加载策略
- 自定义配置选项
- 额外的性能指标