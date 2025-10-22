# ModalSwipeGesture 组件文档

## 概述

ModalSwipeGesture 是模态框滑动手势组件，处理模态框的滑动关闭功能。支持垂直和水平两种滑动方向，提供流畅的手势交互体验和智能的手势方向锁定机制。

## 文件位置

- 组件：`src/components/gesture/ModalSwipeGesture.vue`

## 核心功能

### 1. 多方向滑动支持

- **垂直滑动**: 向下滑动关闭（主模态框）
- **水平滑动**: 向右滑动关闭（子模态框）

### 2. 智能手势识别

- 手势方向锁定机制
- 滑动距离计算
- 速度检测（快速滑动即可关闭）
- 阈值判断

### 3. 视觉反馈

- 实时跟随手指移动
- 滑动进度计算
- 无上限拖动支持

### 4. 手势冲突处理

- 排除特定元素的手势触发
- 与内容滚动的冲突处理
- 手势方向锁定避免误触

## Props

```typescript
interface Props {
  swipeThresholdRatio?: number;       // 滑动关闭阈值比例 (0-1)，默认 0.08
  velocityThreshold?: number;         // 速度阈值 (px/ms)，默认 0.15
  modalStyle?: 'vertical' | 'horizontal' | 'V' | 'H' | 'v' | 'h'; // 滑动方向
  excludeSelector?: string;           // 排除的选择器，点击这些元素不触发手势
}
```

## Events

```typescript
{
  swipeStart: [];                     // 滑动开始事件
  swipeMove: [number];                // 滑动进度事件 (0-无限)
  swipeEnd: [];                       // 滑动结束事件
  swipeCancel: [];                    // 滑动取消事件
  swipeExit: [];                      // 触发退出事件
  gestureDirectionLocked: ['vertical' | 'horizontal' | null]; // 手势方向锁定事件
}
```

## Slots

```typescript
{
  default: {};                        // 默认插槽，包装需要手势的内容
}
```

## 使用示例

### 垂直滑动（主模态框）

```vue
<ModalSwipeGesture
  modal-style="vertical"
  :swipe-threshold-ratio="0.08"
  :velocity-threshold="0.15"
  @swipe-exit="handleClose"
  @swipe-move="handleSwipeMove"
>
  <div class="modal-content">
    <!-- 模态框内容 -->
  </div>
</ModalSwipeGesture>
```

### 水平滑动（子模态框）

```vue
<ModalSwipeGesture
  modal-style="horizontal"
  :swipe-threshold-ratio="0.08"
  @swipe-exit="handleClose"
>
  <div class="modal-content">
    <!-- 模态框内容 -->
  </div>
</ModalSwipeGesture>
```

### 排除特定元素

```vue
<ModalSwipeGesture
  modal-style="vertical"
  exclude-selector=".no-swipe, .scrollable-area"
  @swipe-exit="handleClose"
>
  <div class="modal-content">
    <div class="scrollable-area">
      <!-- 这个区域不触发模态框关闭手势 -->
    </div>
  </div>
</ModalSwipeGesture>
```

## 特殊逻辑

### 1. 方向规范化

```typescript
const normalize = (style: string | undefined): 'vertical' | 'horizontal' => {
    const v = (style || '').toLowerCase();
    if (v === 'vertical' || v === 'V' || v === 'v') return 'vertical';
    if (v === 'horizontal' || v === 'H' || v === 'h') return 'horizontal';
    return 'horizontal';
};
```

- 统一处理大小写变体
- 默认为水平方向

### 2. 手势方向锁定

```typescript
const DIRECTION_LOCK_THRESHOLD = 20; // 20px 阈值避免误触

if (!gestureDirectionLocked.value && 
    (Math.abs(deltaX) > DIRECTION_LOCK_THRESHOLD || Math.abs(deltaY) > DIRECTION_LOCK_THRESHOLD)) {
    const isVertical = Math.abs(deltaY) > Math.abs(deltaX);
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    
    if (isVertical && normalize(props.modalStyle) === 'vertical' && deltaY > 0) {
        gestureDirectionLocked.value = 'vertical';
        emit('gestureDirectionLocked', 'vertical');
    } else if (isHorizontal && normalize(props.modalStyle) === 'horizontal' && deltaX > 0) {
        gestureDirectionLocked.value = 'horizontal';
        emit('gestureDirectionLocked', 'horizontal');
    }
}
```

- 20px 阈值避免点击按钮时的手指抖动被识别为滑动
- 根据移动方向锁定手势类型
- 只有锁定后才激活滑动手势
- 防止误触和手势冲突

### 3. 排除元素检查

