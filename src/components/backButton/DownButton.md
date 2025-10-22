# DownButton 组件文档

## 概述

DownButton 是向下按钮组件，显示向下箭头图标。用于垂直模式模态框的关闭操作。提供额外的触摸事件处理以提升移动端体验。

## 文件位置

- 组件：`src/components/backButton/DownButton.vue`
- 基础组件：`src/components/backButton/BaseButton.vue`

## 核心功能

### 1. 关闭操作

- 显示向下箭头图标
- 点击触发关闭事件

### 2. 触摸事件处理

- 处理 touchend 事件
- 阻止事件冒泡和默认行为

### 3. 自定义样式

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
<DownButton @click="handleClose" />

<script setup>
const handleClose = () => {
  console.log('关闭');
};
</script>
```

### 在 ModalHeader 中使用

```vue
<ModalHeader>
  <template #back-button>
    <DownButton @click="closeModal" />
  </template>
</ModalHeader>
```

## 特殊逻辑

### 1. 图标配置

```vue
<BaseButton 
  icon="chevron-down-outline"
  button-class="down-button"
  @click="handleClick"
/>
```

- 使用 Ionicons 的 `chevron-down-outline` 图标
- 应用 `down-button` 样式类

### 2. 点击事件处理

```typescript
const handleClick = (event?: Event) => {
  event?.stopPropagation();
  emit('click');
};
```

- 阻止事件冒泡
- 避免触发父元素的点击事件

### 3. 触摸事件处理

```typescript
const handleTouchEnd = (event: TouchEvent) => {
  event.preventDefault();
  event.stopPropagation();
  emit('click');
};
```

- 处理移动端触摸结束事件
- 阻止默认行为（如滚动）
- 阻止事件冒泡
- 提升移动端响应速度

### 4. 包装器

```vue
<div class="down-button-wrapper" @click="handleClick" @touchend="handleTouchEnd">
  <BaseButton ... />
</div>
```

- 使用包装器处理事件
- 确保高 z-index（99999）
- 防止被其他元素遮挡

## 样式特性

### 1. 包装器样式

```css
.down-button-wrapper {
  z-index: 99999; 
  position: relative;
}
```

- 极高的 z-index 确保在最上层
- 相对定位

### 2. 按钮样式

```css
.down-button {
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
.down-button:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16) !important;
}
```

- 半透明白色背景
- 增强阴影效果

### 4. 激活状态

```css
.down-button:active {
  background: rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18) !important;
}
```

- 更亮的半透明背景
- 恢复轻微阴影

## 注意事项

### 1. 使用场景

- 用于垂直模式（V 模式）模态框
- 表示向下滑动关闭
- 与 ReturnButton、CloseButton 区分使用

### 2. 事件处理

- 同时处理 click 和 touchend 事件
- 确保移动端和桌面端都能正常工作
- 阻止事件冒泡避免误触

### 3. z-index

- 使用极高的 z-index（99999）
- 确保按钮始终可点击
- 不被其他元素遮挡

### 4. 样式优先级

- 使用 `!important` 确保样式生效
- 覆盖 BaseButton 的默认样式

## 相关组件

- `BaseButton` - 基础按钮组件
- `ReturnButton` - 返回按钮组件
- `CloseButton` - 关闭按钮组件
- `ModalHeader` - 模态框头部组件

## 更新日志

- 基于 BaseButton 实现
- 使用向下箭头图标
- 触摸事件优化
- 自定义圆形按钮样式
- 悬停和激活状态
