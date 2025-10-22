# useTabManagement Composable 文档

## 概述

useTabManagement 是 Tab 管理组合式函数，处理 Tab 切换、持久化和状态管理。

## 文件位置

- Composable：`src/components/pageLike/composables/useTabManagement.ts`

## 核心功能

### 1. Tab 状态管理

- 当前 Tab 跟踪
- 已访问 Tab 记录
- Tab 列表管理

### 2. Tab 持久化

- localStorage 存储
- 自动恢复上次选择
- 重置标志支持

### 3. 标题类型计算

- 自动检测标题类型
- 支持图标/文本/简单三种模式

## 参数

```typescript
function useTabManagement(
  props: any,                         // 组件 props
  emit: any                           // 组件 emit 函数
)
```

## 返回值

```typescript
{
  // 状态
  internalTab: Ref<string>;           // 内部 Tab 状态
  visitedTabs: Ref<Set<string>>;      // 已访问的 Tab 集合
  
  // 计算属性
  tabs: ComputedRef<TabItem[]>;       // Tab 列表
  currentTab: ComputedRef<string>;    // 当前 Tab
  finalTitle: ComputedRef<string>;    // 最终标题
  computedTitleType: ComputedRef<string>; // 计算的标题类型
  TextTabsTitleValue: WritableComputedRef<string>; // 双向绑定值
  
  // 方法
  initFirstTab: () => void;           // 初始化第一个 Tab
  switchTab: (key: string) => void;   // 切换 Tab
}
```

## 使用示例

```typescript
import { useTabManagement } from './composables/useTabManagement';

const props = defineProps<{
  tabs?: TabItem[];
  modelValue?: string;
  modalType?: string;
  enableTabPersistence?: boolean;
  titleType?: 'icon-tabs' | 'text-tabs' | 'simple' | 'auto';
}>();

const emit = defineEmits<{
  'update:modelValue': [string];
}>();

const tabManagement = useTabManagement(props, emit);

const {
  tabs,
  currentTab,
  finalTitle,
  computedTitleType,
  switchTab,
  initFirstTab
} = tabManagement;

// 初始化
onMounted(() => {
  if (props.isOpen) {
    initFirstTab();
  }
});
```

## 特殊逻辑

### 1. 标题类型自动检测

```typescript
const computedTitleType = computed(() => {
    if (props.titleType && props.titleType !== 'auto') {
      return props.titleType;
    }
    
    if (!props.tabs || props.tabs.length === 0) {
      return 'simple';
    }
    
    const hasIconTabs = props.tabs.some((t: TabItem) => !!t.icon);
    return hasIconTabs ? 'icon-tabs' : 'text-tabs';
});
```

- 优先使用指定的 titleType
- 无 Tab 时使用 simple
- 有图标时使用 icon-tabs
- 否则使用 text-tabs

### 2. Tab 持久化

```typescript
if (props.enableTabPersistence && props.modalType) {
    try {
      const storageKey = `modal_tab_state_${props.modalType}`;
      localStorage.setItem(storageKey, value);
    } catch (error) {
      console.warn(`[${props.modalType}] Failed to save tab state:`, error);
    }
}
```

- 使用 modalType 作为存储键
- 自动保存和恢复
- 错误处理避免崩溃

### 3. 重置标志

```typescript
let shouldResetTo1P = false;
if (props.modalType === 'GeneratorModal') {
    try {
      const resetFlag = localStorage.getItem('generator_reset_to_1p');
      if (resetFlag === '1') {
        shouldResetTo1P = true;
        localStorage.removeItem('generator_reset_to_1p');
      }
    } catch (error) {
      console.warn(`[${props.modalType}] Failed to check reset flag:`, error);
    }
}
```

- 支持重置到特定 Tab
- 用于特殊场景（如生成器重置）
- 使用后自动清除标志

### 4. Tab 切换事件

```typescript
window.dispatchEvent(new CustomEvent('tab-changed', {
    detail: {
      modalType: props.modalType,
      activeTab: key
    }
}));
```

- 触发全局事件
- 其他组件可监听
- 用于跨组件通信

### 5. 双向绑定

```typescript
const TextTabsTitleValue = computed({
    get: () => currentTab.value,
    set: (value) => {
      internalTab.value = value;
      visitedTabs.value.add(value);
      emit('update:modelValue', value);
      // 持久化...
    }
});
```

- 为 TextTabsTitle 提供 v-model 支持
- 自动处理持久化
- 记录已访问 Tab

## 注意事项

### 1. 持久化配置

- 需要同时设置 `enableTabPersistence` 和 `modalType`
- modalType 用作存储键
- 确保 modalType 唯一

### 2. 初始化时机

- 在模态框打开时调用 `initFirstTab()`
- 确保 Tab 列表已加载
- 避免重复初始化

### 3. 已访问 Tab

- 使用 Set 存储
- 用于优化渲染
- 可用于统计分析

### 4. 错误处理

- localStorage 可能不可用
- 使用 try-catch 包裹
- 降级到默认行为

## 相关 Composables

- `useModalState` - 状态管理
- `useModalGestures` - 手势管理

## 更新日志

- Tab 状态管理
- 持久化支持
- 自动标题类型检测
- 重置标志支持
- 全局事件通知
