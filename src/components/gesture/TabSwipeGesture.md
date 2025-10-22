# TabSwipeGesture 组件文档

## 概述

TabSwipeGesture 是 Tab 滑动手势组件，处理 Tab 页面的左右滑动切换功能。提供流畅的 Tab 切换体验，支持手势冲突处理和动画效果。使用通用的 `useSwipeGesture` composable 实现手势识别。

## 文件位置

- 组件：`src/components/gesture/TabSwipeGesture.vue`
- Composable：`src/composables/useSwipeGesture.ts`

## 核心功能

### 1. Tab 滑动切换

- 左滑切换到下一个 Tab
- 右滑切换到上一个 Tab
- 支持循环切换

### 2. 智能手势识别

- 使用 `useSwipeGesture` composable
- 水平滑动检测
- 滑动距离和速度计算
- 阈值判断

### 3. 视觉反馈

- Tab 内容跟随手指移动
- 切换动画效果
- 边界回弹

### 4. 手势冲突处理

- 与模态框滑动的冲突处理
- 与垂直滚动的冲突处理
- 手势方向锁定

## Props

```typescript
interface Props {
  tabs: TabItem[];                    // Tab 配置数组（必需）
  currentTab: string;                 // 当前选中的 Tab（必需）
  enableSwipe?: boolean;              // 是否启用滑动切换，默认 true
  swipeThreshold?: number;            // 滑动切换阈值 (px)，默认 12
  swipeMaxTime?: number;              // 切换滑动的最大时间 (ms)，默认 600
  gestureDisabled?: boolean;          // 是否禁用手势，由父组件控制
}

interface TabItem {
  key: string;                        // Tab 唯一标识
  title: string;                      // Tab 标题
  icon?: string;                      // Tab 图标
}
```

## Events

```typescript
{
  tabChange: [string];                // Tab 切换事件，参数为新 Tab 的 key
  swipeStart: [];                     // 滑动开始事件
  swipeMove: [number];                // 滑动进度事件，参数为偏移量
  swipeEnd: [];                       // 滑动结束事件
}
```

## Slots

```typescript
{
  [tabKey: string]: {                 // 各个 Tab 的内容插槽
    tab: TabItem;                     // Tab 配置对象
    index: number;                    // Tab 索引
  };
}
```

## 使用示例

### 基础用法

```vue
<TabSwipeGesture
  :tabs="tabs"
  :current-tab="currentTab"
  :enable-swipe="true"
  @tab-change="handleTabChange"
>
  <template #tab1="{ tab, index }">
    <div>Tab 1 内容</div>
  </template>
  <template #tab2="{ tab, index }">
    <div>Tab 2 内容</div>
  </template>
</TabSwipeGesture>

<script setup>
const tabs = [
  { key: 'tab1', title: 'Tab 1' },
  { key: 'tab2', title: 'Tab 2' }
];
const currentTab = ref('tab1');

const handleTabChange = (key: string) => {
  currentTab.value = key;
};
</script>
```

### 自定义配置

```vue
<TabSwipeGesture
  :tabs="tabs"
  :current-tab="currentTab"
  :enable-swipe="true"
  :swipe-threshold="20"
  :swipe-max-time="500"
  @tab-change="handleTabChange"
>
  <!-- Tab 内容 -->
</TabSwipeGesture>
```

### 禁用滑动

```vue
<TabSwipeGesture
  :tabs="tabs"
  :current-tab="currentTab"
  :enable-swipe="false"
  @tab-change="handleTabChange"
>
  <!-- 只能通过点击标题切换 -->
</TabSwipeGesture>
```

### 禁用手势（临时）

```vue
<TabSwipeGesture
  :tabs="tabs"
  :current-tab="currentTab"
  :gesture-disabled="isModalSwiping"
  @tab-change="handleTabChange"
>
  <!-- 当模态框正在滑动时，禁用 Tab 滑动 -->
</TabSwipeGesture>
```

## 特殊逻辑

### 1. Tab 索引管理

```typescript
const currentTabIndex = computed(() => 
  props.tabs.findIndex(t => t.key === props.currentTab)
);

// 本地追踪的活动索引，避免快速滑动时等待外部状态同步
const activeTabIndex = ref(currentTabIndex.value >= 0 ? currentTabIndex.value : 0);

watch(currentTabIndex, (idx) => {
    activeTabIndex.value = idx >= 0 ? idx : 0;
});
```

- 根据当前 Tab key 计算索引
- 使用本地 `activeTabIndex` 避免状态同步延迟
- 监听外部状态变化同步本地索引

### 2. 使用 useSwipeGesture

```typescript
const { state: swipeState } = useSwipeGesture(gestureRef, {
    enableSwipe: props.enableSwipe,
    swipeThreshold: props.swipeThreshold,
    swipeMaxTime: props.swipeMaxTime,
    gestureDisabled: props.gestureDisabled,
    directionLockMinDx: 10,
    horizontalDominanceRatio: 1.2
}, {
    onSwipeStart: () => { /* ... */ },
    onSwipeMove: (offset: number) => { /* ... */ },
    onSwipeEnd: () => { /* ... */ },
    onSwipeLeft: () => { /* 切换到下一个 Tab */ },
    onSwipeRight: () => { /* 切换到上一个 Tab */ },
    onSwipeCancel: () => { /* 回弹 */ }
});
```

- 使用通用的滑动手势 composable
- 配置水平方向优先识别
- 处理左右滑动事件

### 3. Tab 切换逻辑

