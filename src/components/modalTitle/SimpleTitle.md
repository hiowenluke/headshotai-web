# SimpleTitle 组件文档

## 概述

SimpleTitle 是简单标题组件，显示单行文本标题。提供最基础的标题显示功能。

## 文件位置

- 组件：`src/components/modalTitle/SimpleTitle.vue`

## 核心功能

### 1. 标题显示

- 显示单行文本
- 居中对齐
- 简洁样式

## Props

```typescript
interface Props {
  title?: string;                     // 标题文本（可选）
}
```

## 使用示例

### 基础用法

```vue
<SimpleTitle title="页面标题" />
```

### 动态标题

```vue
<SimpleTitle :title="pageTitle" />

<script setup>
const pageTitle = ref('动态标题');
</script>
```

### 无标题

```vue
<SimpleTitle />
<!-- 不显示任何内容 -->
```

## 样式特性

### 1. 标题样式

```css
.simple-title {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    text-align: center;
}
```

- 18px 字号
- 600 字重
- 白色文字
- 居中对齐

## 注意事项

### 1. 标题长度

- 没有长度限制
- 过长的标题可能换行
- 建议保持简短

### 2. 空标题

- 传入空字符串或不传 title 时不显示内容
- 组件仍会渲染 div 元素

## 相关组件

- `IconTabsTitle` - 图标 Tab 标题组件
- `TextTabsTitle` - 文本 Tab 标题组件
- `ModalHeader` - 模态框头部组件
- `PageLikeModal` - 模态框组件

## 更新日志

- 简洁的单行标题显示
- 居中对齐样式
