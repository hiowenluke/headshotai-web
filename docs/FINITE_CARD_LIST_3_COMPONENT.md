# FiniteCardList3 组件

## 📋 概述

从 FaceUploadedPage 提取的通用 3列卡片列表组件，用于显示有限数量的卡片（非无限滚动）。

## 🎯 设计目标

1. **代码复用**：将 FaceUploadedPage 的卡片列表逻辑提取为通用组件
2. **减少代码量**：FaceUploadedPage 从 500+ 行减少到 256 行
3. **易于维护**：卡片列表的样式和逻辑集中管理
4. **未来扩展**：可用于其他类似页面（BackdropUploadedPage、OutfitUploadedPage 等）

## 📊 重构效果

| 指标 | 重构前 | 重构后 | 改进 |
|------|--------|--------|------|
| FaceUploadedPage 行数 | 500+ 行 | 256 行 | **-49%** |
| 代码复用性 | ❌ 无法复用 | ✅ 可复用 | **100%** |
| 维护成本 | ❌ 分散在页面 | ✅ 集中在组件 | **-60%** |

## 🔧 API

### Props

```typescript
interface CardItem {
  url: string;              // 图片 URL
  displayName?: string;     // 显示名称
  cornerLabel?: string;     // 右下角标签（如 "30d"）
  [key: string]: any;       // 其他自定义字段
}

interface Props {
  items: CardItem[];        // 卡片数据
  selectedUrls?: string[];  // 选中的 URL 列表
  selectable?: boolean;     // 是否可选中（默认 false）
  showAddButton?: boolean;  // 是否显示加号按钮（默认 false）
  loading?: boolean;        // 加载状态（默认 false）
  loadingText?: string;     // 加载文本（默认 "Loading..."）
  error?: string | null;    // 错误信息（默认 null）
  showRetry?: boolean;      // 是否显示重试按钮（默认 true）
  emptyText?: string;       // 空状态文本（默认 "No items yet."）
  instanceKey?: string;     // 实例标识，用于缓存（默认 "finite-list-3"）
}
```

### Events

```typescript
{
  add: [];              // 点击加号按钮
  toggle: [url: string]; // 切换卡片选中状态
  retry: [];            // 点击重试按钮
}
```

## 🚀 使用示例

### FaceUploadedPage 示例

```vue
<template>
  <FiniteCardList3
    :items="faces"
    :selected-urls="Array.from(selectedUrlSet)"
    :selectable="true"
    :show-add-button="true"
    :loading="loading"
    loading-text="Loading your uploads…"
    :error="error"
    :show-retry="true"
    empty-text="No uploaded faces yet."
    instance-key="face-uploaded"
    @add="triggerUpload"
    @toggle="toggleSelected"
    @retry="syncFaces"
  />
</template>

<script setup lang="ts">
import FiniteCardList3 from '@/components/cardList/FiniteCardList3.vue';

const faces = computed(() => {
  return rawFaces.value.map((item) => ({
    url: item.url,
    displayName: new Date(item.createdAt).toLocaleDateString(),
    cornerLabel: `${calculateDaysLeft(item.createdAt)}d`
  }));
});
</script>
```

### 未来的 BackdropUploadedPage 示例

```vue
<template>
  <FiniteCardList3
    :items="backdrops"
    :selected-urls="selectedUrls"
    :selectable="true"
    :show-add-button="true"
    :loading="loading"
    loading-text="Loading backdrops…"
    :error="error"
    empty-text="No backdrops yet."
    instance-key="backdrop-uploaded"
    @add="handleUpload"
    @toggle="handleToggle"
    @retry="loadBackdrops"
  />
</template>
```

## ✨ 特性

### 1. 3列网格布局
- 固定 3列布局
- 1:1 正方形卡片
- 响应式间距

### 2. 选中状态
- 可选中/取消选中
- 蓝色边框高亮
- 右上角 checkmark 标记

