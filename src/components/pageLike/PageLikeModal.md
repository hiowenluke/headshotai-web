# PageLikeModal 组件文档

## 概述

PageLikeModal 是一个全屏模态框组件，提供类似原生页面的体验，支持多种模式和手势交互。

## 文件位置

- 组件：`src/components/pageLike/PageLikeModal.vue`
- 样式：`src/components/pageLike/css/PageLikeModal.css`
- Composables：`src/components/pageLike/composables/`

## 核心功能

### 1. 多种模式支持

#### 垂直模式 (V-Mode)
- 从底部向上滑出
- 向下滑动关闭
- 适用于大多数内容页面

#### 水平模式 (H-Mode)
- 从右侧滑入
- 向右滑动关闭
- 适用于详情页面

#### X 模式
- 类似垂直模式，但禁用滑动关闭
- 只能通过关闭按钮关闭
- 适用于重要操作页面

### 2. Tab 管理

支持两种 Tab 样式：
- **Icon Tabs**：带图标的标签页
- **Text Tabs**：纯文本标签页

特性：
- Tab 切换动画
- Tab 状态持久化（可选）
- 左右滑动切换 Tab

### 3. 手势交互

#### 模态框关闭手势
- 垂直模式：向下滑动
- 水平模式：向右滑动
- 支持速度检测（快速滑动即可关闭）

#### Tab 切换手势
- 左右滑动切换 Tab
- 支持阈值和时间限制
- 防止误触

### 4. Header 管理

- 支持主菜单和子菜单
- 透明毛玻璃效果（可选）
- 动态高度计算
- Fixed 定位，始终可见

### 5. Z-Index 管理

使用层级管理系统：
- 模态框层级
- 内容层级
- 背景遮罩层级
- Header 层级
- 工具栏层级
- 按钮层级

## Props

### 基础 Props

```typescript
interface Props {
  isOpen: boolean;                    // 是否打开
  modalTitle?: string;                // 模态框标题
  pageTitle?: string;                 // 页面标题
  tabs?: TabItem[];                   // Tab 配置
  modelValue?: string;                // 当前 Tab (v-model)
  modalStyle?: 'vertical' | 'horizontal' | 'V' | 'H' | 'v' | 'h' | 'x';
  titleType?: 'icon-tabs' | 'text-tabs' | 'simple' | 'auto';
  hotDismissed?: boolean;             // HOT 标签是否已关闭
  enableTabSwipe?: boolean;           // 是否启用 Tab 滑动切换
  disableContentScroll?: boolean;     // 禁用内容滚动
  modalType?: string;                 // 模态框类型标识
  enableTabPersistence?: boolean;     // 启用 Tab 持久化
  swipeThresholdRatio?: number;       // 滑动关闭阈值比例
  
  // 菜单相关
  showMainMenu?: boolean;
  showSubMenu?: boolean;
  menus?: string[];
  activeIndex?: number;
  hasSubMenus?: boolean[];
  currentSubMenus?: any[];
  activeSubIndex?: number;
  transparentBlurHeader?: boolean;    // Header 毛玻璃效果
}
```

## Events

```typescript
{
  close: [];                          // 关闭事件
  'update:modelValue': [string];      // Tab 切换
  'hot-clicked': [];                  // HOT 标签点击
  select: [number];                   // 主菜单选择
  'select-sub': [number];             // 子菜单选择
  'scroll-to-top': [];                // 滚动到顶部
}
```

## Slots

```typescript
{
  default: {};                        // 默认内容（单页模式）
  [tabKey: string]: {};              // Tab 内容（多 Tab 模式）
  'toolbar-end': {};                 // Header 右侧工具栏
  'bottom-area': {};                 // 底部固定区域
}
```

## 使用示例

### 基础用法

```vue
<PageLikeModal
  :is-open="isOpen"
  page-title="页面标题"
  modal-style="vertical"
  @close="handleClose"
>
  <div>页面内容</div>
</PageLikeModal>
```

