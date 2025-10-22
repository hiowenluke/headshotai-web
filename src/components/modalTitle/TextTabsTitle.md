# TextTabsTitle 组件文档

## 概述

TextTabsTitle 是文本 Tab 标题组件，支持等分模式和自适应模式两种布局。提供流畅的 Tab 切换动画和 HOT 标签功能。

## 文件位置

- 组件：`src/components/modalTitle/TextTabsTitle.vue`
- 子组件：`src/components/modalTitle/AdaptiveTabsTitle.vue`

## 核心功能

### 1. 双模式布局

- **等分模式**: Tab 数量 < 5 时，按宽度等分
- **自适应模式**: Tab 数量 >= 5 时，动态调整宽度

### 2. 活跃指示器

- 平滑滑动动画
- 跟随活跃 Tab 移动

### 3. HOT 标签

- 显示 HOT 标签
- 点击事件处理

### 4. 响应式宽度

- 自动计算 bar 宽度
- 支持自定义宽度

## Props

```typescript
interface Props {
  tabs: TabItem[];                    // Tab 配置数组（必需）
  modelValue: string;                 // 当前选中的 Tab（必需）
  adaptive?: boolean;                 // 强制启用自适应模式，默认 false
  barWidth?: number;                  // Tab 栏总宽度（像素），默认 0（自动计算）
  activeScale?: number;               // 自适应模式：活跃 Tab 缩放比例，默认 1.3
  groupScale?: number;                // 自适应模式：非活跃 Tab 缩放比例，默认 0.95
  firstGapFactor?: number;            // 自适应模式：首个间距因子，默认 0.72
  lastGapFactor?: number;             // 自适应模式：末尾间距因子，默认 1.1
  hotDismissed?: boolean;             // HOT 标签是否已关闭，默认 false
}

interface TabItem {
  key: string;                        // Tab 唯一标识
  label?: string;                     // Tab 标签文本
  hot?: boolean;                      // 是否显示 HOT 标签
}
```

## Events

```typescript
{
  'update:modelValue': [string];      // Tab 切换事件
  'hot-clicked': [];                  // HOT 标签点击事件
}
```

## 使用示例

### 等分模式（2-4 个 Tab）

```vue
<TextTabsTitle
  v-model="currentTab"
  :tabs="tabs"
  :hot-dismissed="hotDismissed"
  @hot-clicked="handleHotClick"
/>

<script setup>
const tabs = [
  { key: 'tab1', label: 'Tab 1' },
  { key: 'tab2', label: 'Tab 2', hot: true },
  { key: 'tab3', label: 'Tab 3' }
];
const currentTab = ref('tab1');
const hotDismissed = ref(false);

const handleHotClick = () => {
  hotDismissed.value = true;
};
</script>
```

### 自适应模式（5+ 个 Tab）

```vue
<TextTabsTitle
  v-model="currentTab"
  :tabs="tabs"
  :adaptive="true"
  :active-scale="1.3"
  :group-scale="0.95"
/>

<script setup>
const tabs = [
  { key: 'tab1', label: 'Tab 1' },
  { key: 'tab2', label: 'Tab 2' },
  { key: 'tab3', label: 'Tab 3' },
  { key: 'tab4', label: 'Tab 4' },
  { key: 'tab5', label: 'Tab 5' }
];
</script>
```

### 自定义宽度

```vue
<TextTabsTitle
  v-model="currentTab"
  :tabs="tabs"
  :bar-width="300"
/>
```

## 特殊逻辑

### 1. 模式判断

```typescript
const useAdaptive = computed(() => props.adaptive || props.tabs.length >= 5);
```

- Tab 数量 >= 5 时自动启用自适应模式
- 或通过 `adaptive` prop 强制启用

### 2. 自动 bar 宽度

```typescript
const autoBarWidth = computed(() => {
    const n = props.tabs.length;
    const base = containerWidth.value;
    if (!base) return 0;
    if (n === 2) return Math.floor(base * 0.5);  // 50%
    if (n === 3) return Math.floor(base * 0.6);  // 60%
    if (n === 4) return Math.floor(base * 0.7);  // 70%
    return base;                                  // 100%
});
```

- 根据 Tab 数量自动计算宽度
- 2 个 Tab: 50%
- 3 个 Tab: 60%
- 4 个 Tab: 70%
- 5+ 个 Tab: 100%

### 3. 等分宽度计算

```typescript
const equalTabWidthPx = computed(() => {
    const n = Math.max(1, props.tabs.length);
    const total = effectiveBarWidth.value || containerWidth.value;
    const horizontalPadding = 8;
    const per = total > 0 ? Math.floor((total - horizontalPadding) / n) : 0;
    return `${Math.max(40, per)}px`;
});
```