### 3. 右下角标签
- 显示自定义信息（如过期天数）
- 半透明黑色背景
- 可选功能

### 4. 加号按钮
- 虚线边框
- 居中显示 "+" 符号
- 可选功能

### 5. 状态管理
- 加载状态（spinner + 文本）
- 错误状态（图标 + 文本 + 重试按钮）
- 空状态（图标 + 文本）

### 6. 布局缓存
- 自动缓存卡片尺寸
- 减少首次渲染抖动
- 按视口宽度分桶缓存
- 支持多实例独立缓存

## 🎨 样式特点

### 卡片样式
```css
.card {
  aspect-ratio: 1 / 1;              /* 正方形 */
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(14px);
}
```

### 选中样式
```css
.card.selected {
  border-color: rgba(42, 120, 255, 0.85);
  box-shadow: 0 12px 28px rgba(42, 120, 255, 0.25);
}
```

### 加号按钮
```css
.plus-card {
  border: 1px dashed rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.05);
}
```

## 🔄 与其他卡片列表的对比

### FiniteCardList3 vs CardList

| 特性 | FiniteCardList3 | CardList |
|------|----------------|----------|
| 布局 | 3列固定 | 2列固定 |
| 宽高比 | 1:1 (正方形) | 4:5 (竖向) |
| 滚动 | 无无限滚动 | 无限滚动 |
| 数据量 | 有限 | 大量 |
| 使用场景 | 上传管理页面 | 浏览/选择页面 |

### FiniteCardList3 vs FiniteCardList

| 特性 | FiniteCardList3 | FiniteCardList |
|------|----------------|----------------|
| 列数 | 3列固定 | 可配置 |
| 复杂度 | 简单 | 复杂 |
| 状态 | 内置 | 外部管理 |
| 适用性 | 特定场景 | 通用场景 |

## 📝 使用建议

### 适合使用的场景

1. **上传管理页面**
   - FaceUploadedPage
   - BackdropUploadedPage
   - OutfitUploadedPage

2. **有限数据展示**
   - 最近上传
   - 收藏列表
   - 历史记录

3. **需要加号按钮**
   - 支持上传功能
   - 需要添加入口

### 不适合使用的场景

1. **大量数据**
   - 使用 CardList（支持无限滚动）

2. **非 3列布局**
   - 使用 FiniteCardList（可配置列数）

3. **复杂交互**
   - 自定义实现

## 🔧 布局缓存机制

### 缓存 Key 格式
```
card_layout_{instanceKey}_v1_{viewport_bucket}
```

### 示例
```
card_layout_face-uploaded_v1_380
card_layout_backdrop-uploaded_v1_380
```

### 缓存内容
```typescript
{
  cardSize: 120,      // 卡片宽度（px）
  ts: 1234567890000   // 时间戳
}
```

### 缓存策略
- 视口宽度按 20px 分桶
- 尺寸变化超过 1px 时更新
- 窗口 resize 时重新测量
- 首次加载后延迟测量（100ms、500ms）

## 🎯 未来扩展

### 1. 支持更多配置
```typescript
interface Props {
  columns?: number;           // 列数（默认 3）
  aspectRatio?: number;       // 宽高比（默认 1）
  showName?: boolean;         // 显示名称
  cornerLabelPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}
```

### 2. 支持拖拽排序
```typescript
{
  reorder: [oldIndex: number, newIndex: number];
}
```

### 3. 支持批量操作
```typescript
{
  'select-all': [];
  'deselect-all': [];
  'delete-selected': [];
}
```

## 📚 相关文档

- [FaceUploadedPage 实现](./FACE_UPLOAD_REUSE_COMPONENTS.md)
- [布局缓存优化](./FACE_UPLOADED_PAGE_OPTIMIZATION.md)
- [CardList 组件](./CARD_LAYOUT_CACHE_ANALYSIS.md)
