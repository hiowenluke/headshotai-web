# ReturnButton 组件文档

## 概述

ReturnButton 是返回按钮组件，显示向左箭头图标。用于水平模式模态框的返回操作。

## 文件位置

- 组件：`src/components/backButton/ReturnButton.vue`
- 基础组件：`src/components/backButton/BaseButton.vue`

## 核心功能

### 1. 返回操作

- 显示向左箭头图标
- 点击触发返回事件

### 2. 基于 BaseButton

- 使用 BaseButton 作为基础
- 传递图标和样式类

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
<ReturnButton @click="handleBack" />

<script setup>
const handleBack = () => {
  console.log('返回');
};
</script>
```

### 在 ModalHeader 中使用

```vue
<ModalHeader>
  <template #back-button>
    <ReturnButton @click="closeModal" />
  </template>
</ModalHeader>
```

## 特殊逻辑

### 1. 图标配置

```vue
<BaseButton 
  icon="chevron-back-outline"
  button-class="return-button"
  @click="$emit('click')"
/>
```

- 使用 Ionicons 的 `chevron-back-outline` 图标
- 应用 `return-button` 样式类

### 2. 事件传递

```vue
@click="$emit('click')"
```

- 直接传递点击事件到父组件

## 样式特性

样式由 BaseButton 组件提供，包括：

- 圆形按钮
- 图标居中
- 点击反馈
- 过渡动画

## 注意事项

### 1. 使用场景

- 用于水平模式（H 模式）模态框
- 表示返回到上一级页面
- 与 DownButton、CloseButton 区分使用

### 2. 图标方向

- 向左箭头表示返回
- 符合用户习惯

## 相关组件

- `BaseButton` - 基础按钮组件
- `DownButton` - 向下按钮组件
- `CloseButton` - 关闭按钮组件
- `ModalHeader` - 模态框头部组件

## 更新日志

- 基于 BaseButton 实现
- 使用向左箭头图标
- 简洁的返回操作