- 减去 padding 后等分
- 最小宽度 40px

### 4. 活跃指示器定位

```typescript
const indicatorStyle = computed(() => {
    const x = activeIndex.value * equalTabWidthNumber.value;
    const w = equalTabWidthNumber.value;
    return {
        width: `${w}px`,
        transform: `translateX(${x}px)`
    };
});
```

- 根据活跃索引计算位移
- 宽度与 Tab 宽度一致

### 5. Tab 选择处理

```typescript
const onSelect = (key: string) => {
    emit('update:modelValue', key);
    const tab = props.tabs.find(t => t.key === key);
    if (tab?.hot && !props.hotDismissed) emit('hot-clicked');
};
```

- 更新选中状态
- 如果点击的是 HOT Tab，触发 HOT 事件

### 6. 容器宽度监听

```typescript
const updateContainerWidth = () => {
    const el = tabsRef.value;
    const target = el?.parentElement || el;
    if (!target) return;
    const w = Math.round(target.getBoundingClientRect().width);
    if (w && Math.abs(w - containerWidth.value) > 1) containerWidth.value = w;
};

onMounted(() => {
    nextTick(() => updateContainerWidth());
    ro = new ResizeObserver(() => updateContainerWidth());
    const target = tabsRef.value?.parentElement || tabsRef.value;
    if (ro && target) ro.observe(target);
});
```

- 使用 ResizeObserver 监听容器宽度变化
- 自动更新布局

## 样式特性

### 1. 容器样式

```css
.equal-tabs {
    display: flex;
    background: #343739;
    padding: 4px;
    border-radius: 40px;
    position: relative;
}
```

- 深色背景
- 圆角容器
- 4px 内边距

### 2. 活跃指示器

```css
.equal-tabs .active-indicator {
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: 4px;
    background: #ffffff;
    border-radius: 32px;
    transition: transform .22s cubic-bezier(0.2, 0.8, 0.2, 1), width .22s ease;
    z-index: 1;
}
```

- 白色背景
- 平滑过渡动画
- 使用 cubic-bezier 缓动函数

### 3. Tab 项样式

```css
.equal-tabs .tab {
    position: relative;
    box-sizing: border-box;
    min-width: 51px;
    padding: 3px 6px !important;
    text-align: center;
    color: #ffffff;
    font-weight: 700;
    font-size: var(--fs-tab, 20px);
    border-radius: 32px;
    cursor: pointer;
    transition: width .2s ease, transform .2s ease;
    white-space: nowrap;
    z-index: 2;
}
```

- 相对定位
- 最小宽度 51px
- 白色文字，700 字重
- 位于指示器之上（z-index: 2）

### 4. 活跃 Tab 样式

```css
.equal-tabs .tab.active {
    background: transparent;
    color: #111315;
}

.equal-tabs .tab.active .tab-label {
    transform: scale(1.05);
}
```

- 透明背景（由指示器提供背景）
- 深色文字
- 文字放大 1.05 倍

## 性能优化

### 1. ResizeObserver

```typescript
ro = new ResizeObserver(() => updateContainerWidth());
```

- 使用 ResizeObserver 而非轮询
- 自动响应容器尺寸变化

### 2. 计算缓存

```typescript
const equalTabWidthNumber = computed(() => {
    // 缓存计算结果
});
```

- 使用 computed 缓存计算结果
- 避免重复计算

### 3. 条件渲染

```typescript
const useAdaptive = computed(() => props.adaptive || props.tabs.length >= 5);
```

- 根据条件选择渲染模式
- 减少不必要的组件实例

## 注意事项

### 1. Tab 数量

- 2-4 个 Tab 使用等分模式
- 5+ 个 Tab 使用自适应模式
- 可通过 `adaptive` prop 强制切换

### 2. 标签文本

- 使用 `label` 或 `key` 作为显示文本
- 文本应简短，避免换行

### 3. HOT 标签

- 点击 HOT Tab 会同时触发 Tab 切换和 HOT 点击事件
- 使用 `hotDismissed` 控制 HOT 标签显示

### 4. 宽度计算

- 自动宽度基于父容器
- 可通过 `barWidth` 自定义
- 确保容器有明确的宽度

### 5. 动画性能

- 使用 transform 而非 left/right
- 使用 will-change 优化（如需要）

## 相关组件

- `AdaptiveTabsTitle` - 自适应 Tab 标题组件
- `HotPill` - HOT 标签组件
- `IconTabsTitle` - 图标 Tab 标题组件
- `SimpleTitle` - 简单标题组件
- `ModalHeader` - 模态框头部组件

## 更新日志

- 支持等分和自适应两种模式
- 流畅的活跃指示器动画
- HOT 标签功能
- 响应式宽度计算
- 优化的移动端样式