```typescript
onSwipeLeft: () => {
    // 向左滑动，切换到后一个 tab
    const baselineIdx = activeTabIndex.value;
    const newIdx = baselineIdx < props.tabs.length - 1 
        ? baselineIdx + 1 
        : 0; // 循环到第一个
    const newKey = props.tabs[newIdx].key;
    switchTab(newKey);
    return true;
},
onSwipeRight: () => {
    // 向右滑动，切换到前一个 tab
    const baselineIdx = activeTabIndex.value;
    const newIdx = baselineIdx > 0 
        ? baselineIdx - 1 
        : props.tabs.length - 1; // 循环到最后一个
    const newKey = props.tabs[newIdx].key;
    switchTab(newKey);
    return true;
}
```

- 支持循环切换
- 基于本地 `activeTabIndex` 计算新索引
- 调用 `switchTab` 触发切换

### 4. Tab 切换实现

```typescript
const switchTab = (key: string) => {
    if (!props.enableSwipe) {
        emit('tabChange', key);
        return;
    }

    const idx = props.tabs.findIndex(t => t.key === key);
    if (idx >= 0) {
        activeTabIndex.value = idx;
    }

    // 启用滑动动画
    isTabSwitching.value = true;

    emit('tabChange', key);

    // 动画完成后重置状态
    setTimeout(() => {
        isTabSwitching.value = false;
    }, 300);
};
```

- 更新本地索引
- 启用切换动画
- 发送 Tab 切换事件
- 动画完成后重置状态

### 5. 容器样式计算

```typescript
const tabContainerStyle = computed(() => {
    if (!props.enableSwipe || !props.tabs.length) {
        return {};
    }
    
    const translateX = -(activeTabIndex.value * swipeState.value.containerWidth) + 
                     swipeState.value.swipeOffset;
    
    return {
        transform: `translateX(${translateX}px)`,
        transition: isTabSwitching.value ? 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
        width: `${props.tabs.length * swipeState.value.containerWidth}px`,
        display: 'flex',
        height: '100%'
    };
});
```

- 根据当前索引和滑动偏移计算位移
- 切换时启用过渡动画
- 拖动时禁用过渡（跟随手指）

### 6. Tab 面板样式

```typescript
const getTabPanelStyle = (index: number) => {
    if (!props.enableSwipe || !props.tabs.length) {
        // 如果未启用滑动，使用原来的显示/隐藏逻辑
        return {
            display: activeTabIndex.value === index ? 'block' : 'none',
            width: '100%',
            height: '100%'
        };
    }
    
    return {
        width: `${swipeState.value.containerWidth}px`,
        height: '100%',
        flexShrink: 0,
        position: 'relative' as const,
        overflow: 'hidden' as const
    };
};
```

- 启用滑动时：所有 Tab 并排显示，通过 transform 切换
- 禁用滑动时：只显示当前 Tab，其他隐藏

### 7. 外部切换监听

```typescript
watch(() => props.currentTab, () => {
    const idx = props.tabs.findIndex(t => t.key === props.currentTab);
    if (idx >= 0) {
        activeTabIndex.value = idx;
    }
    // 对外部切换也启用滑动动画，以保持一致的视觉反馈
    isTabSwitching.value = true;
    setTimeout(() => {
        isTabSwitching.value = false;
    }, 300);
});
```

- 监听外部 Tab 切换（如点击标题）
- 同步本地索引
- 启用切换动画保持一致性

## 样式特性

### 1. 容器布局

```css
.tab-swipe-gesture {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.tab-container {
    height: 100%;
    will-change: transform;
    position: relative;
}
```

- 隐藏溢出内容
- 使用 `will-change` 优化动画性能

### 2. Tab 面板

```css
.tab-panel {
    height: 100%;
    position: relative;
}
```

- 每个 Tab 占满容器高度
- 相对定位方便子元素布局

## 性能优化

### 1. 使用 will-change

```css
.tab-container {
    will-change: transform;
}
```

- 提示浏览器优化 transform 动画
- 提升滑动流畅度

### 2. 本地状态缓存

```typescript
const activeTabIndex = ref(currentTabIndex.value >= 0 ? currentTabIndex.value : 0);
```

- 避免等待外部状态同步
- 提升快速滑动时的响应速度

### 3. 条件渲染优化

```typescript
if (!props.enableSwipe || !props.tabs.length) {
    return {
        display: activeTabIndex.value === index ? 'block' : 'none'
    };
}
```

- 禁用滑动时使用 display 切换
- 减少不必要的 DOM 渲染

## 注意事项

### 1. Tab 数量

- 支持任意数量的 Tab
- 过多 Tab 可能影响性能
- 建议不超过 10 个

### 2. 手势冲突

- 使用 `gestureDisabled` 临时禁用手势
- 避免与模态框滑动冲突
- 方向锁定机制自动处理垂直滚动冲突

### 3. 状态同步

- 使用受控组件模式
- 父组件管理 `currentTab` 状态
- 通过 `tabChange` 事件通知父组件

### 4. 动画时长

- 默认 300ms 切换动画
- 与 `swipeMaxTime` 配合使用
- 保持动画流畅自然

### 5. 阈值设置

- `swipeThreshold` 默认 12px
- 较低的阈值提升灵敏度
- 根据实际体验调整

## 相关组件

- `PageLikeModal` - 父级模态框组件
- `ModalSwipeGesture` - 模态框滑动手势组件
- `IconTabsTitle` - Tab 标题组件
- `TextTabsTitle` - 文本 Tab 标题组件

## 相关 Composable

- `useSwipeGesture` - 通用滑动手势处理

## 更新日志

- 使用 `useSwipeGesture` composable 统一手势处理
- 支持左右滑动切换 Tab
- 智能手势识别和冲突处理
- 流畅的切换动画和视觉反馈
- 支持循环切换和自定义阈值
- 本地状态缓存提升响应速度
