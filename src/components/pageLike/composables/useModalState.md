# useModalState Composable 文档

## 概述

useModalState 是模态框状态管理组合式函数，处理模态框的基础状态、层级管理和生命周期。

## 文件位置

- Composable：`src/components/pageLike/composables/useModalState.ts`
- 依赖：`src/utils/zIndexManager.ts`

## 核心功能

### 1. 状态管理

- 模态框唯一 ID 生成
- 关闭状态防重复
- 滑动进度跟踪
- 手势状态管理

### 2. 层级管理

- 自动计算 z-index
- 多层级支持
- 模态框堆栈管理

### 3. 生命周期

- 打开/关闭监听
- 堆栈注册/注销
- 资源清理

## 参数

```typescript
function useModalState(
  props: any,                         // 组件 props
  emit: any                           // 组件 emit 函数
)
```

## 返回值

```typescript
{
  // 状态
  modalId: Ref<string>;               // 模态框唯一 ID
  isClosing: Ref<boolean>;            // 是否正在关闭
  swipeProgress: Ref<number>;         // 滑动进度 (0-无限)
  isSwipeInProgress: Ref<boolean>;    // 是否正在滑动
  isGestureDisabled: Ref<boolean>;    // 手势是否禁用
  isExiting: Ref<boolean>;            // 是否正在退出
  
  // 计算属性
  modalZIndex: ComputedRef<number>;   // 模态框 z-index
  modalContentZIndex: ComputedRef<number>; // 内容 z-index
  modalBackdropZIndex: ComputedRef<number>; // 背景 z-index
  headerZIndex: ComputedRef<number>;  // Header z-index
  toolbarZIndex: ComputedRef<number>; // 工具栏 z-index
  buttonZIndex: ComputedRef<number>;  // 按钮 z-index
  modalClass: ComputedRef<string>;    // 模态框 CSS 类
  
  // 方法
  emitClose: () => void;              // 关闭模态框
  setSwipeProgress: (progress: number) => void; // 设置滑动进度
  setSwipeInProgress: (inProgress: boolean) => void; // 设置滑动状态
  setGestureDisabled: (disabled: boolean) => void; // 设置手势禁用
  setExiting: (exiting: boolean) => void; // 设置退出状态
}
```

## 使用示例

### 基础用法

```typescript
import { useModalState } from './composables/useModalState';

const props = defineProps<{
  isOpen: boolean;
  disableContentScroll?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const modalState = useModalState(props, emit);

// 使用状态
const {
  modalId,
  swipeProgress,
  modalZIndex,
  modalClass,
  emitClose
} = modalState;
```

### 在模板中使用

```vue
<ion-modal
  :is-open="isOpen"
  :class="['page-like-modal', modalClass]"
  :style="{
    '--modal-z-index': modalZIndex,
    '--swipe-progress': swipeProgress
  }"
  @didDismiss="emitClose"
>
  <!-- 模态框内容 -->
</ion-modal>
```

## 特殊逻辑

### 1. 唯一 ID 生成

```typescript
const modalId = ref(`modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
```

- 使用时间戳和随机字符串
- 确保每个模态框有唯一标识
- 用于堆栈管理和层级计算

### 2. 防重复关闭

```typescript
function emitClose() {
    if (isClosing.value) return;
    
    isClosing.value = true;
    
    try {
      emit('close');
    } catch (error) {
      console.error('[PageLikeModal] Error emitting close:', error);
    }
    
    setTimeout(() => {
      isClosing.value = false;
    }, 300);
}
```

- 使用 `isClosing` 标志防止重复关闭
- 300ms 后重置状态
- 错误处理确保状态正确

### 3. 层级计算

```typescript
const modalZIndex = computed(() => getModalElementZIndex(modalId.value, 'MODAL_BASE'));
const modalContentZIndex = computed(() => modalZIndex.value + 1);
const modalBackdropZIndex = computed(() => modalZIndex.value - 1);
const headerZIndex = computed(() => modalZIndex.value + 10);
const toolbarZIndex = computed(() => modalZIndex.value + 11);
const buttonZIndex = computed(() => modalZIndex.value + 12);
```

- 基于 `modalId` 计算基础 z-index
- 各元素相对基础 z-index 偏移
- 确保层级关系正确

### 4. CSS 类计算

```typescript
const modalClass = computed(() => {
    const classes = [];
    if (props.isOpen) classes.push('modal-active');
    if (props.disableContentScroll) classes.push('disable-content-scroll');
    if (isSwipeInProgress.value) classes.push('swiping');
    if (isExiting.value) classes.push('exiting');
    return classes.join(' ');
});
```

- 根据状态动态添加 CSS 类
- 用于样式控制和动画

### 5. 堆栈管理

```typescript
watch(() => props.isOpen, (v) => {
    if (v) {
      modalStackManager.pushModal(modalId.value);
      isClosing.value = false;
    } else {
      modalStackManager.popModal(modalId.value);
      isClosing.value = false;
    }
});

onMounted(() => {
    if (props.isOpen) {
      modalStackManager.pushModal(modalId.value);
    }
});

onUnmounted(() => {
    modalStackManager.popModal(modalId.value);
});
```

- 打开时推入堆栈
- 关闭时弹出堆栈
- 组件卸载时清理

### 6. 状态设置方法

```typescript
setSwipeProgress: (progress: number) => { swipeProgress.value = progress; },
setSwipeInProgress: (inProgress: boolean) => { isSwipeInProgress.value = inProgress; },
setGestureDisabled: (disabled: boolean) => { isGestureDisabled.value = disabled; },
setExiting: (exiting: boolean) => { isExiting.value = exiting; }
```

- 提供统一的状态设置接口
- 便于其他 composables 调用

## 注意事项

### 1. 唯一 ID

- 每个模态框实例都有唯一 ID
- 不要手动修改 `modalId`
- 用于堆栈管理和层级计算

### 2. 关闭防抖

- 300ms 防抖时间
- 避免快速点击导致多次关闭
- 确保动画完成

### 3. 层级管理

- 依赖 `zIndexManager` 工具
- 自动处理多层模态框
- 不要手动设置 z-index

### 4. 状态同步

- 监听 `props.isOpen` 变化
- 自动管理堆栈
- 确保状态一致

### 5. 资源清理

- 组件卸载时自动清理
- 从堆栈中移除
- 防止内存泄漏

## 相关工具

- `modalStackManager` - 模态框堆栈管理器
- `getModalElementZIndex` - z-index 计算函数

## 相关 Composables

- `useModalMode` - 模态框模式管理
- `useModalGestures` - 手势管理
- `useModalAnimation` - 动画管理

## 更新日志

- 模态框状态管理
- 层级自动计算
- 堆栈管理
- 防重复关闭
- 生命周期管理
