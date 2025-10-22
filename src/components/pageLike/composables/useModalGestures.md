# useModalGestures Composable 文档

## 概述

useModalGestures 是模态框手势管理组合式函数，处理滑动手势、底部区域手势和相关事件。

## 文件位置

- Composable：`src/components/pageLike/composables/useModalGestures.ts`
- 依赖：`src/composables/useSwipeGesture.ts`

## 核心功能

### 1. 模态框滑动手势

- 滑动开始/移动/结束处理
- 滑动退出逻辑
- 手势方向锁定

### 2. Tab 切换手势

- Tab 滑动开始/移动/结束
- 与模态框手势协调

### 3. 底部区域手势

- 底部区域 Tab 切换
- 按钮区域 Tab 切换
- 独立的手势配置

### 4. 全局事件

- 模态框关闭事件
- 跨组件通信

## 参数

```typescript
function useModalGestures(
  props: any,                         // 组件 props
  modalState: any,                    // useModalState 返回值
  tabManagement: any                  // useTabManagement 返回值
)
```

## 返回值

```typescript
{
  // 常量
  VELOCITY_THRESHOLD: number;         // 速度阈值 0.15
  TAB_SWIPE_THRESHOLD: number;        // Tab 滑动阈值 12px
  TAB_SWIPE_MAX_TIME: number;         // Tab 滑动最大时间 600ms
  
  // 引用
  bottomAreaRef: Ref<HTMLElement | null>; // 底部区域引用
  bottomAreaSwipeDisabled: Ref<boolean>; // 底部区域手势禁用
  bottomButtonAreaRef: Ref<HTMLElement | null>; // 底部按钮区域引用
  
  // 手势处理函数
  handleSwipeStart: () => void;       // 滑动开始
  handleSwipeMove: (progress: number) => void; // 滑动移动
  handleSwipeEnd: () => void;         // 滑动结束
  handleSwipeCancel: () => void;      // 滑动取消
  handleGestureDirectionLocked: (direction: 'vertical' | 'horizontal' | null) => void; // 方向锁定
  handleTabSwipeStart: () => void;    // Tab 滑动开始
  handleTabSwipeMove: (offset: number) => void; // Tab 滑动移动
  handleTabSwipeEnd: () => void;      // Tab 滑动结束
  performSwipeExit: () => void;       // 执行滑动退出
}
```

## 使用示例

```typescript
import { useModalGestures } from './composables/useModalGestures';

const modalState = useModalState(props, emit);
const tabManagement = useTabManagement(props, emit);
const modalGestures = useModalGestures(props, modalState, tabManagement);

const {
  bottomAreaRef,
  handleSwipeStart,
  handleSwipeMove,
  handleSwipeEnd,
  performSwipeExit
} = modalGestures;
```

## 特殊逻辑

### 1. 滑动状态管理

```typescript
function handleSwipeStart() {
    modalState.setSwipeInProgress(true);
    modalState.setSwipeProgress(0);
}

function handleSwipeMove(progress: number) {
    modalState.setSwipeProgress(progress);
}

function handleSwipeEnd() {
    modalState.setSwipeInProgress(false);
    modalState.setSwipeProgress(0);
}
```

- 通过 modalState 更新状态
- 跟踪滑动进度
- 重置状态

### 2. 手势方向锁定

```typescript
function handleGestureDirectionLocked(direction: 'vertical' | 'horizontal' | null) {
    modalState.setGestureDisabled(direction === 'vertical');
}
```

- 垂直方向锁定时禁用 Tab 手势
- 避免手势冲突

### 3. 滑动退出

```typescript
function performSwipeExit() {
    // 通知全局状态
    window.dispatchEvent(new CustomEvent('modal-will-close', {
      detail: {
        type: 'PageLikeModal',
        mode: props.modalStyle,
        timestamp: Date.now()
      }
    }));

    modalState.emitClose();

    // 关闭完成后通知
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('modal-did-close', {
        detail: {
          type: 'PageLikeModal',
          mode: props.modalStyle,
          timestamp: Date.now()
        }
      }));
    }, 300);
}
```

- 触发全局事件
- 调用关闭方法
- 延迟通知关闭完成

### 4. 底部区域手势

```typescript
const bottomSwipe = useSwipeGesture(bottomAreaRef, {
    enableSwipe: true,
    swipeThreshold: 8,
    swipeMaxTime: 700,
    gestureDisabled: bottomAreaSwipeDisabled,
    directionLockMinDx: 10,
    horizontalDominanceRatio: 1.2,
    useCapture: true
}, {
    onSwipeLeft: () => {
      // 切换到下一个 Tab
      const idx = tabManagement.tabs.value.findIndex((t: any) => t.key === tabManagement.currentTab.value);
      const can = idx < tabManagement.tabs.value.length - 1;
      if (can) tabManagement.switchTab(tabManagement.tabs.value[idx + 1].key);
      return can;
    },
    onSwipeRight: () => {
      // 切换到上一个 Tab
      const idx = tabManagement.tabs.value.findIndex((t: any) => t.key === tabManagement.currentTab.value);
      const can = idx > 0;
      if (can) tabManagement.switchTab(tabManagement.tabs.value[idx - 1].key);
      return can;
    }
});
```

- 使用 useSwipeGesture composable
- 支持左右滑动切换 Tab
- 返回是否成功切换

### 5. 引用监听

```typescript
watch(bottomAreaRef, (el, oldEl) => {
    if (oldEl) {
      bottomSwipe.unbindEventListeners?.();
    }
    if (el) {
      requestAnimationFrame(() => bottomSwipe.bindEventListeners?.());
      bottomButtonAreaRef.value = el.querySelector('.button-area');
    }
});
```

- 监听引用变化
- 自动绑定/解绑事件
- 查找按钮区域

## 注意事项

### 1. 手势配置

- VELOCITY_THRESHOLD: 0.15 (px/ms)
- TAB_SWIPE_THRESHOLD: 12px
- TAB_SWIPE_MAX_TIME: 600ms
- 根据实际体验调整

### 2. 底部区域

- 需要正确设置 bottomAreaRef
- 自动查找 .button-area
- 独立的手势配置

### 3. 全局事件

- modal-will-close: 关闭前
- modal-did-close: 关闭后
- 其他组件可监听

### 4. 手势冲突

- 使用方向锁定避免冲突
- 底部区域使用 useCapture
- 确保手势正常工作

## 相关 Composables

- `useModalState` - 状态管理
- `useTabManagement` - Tab 管理
- `useSwipeGesture` - 通用滑动手势

## 更新日志

- 模态框滑动手势
- Tab 切换手势
- 底部区域手势
- 全局事件通知
- 手势方向锁定
