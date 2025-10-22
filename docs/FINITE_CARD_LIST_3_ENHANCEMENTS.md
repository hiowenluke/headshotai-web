# FiniteCardList3 组件增强

## 📋 新增功能

为 FiniteCardList3 组件添加了5个新的配置参数，使其更加灵活和通用。

## 🎯 新增参数

### 1. aspectRatio (宽高比)
```typescript
aspectRatio?: number; // 默认 1 (正方形)
```

**用途**：控制卡片的宽高比
- `1` = 正方形 (1:1)
- `0.8` = 4:5 (竖向)
- `1.25` = 5:4 (横向)

**示例**：
```vue
<FiniteCardList3 :aspect-ratio="0.8" /> <!-- 4:5 竖向卡片 -->
```

### 2. showAddButton (显示加号按钮)
```typescript
showAddButton?: boolean; // 默认 false
```

**用途**：在第一个位置显示 "+" 按钮，用于触发上传
- 点击触发 `@add` 事件

**示例**：
```vue
<FiniteCardList3 
  :show-add-button="true" 
  @add="handleUpload" 
/>
```

### 3. showName (显示卡片名称)
```typescript
showName?: boolean; // 默认 false
```

**用途**：在卡片底部显示图片名称
- 使用 `item.displayName` 字段
- 黑色半透明背景
- 文字超长时省略

**示例**：
```vue
<FiniteCardList3 :show-name="true" />
```

### 4. selectable (可选中)
```typescript
selectable?: boolean; // 默认 false
```

**用途**：允许点击卡片进行选中/取消选中
- 选中时显示蓝色边框
- 右上角显示 checkmark
- 点击触发 `@toggle` 事件

**示例**：
```vue
<FiniteCardList3 
  :selectable="true"
  :selected-urls="selectedUrls"
  @toggle="handleToggle"
/>
```

### 5. cornerLabel (角标配置)
```typescript
cornerLabel?: boolean; // 是否显示角标，默认 false
cornerLabelPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; // 位置
cornerLabelFormatter?: (item: CardItem) => string; // 格式化函数
```

**用途**：在卡片的指定角落显示信息
- 支持4个位置
- 通过格式化函数自定义显示内容
- 黑色半透明背景

**示例**：
```vue
<FiniteCardList3 
  :corner-label="true"
  corner-label-position="bottom-right"
  :corner-label-formatter="formatLabel"
/>

<script>
const formatLabel = (item) => {
  const days = calculateDays(item.createdAt);
  return `${days}d`;
};
</script>
```

## 🚀 FaceUploadedPage 使用示例

```vue
<template>
  <FiniteCardList3
    :items="faces"
    :selected-urls="Array.from(selectedUrlSet)"
    :aspect-ratio="1"
    :selectable="true"
    :show-add-button="true"
    :corner-label="true"
    corner-label-position="bottom-right"
    :corner-label-formatter="formatExpiryLabel"
    instance-key="face-uploaded"
    @add="triggerUpload"
    @toggle="toggleSelected"
  />
</template>

<script setup lang="ts">
const faces = computed(() => {
  return rawFaces.value.map((item) => ({
    url: item.url,
    displayName: new Date(item.createdAt).toLocaleDateString(),
    createdAt: item.createdAt
  }));
});

const formatExpiryLabel = (item: any) => {
  const created = item.createdAt;
  const expiryMs = created + 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const diffDays = Math.max(Math.ceil((expiryMs - now) / (24 * 60 * 60 * 1000)), 0);
  return `${diffDays}d`;
};
</script>
```

## 📊 参数组合示例

### 示例 1：简单图片列表
```vue
<FiniteCardList3 
  :items="images"
  :aspect-ratio="1"
/>
```

### 示例 2：可选择的图片库
```vue
<FiniteCardList3 
  :items="images"
  :aspect-ratio="0.8"
  :selectable="true"
  :selected-urls="selected"
  @toggle="handleToggle"
/>
```

### 示例 3：带上传的管理页面
```vue
<FiniteCardList3 
  :items="images"
  :aspect-ratio="1"
  :selectable="true"
  :show-add-button="true"
  :show-name="true"
  @add="handleUpload"
  @toggle="handleToggle"
/>
```

### 示例 4：完整功能（FaceUploadedPage）
```vue
<FiniteCardList3 
  :items="faces"
  :aspect-ratio="1"
  :selectable="true"
  :show-add-button="true"
  :corner-label="true"
  corner-label-position="bottom-right"
  :corner-label-formatter="formatExpiryLabel"
  @add="triggerUpload"
  @toggle="toggleSelected"
/>
```

## 🎨 样式说明

### 卡片结构
```html
<article class="card">
  <div class="card-image">
    <img />
    <span class="checkmark">✓</span>
    <span class="corner-label bottom-right">30d</span>
  </div>
  <div class="card-name">Image Name</div>
</article>
```

### 宽高比控制
```css
.card {
  aspect-ratio: var(--aspect-ratio); /* 通过 :style 动态设置 */
}
```

### 角标位置
```css
.corner-label.top-left { top: 10px; left: 10px; }
.corner-label.top-right { top: 10px; right: 10px; }
.corner-label.bottom-left { bottom: 10px; left: 10px; }
.corner-label.bottom-right { bottom: 10px; right: 10px; }
```

## ✨ 特性总结

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| aspectRatio | number | 1 | 卡片宽高比 |
| showAddButton | boolean | false | 显示加号按钮 |
| showName | boolean | false | 显示卡片名称 |
| selectable | boolean | false | 可选中 |
| cornerLabel | boolean | false | 显示角标 |
| cornerLabelPosition | string | 'bottom-right' | 角标位置 |
| cornerLabelFormatter | function | - | 角标格式化 |

## 🔄 向后兼容

所有新参数都有默认值，不会影响现有使用：

```vue
<!-- 旧代码仍然正常工作 -->
<FiniteCardList3 :items="items" />
```

## 📝 类型定义

```typescript
export interface CardItem {
  url: string;
  displayName?: string;
  [key: string]: any; // 支持自定义字段
}

interface Props {
  items: CardItem[];
  selectedUrls?: string[];
  aspectRatio?: number;
  selectable?: boolean;
  showAddButton?: boolean;
  showName?: boolean;
  cornerLabel?: boolean;
  cornerLabelPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  cornerLabelFormatter?: (item: CardItem) => string;
  // ... 其他参数
}
```

## 🎯 未来扩展

可以继续添加的功能：
1. 支持更多列数（目前固定3列）
2. 支持拖拽排序
3. 支持批量操作
4. 支持卡片动画效果
