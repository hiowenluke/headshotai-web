# useModalMode Composable 文档

## 概述

useModalMode 是模态框模式管理组合式函数，处理垂直/水平/X 模式的判断和相关配置。

## 文件位置

- Composable：`src/components/pageLike/composables/useModalMode.ts`

## 核心功能

### 1. 模式判断

- 垂直模式（V/vertical）
- 水平模式（H/horizontal）
- X 模式（禁用滑动）

### 2. 排除选择器配置

- V 模式排除选择器
- H 模式排除选择器
- 防止手势冲突

## 参数

```typescript
function useModalMode(
  props: any                          // 组件 props，包含 modalStyle
)
```

## 返回值

```typescript
{
  modalDirection: ComputedRef<'vertical' | 'horizontal' | 'x'>; // 模式方向
  isVerticalMode: ComputedRef<boolean>; // 是否垂直模式
  isXMode: ComputedRef<boolean>;      // 是否 X 模式
  vModeExcludeSelector: ComputedRef<string>; // V 模式排除选择器
  hModeExcludeSelector: ComputedRef<string>; // H 模式排除选择器
  normalizeModalStyle: (style: string | undefined) => 'vertical' | 'horizontal' | 'x'; // 规范化函数
}
```

## 使用示例

```typescript
import { useModalMode } from './composables/useModalMode';

const props = defineProps<{
  modalStyle?: 'vertical' | 'horizontal' | 'V' | 'H' | 'v' | 'h' | 'X' | 'x';
}>();

const modalMode = useModalMode(props);

const {
  isVerticalMode,
  isXMode,
  vModeExcludeSelector,
  hModeExcludeSelector
} = modalMode;
```

## 特殊逻辑

### 1. 模式规范化

```typescript
function normalizeModalStyle(style: string | undefined): 'vertical' | 'horizontal' | 'x' {
    const v = (style || '').toLowerCase();
    if (v === 'vertical' || v === 'V' || v === 'v') return 'vertical';
    if (v === 'horizontal' || v === 'H' || v === 'h') return 'horizontal';
    if (v === 'x') return 'x';
    throw new Error(`[PageLikeModal] Invalid modalStyle: ${style}`);
}
```

- 统一处理大小写变体
- 抛出错误提示无效值

### 2. 排除选择器

```typescript
const vModeExcludeSelector = computed(() => {
    if (isVerticalMode.value || isXMode.value) {
      return '.plm-back, .return-button, .close-button, .down-button-wrapper, .primary-btn, .secondary-btn, .demo-thumb, input, textarea, select, .ion-activatable, .swiper, .scroll-area, .plm-bottom-area';
    }
    return '.plm-back';
});
```

- V 模式和 X 模式使用相同的排除选择器
- 排除按钮、输入框、可滚动区域等
- 防止手势冲突

## 注意事项

### 1. 模式值

- 支持大小写变体（V/v/vertical）
- 无效值会抛出错误
- 建议使用小写

### 2. 排除选择器

- 根据模式自动配置
- 不要手动修改
- 确保手势正常工作

## 相关 Composables

- `useModalState` - 状态管理
- `useModalGestures` - 手势管理

## 更新日志

- 支持三种模式
- 自动配置排除选择器
- 模式规范化
