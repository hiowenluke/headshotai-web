# IconTabsTitle 组件文档

## 概述

IconTabsTitle 是图标 Tab 标题组件，显示标题文本和图标 Tab 列表。提供简洁的图标导航界面。

## 文件位置

- 组件：`src/components/modalTitle/IconTabsTitle.vue`

## 核心功能

### 1. 标题显示

- 可选的标题文本
- 居中对齐

### 2. 图标 Tab

- 显示图标列表
- Tab 选择和高亮
- 点击切换

## Props

```typescript
interface Props {
  title?: string;                     // 标题文本（可选）
  tabs: TabItem[];                    // Tab 配置数组（必需）
  currentTab?: string;                // 当前选中的 Tab
}

interface TabItem {
  key: string;                        // Tab 唯一标识
  icon?: string;                      // Tab 图标
  label?: string;                     // Tab 标签（未使用）
}
```

## Events

```typescript
{
  tabChange: [string];                // Tab 切换事件，参数为新 Tab 的 key
}
```

## 使用示例

### 基础用法

```vue
<IconTabsTitle
  title="选择模式"
  :tabs="tabs"
  :current-tab="currentTab"
  @tab-change="handleTabChange"
/>

<script setup>
import { personOutline, businessOutline } from 'ionicons/icons';

const tabs = [
  { key: 'personal', icon: personOutline },
  { key: 'business', icon: businessOutline }
];
const currentTab = ref('personal');

const handleTabChange = (key: string) => {
  currentTab.value = key;
};
</script>
```

### 无标题

```vue
<IconTabsTitle
  :tabs="tabs"
  :current-tab="currentTab"
  @tab-change="handleTabChange"
/>
```

## 特殊逻辑

### 1. 活跃状态

```vue
<div :class="['tab-item', { active: currentTab === tab.key }]">
```

- 根据 `currentTab` 判断是否活跃
- 活跃 Tab 显示高亮背景

### 2. 图标显示

```vue
<ion-icon v-if="tab.icon" :icon="tab.icon" />
```

- 只在有图标时显示
- 使用 Ionicons 图标

## 样式特性

### 1. 布局

```css
.icon-tabs-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}
```

- 垂直布局
- 标题和 Tab 列表居中对齐
- 8px 间距

### 2. 标题样式

```css
.title-text {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
}
```

- 18px 字号
- 600 字重
- 白色文字
- 不换行

### 3. Tab 项样式

```css
.tab-item {
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 20px;
    transition: all 0.2s ease;
}

.tab-item.active {
    background: var(--ion-color-primary);
    color: white;
}
```

- 圆角按钮样式
- 活跃状态显示主题色背景
- 平滑过渡动画

### 4. 图标样式

```css
.tab-item ion-icon {
    font-size: 20px;
}
```

- 20px 图标大小

## 注意事项

### 1. 图标选择

- 使用 Ionicons 图标库
- 图标应简洁明了
- 保持图标风格一致

### 2. Tab 数量

- 建议不超过 5 个
- 过多 Tab 会影响布局

### 3. 标题长度

- 标题应简短
- 使用 `white-space: nowrap` 防止换行

## 相关组件

- `TextTabsTitle` - 文本 Tab 标题组件
- `SimpleTitle` - 简单标题组件
- `ModalHeader` - 模态框头部组件
- `PageLikeModal` - 模态框组件

## 更新日志

- 支持标题和图标 Tab 显示
- 简洁的图标导航界面
- 活跃状态高亮
