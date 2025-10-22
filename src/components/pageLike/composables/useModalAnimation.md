# useModalAnimation Composable 文档

## 概述

useModalAnimation 是模态框动画管理组合式函数，处理进入和退出动画。

## 文件位置

- Composable：`src/components/pageLike/composables/useModalAnimation.ts`
- 依赖：
  - `src/components/animation/VerticalAnimation.ts`
  - `src/components/animation/HorizontalAnimation.ts`

## 核心功能

### 1. 进入动画

- 垂直模式进入动画
- 水平模式进入动画

### 2. 退出动画

- 垂直模式退出动画
- 水平模式退出动画
- 退出状态管理

### 3. 生命周期事件

- 模态框展示完成事件

## 参数

```typescript
function useModalAnimation(
  modalMode: any,                     // useModalMode 返回值
  modalState: any                     // useModalState 返回值
)
```

## 返回值

```typescript
{
  handleDidPresent: () => void;       // 展示完成处理
  enterAnimation: (baseEl: any) => Animation; // 进入动画
  leaveAnimation: (baseEl: any) => Animation; // 退出动画
}
```

## 使用示例

```typescript
import { useModalAnimation } from './composables/useModalAnimation';

const modalMode = useModalMode(props);
const modalState = useModalState(props, emit);
const modalAnimation = useModalAnimation(modalMode, modalState);

const {
  handleDidPresent,
  enterAnimation,
  leaveAnimation
} = modalAnimation;
```

### 在模板中使用

```vue
<ion-modal
  :is-open="isOpen"
  :enter-animation="enterAnimation"
  :leave-animation="leaveAnimation"
  @didPresent="handleDidPresent"
>
  <!-- 模态框内容 -->
</ion-modal>
```

## 特殊逻辑

### 1. 展示完成处理

```typescript
function handleDidPresent() {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('modal-did-present', {
        detail: {
          type: 'PageLikeModal',
          mode: modalMode.modalDirection.value,
          timestamp: Date.now()
        }
      }));
    }
}
```

- 触发全局事件
- 通知模态框已展示
- 包含模式和时间戳信息

### 2. 进入动画选择

```typescript
const enterAnimation = (baseEl: any) => {
    if (modalMode.isVerticalMode.value) {
      return createVerticalEnterAnimation(baseEl);
    } else {
      return createHorizontalEnterAnimation(baseEl);
    }
};
```

- 根据模式选择动画
- 垂直模式：从下向上
- 水平模式：从右向左

### 3. 退出动画选择

```typescript
const leaveAnimation = (baseEl: any) => {
    modalState.setExiting(true);
    
    let animation;
    if (modalMode.isVerticalMode.value) {
      animation = createVerticalLeaveAnimation(baseEl);
    } else {
      animation = createHorizontalLeaveAnimation(baseEl);
    }
    
    // 动画完成后重置状态
    animation.onFinish(() => {
      modalState.setExiting(false);
    });
    
    return animation;
};
```

- 设置退出状态
- 根据模式选择动画
- 动画完成后重置状态

## 动画类型

### 垂直模式动画

- **进入**: 从底部向上滑入
- **退出**: 向下滑出到底部

### 水平模式动画

- **进入**: 从右侧向左滑入
- **退出**: 向右滑出

## 注意事项

### 1. 动画时长

- 默认动画时长由动画函数定义
- 确保与手势动画协调
- 通常为 300ms

### 2. 退出状态

- 退出时设置 `isExiting` 状态
- 用于添加 CSS 类
- 动画完成后自动重置

### 3. 全局事件

- modal-did-present: 展示完成
- 其他组件可监听
- 用于初始化逻辑

### 4. 浏览器兼容性

- 使用 Ionic 动画 API
- 自动处理兼容性
- 支持现代浏览器

## 相关动画函数

- `createVerticalEnterAnimation` - 垂直进入动画
- `createVerticalLeaveAnimation` - 垂直退出动画
- `createHorizontalEnterAnimation` - 水平进入动画
- `createHorizontalLeaveAnimation` - 水平退出动画

## 相关 Composables

- `useModalMode` - 模式管理
- `useModalState` - 状态管理

## 更新日志

- 支持垂直和水平动画
- 退出状态管理
- 全局事件通知
- 动画完成回调