```typescript
const shouldIgnoreTouch = (target: EventTarget | null): boolean => {
    if (!target) return false;
    
    const element = target as Element;
    
    // 检查自定义排除选择器
    if (props.excludeSelector && element.closest(props.excludeSelector) !== null) {
        return true;
    }
    
    // 检查按钮元素
    if (element.closest('ion-button, button, .base-modal-button, .return-button, .close-button, .down-button-wrapper')) {
        return true;
    }
    
    return false;
};
```

- 支持自定义排除选择器
- 自动排除按钮元素
- 防止点击按钮时触发滑动

### 4. 滑动进度计算

```typescript
const threshold = normalize(props.modalStyle) === 'vertical' 
    ? screenHeight.value * props.swipeThresholdRatio
    : screenWidth.value * props.swipeThresholdRatio;

const distance = normalize(props.modalStyle) === 'vertical' ? deltaY : deltaX;
// 只限制下限为0，不限制上限，允许无限向下拖动
const progress = Math.max(distance / threshold, 0);

emit('swipeMove', progress);
```

- 根据屏幕尺寸和阈值比例计算阈值
- 允许超过阈值继续拖动
- 进度值可以大于 1

### 5. 关闭判断逻辑

```typescript
const deltaTime = Date.now() - swipeStartTime.value;
const distance = normalize(props.modalStyle) === 'vertical' ? currentSwipeY.value : currentSwipeX.value;
const velocity = Math.abs(distance) / deltaTime;

const threshold = normalize(props.modalStyle) === 'vertical' 
    ? screenHeight.value * props.swipeThresholdRatio
    : screenWidth.value * props.swipeThresholdRatio;

const shouldExit = Math.abs(distance) >= threshold || velocity >= props.velocityThreshold;

if (shouldExit) {
    emit('swipeExit');
} else {
    emit('swipeCancel');
}
```

- 支持两种关闭条件：
  1. 滑动距离达到阈值
  2. 滑动速度达到阈值（快速滑动）
- 不满足条件时触发取消事件

### 6. 状态重置

```typescript
const resetGestureState = () => {
    isSwipeActive.value = false;
    gestureDirectionLocked.value = null;
    emit('gestureDirectionLocked', null);
};
```

- 在触摸结束或取消时重置状态
- 清除方向锁定
- 通知父组件方向锁定已解除

### 7. 事件监听器设置

```typescript
element.addEventListener('touchstart', handleTouchStart, { passive: false });
element.addEventListener('touchmove', handleTouchMove, { passive: false });
element.addEventListener('touchend', handleTouchEnd, { passive: false });
element.addEventListener('touchcancel', handleTouchCancel, { passive: false });
```

- 使用 `passive: false` 允许 `preventDefault()`
- 在确认是有效滑动手势后才阻止默认行为

## 样式特性

### 1. 触摸行为

```css
.modal-swipe-gesture {
    touch-action: none;
    user-select: none;
}
```

- 禁用默认触摸行为
- 禁用文本选择

## 性能优化

### 1. 屏幕尺寸缓存

```typescript
const screenWidth = ref(0);
const screenHeight = ref(0);

const updateScreenSize = () => {
    screenWidth.value = window.innerWidth;
    screenHeight.value = window.innerHeight;
};
```

- 缓存屏幕尺寸避免重复计算
- 监听 resize 和 orientationchange 事件更新

### 2. 事件清理

```typescript
onUnmounted(() => {
    window.removeEventListener('resize', updateScreenSize);
    window.removeEventListener('orientationchange', updateScreenSize);
    
    const element = gestureRef.value;
    if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
        element.removeEventListener('touchcancel', handleTouchCancel);
    }
});
```

- 组件卸载时清理所有事件监听器
- 防止内存泄漏

## 注意事项

### 1. 方向锁定阈值

- 20px 阈值可以有效避免误触
- 过小的阈值会导致点击按钮时触发滑动
- 过大的阈值会影响手势响应速度

### 2. 排除选择器

- 合理使用 `excludeSelector` 避免手势冲突
- 按钮元素已自动排除
- 可滚动区域应该被排除

### 3. 阈值设置

- `swipeThresholdRatio` 默认 0.08（屏幕的 8%）
- `velocityThreshold` 默认 0.15 (px/ms)
- 根据实际体验调整阈值

### 4. 事件顺序

- swipeStart → swipeMove (多次) → swipeEnd
- swipeExit 或 swipeCancel 在 swipeEnd 之前触发
- gestureDirectionLocked 在方向确定后触发

### 5. 边界情况

- 处理快速连续的触摸事件
- 处理触摸中断的情况
- 处理屏幕旋转时的状态重置

## 相关组件

- `PageLikeModal` - 父级模态框组件
- `TabSwipeGesture` - Tab 滑动手势组件

## 更新日志

- 支持垂直和水平滑动
- 智能手势方向锁定机制
- 排除特定元素的手势触发
- 流畅的视觉反馈和动画
- 优化的阈值和速度检测
