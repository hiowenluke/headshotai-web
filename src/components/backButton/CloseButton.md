# CloseButton 组件文档

## 概述

CloseButton 是关闭按钮组件，显示 X 图标。用于 X 模式模态框的关闭操作（禁用滑动关闭时使用）。

## 文件位置

- 组件：`src/components/backButton/CloseButton.vue`
- 基础组件：`src/components/backButton/BaseButton.vue`

## 核心功能

### 1. 关闭操作

- 显示 X 图标
- 点击触发关闭事件

### 2. 自定义样式

- 圆形按钮
- 深色背景
- 阴影效果
- 悬停和激活状态

## Props

无自定义 props，所有配置通过 BaseButton 处理。

## Events

```typescript
{
  click: [];                          // 点击事件
}
```

## 使用示例

### 基础用法

```vue
<CloseButton @click="handleClose" />

<script setup>
const handleClose = () => {
  console.log('关闭');
};
</script>
```

### 在 ModalHeader 中使用（X 模式）

```vue
<ModalHeader>
  <template #back-button>
    <CloseButton v-if="isXMode" @click="closeModal" />
    <DownButton v-else @click="closeModal" />
  </template>
</ModalHeader>
```

## 特殊逻辑

### 1. 图标配置

```vue
<BaseButton 
  icon="close-outline"
  button-class="close-button"
  @click="handleClick"
/>
```

- 使用 Ionicons 的 `close-outline` 图标
- 应用 `close-button` 样式类

### 2. 点击事件处理

```typescript
const handleClick = () => {
  emit('click');
};
```

- 简单的事件传递
- 不需要阻止冒泡（由包装器处理）

### 3. 包装器

```vue
<div class="close-button-wrapper">
  <BaseButton ... />
</div>
```

- 使用包装器管理 z-index
- 确保按钮在最上层

## 样式特性

### 1. 包装器样式

```css
.close-button-wrapper {
  z-index: 99999; 
  position: relative;
}
```

- 极高的 z-index 确保在最上层
- 相对定位

### 2. 按钮样式

```css
.close-button {
  border-radius: 50% !important;
  background: #343739 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.10) !important;
  transition: background-color 0.2s, box-shadow 0.2s;
  width: 33px !important;
  height: 33px !important;
  min-width: 33px !important;
  min-height: 33px !important;
  margin: 5px 0 0 8px !important;
}
```

- 圆形按钮（50% border-radius）
- 深色背景（#343739）
- 轻微阴影
- 固定尺寸 33x33px
- 左上边距

### 3. 悬停状态

```css
.close-button:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16) !important;
}
```

- 半透明白色背景
- 增强阴影效果

### 4. 激活状态

```css
.close-button:active {
  background: rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18) !important;
}
```

- 更亮的半透明背景
- 恢复轻微阴影

## 注意事项

### 1. 使用场景

- 用于 X 模式模态框（禁用滑动关闭）
- 表示明确的关闭操作
- 与 DownButton、ReturnButton 区分使用

### 2. X 模式

- X 模式下禁用滑动关闭手势
- 只能通过点击按钮关闭
- 适用于需要强制用户操作的场景

### 3. z-index

- 使用极高的 z-index（99999）
- 确保按钮始终可点击
- 不被其他元素遮挡

### 4. 样式优先级

- 使用 `!important` 确保样式生效
- 覆盖 BaseButton 的默认样式
- 与 DownButton 样式保持一致

### 5. 图标语义

- X 图标表示关闭/取消
- 符合用户习惯
- 与向下箭头区分

## 相关组件

- `BaseButton` - 基础按钮组件
- `ReturnButton` - 返回按钮组件
- `DownButton` - 向下按钮组件
- `ModalHeader` - 模态框头部组件
- `PageLikeModal` - 模态框组件（X 模式）

## 更新日志

- 基于 BaseButton 实现
- 使用 X 图标
- 自定义圆形按钮样式
- 悬停和激活状态
- 用于 X 模式模态框