### 多 Tab 模式

```vue
<PageLikeModal
  :is-open="isOpen"
  :tabs="tabs"
  v-model="currentTab"
  title-type="icon-tabs"
  :enable-tab-swipe="true"
  @close="handleClose"
>
  <template #tab1>
    <div>Tab 1 内容</div>
  </template>
  <template #tab2>
    <div>Tab 2 内容</div>
  </template>
</PageLikeModal>
```

### 带菜单的页面

```vue
<PageLikeModal
  :is-open="isOpen"
  :show-main-menu="true"
  :menus="['选项1', '选项2', '选项3']"
  :active-index="activeIndex"
  @select="handleMenuSelect"
  @close="handleClose"
>
  <div>内容</div>
</PageLikeModal>
```

## 特殊逻辑

### 1. 模式检测

```typescript
const isVerticalMode = computed(() => {
  const style = props.modalStyle?.toLowerCase();
  return !style || style === 'vertical' || style === 'v';
});

const isXMode = computed(() => {
  return props.modalStyle?.toLowerCase() === 'x';
});
```

- 默认为垂直模式
- X 模式禁用滑动关闭

### 2. Tab 持久化

```typescript
// 保存 Tab 状态到 localStorage
if (props.enableTabPersistence && props.modalType) {
  const key = `modal_tab_${props.modalType}`;
  localStorage.setItem(key, currentTab.value);
}
```

### 3. 手势冲突处理

```typescript
// 禁用 Tab 滑动的条件
const isGestureDisabled = computed(() => {
  return isSwipeInProgress.value || isGestureDirectionLocked.value;
});
```

- 模态框滑动时禁用 Tab 滑动
- 手势方向锁定时禁用 Tab 滑动

### 4. 动画控制

```typescript
// 滑动进度影响背景透明度
.page-like-modal.swiping::part(backdrop) {
  opacity: calc(0.8 - var(--swipe-progress, 0) * 0.2) !important;
}
```

### 5. Header 高度适配

```typescript
// 使用 CSS 变量传递 Header 高度
--padding-top: var(--plm-header-height, 56px);
```

- ModalHeader 动态计算高度
- 通过 CSS 变量传递给 ion-content
- 内容区域自动添加顶部间距

## Composables

### useModalState
- 管理模态框打开/关闭状态
- 处理关闭事件

### useModalMode
- 检测模态框模式（垂直/水平/X）
- 提供模式相关的计算属性

### useTabManagement
- Tab 状态管理
- Tab 切换逻辑
- Tab 持久化

### useModalGestures
- 手势事件处理
- 滑动进度计算
- 手势冲突处理

### useModalAnimation
- 进入/退出动画
- 自定义动画配置

## 注意事项

### 1. Z-Index 管理

使用 `modalStackManager` 管理层级：
```typescript
import { modalStackManager } from '@/utils/zIndexManager';
```

### 2. 性能优化

- Tab 内容懒加载
- 使用 `v-show` 而非 `v-if` 保持 Tab 状态
- 滑动时禁用过渡动画

### 3. 兼容性

- iOS：原生滚动回弹
- Android：需要自定义回弹（目前未实现）
- Safari：特殊的手势处理

### 4. 已知问题

- Android 在 ion-content 中没有垂直回弹效果
- 双层滚动容器可能导致冲突

## 相关组件

- `ModalHeader` - Header 组件
- `ModalSwipeGesture` - 模态框滑动手势
- `TabSwipeGesture` - Tab 滑动手势
- `IconTabsTitle` - 图标 Tab 标题
- `TextTabsTitle` - 文本 Tab 标题
- `SimpleTitle` - 简单标题

## 更新日志

- 2025-01-17: 添加 `--padding-top` CSS 变量，修复内容被 Header 遮挡问题
- 之前: 支持多种模式、Tab 管理、手势交互等核心功能
