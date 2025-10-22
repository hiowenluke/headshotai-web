# ModalHeader 组件文档

## 概述

ModalHeader 是模态框的头部组件，提供标题显示、菜单导航、工具栏等功能。支持多种布局模式和自适应高度计算。

## 文件位置

- 组件：`src/components/header/ModalHeader.vue`

## 核心功能

### 1. 标题区域管理

- 通过插槽支持多种标题类型
- 返回按钮插槽
- 工具栏插槽

### 2. 菜单导航

- 主菜单导航（MainNavBar）
- 子菜单导航（SubNavBar）
- 支持滚动到顶部功能

### 3. 动态高度计算

- 自动计算 Header 总高度
- 通过 CSS 变量传递给父组件
- 支持内容区域自适应

### 4. 毛玻璃效果

- 可选的透明毛玻璃背景
- 提升视觉层次感

## Props

```typescript
interface Props {
  showMainMenu?: boolean;             // 显示主菜单
  showSubMenu?: boolean;              // 显示子菜单
  menus?: string[];                   // 主菜单项
  activeIndex?: number;               // 当前激活的主菜单索引
  hasSubMenus?: boolean[];            // 各主菜单是否有子菜单
  currentSubMenus?: SubMenuItem[];    // 当前子菜单项
  activeSubIndex?: number;            // 当前激活的子菜单索引
  transparentBlur?: boolean;          // 启用毛玻璃效果
}
```

## Events

```typescript
{
  select: [number];                   // 主菜单选择事件
  'select-sub': [number];             // 子菜单选择事件
  'scroll-to-top': [];                // 滚动到顶部事件
}
```

## Slots

```typescript
{
  'back-button': {};                  // 返回按钮插槽
  'title': {};                        // 标题插槽
  'toolbar-end': {};                  // Header 右侧工具栏插槽
}
```

## 使用示例

### 简单标题

```vue
<ModalHeader>
  <template #back-button>
    <DownButton @click="close" />
  </template>
  <template #title>
    <SimpleTitle title="页面标题" />
  </template>
</ModalHeader>
```

### 带菜单的 Header

```vue
<ModalHeader
  :show-main-menu="true"
  :menus="['选项1', '选项2', '选项3']"
  :active-index="activeIndex"
  @select="handleMenuSelect"
>
  <template #back-button>
    <ReturnButton @click="close" />
  </template>
  <template #title>
    <SimpleTitle title="标题" />
  </template>
</ModalHeader>
```

### 毛玻璃效果

```vue
<ModalHeader :transparent-blur="true">
  <template #back-button>
    <CloseButton @click="close" />
  </template>
  <template #title>
    <SimpleTitle title="标题" />
  </template>
</ModalHeader>
```

## 特殊逻辑

### 1. 动态高度计算

```typescript
const updateHeaderMetrics = () => {
  const headerEl = getHeaderElement();
  if (!headerEl) return;
  const height = headerEl.offsetHeight || 0;
  const paddingBottom = parseFloat(getComputedStyle(headerEl).paddingBottom || '0') || 0;
  applyHeaderMetrics(height, paddingBottom);
};
```

- 实时计算 Header 高度
- 包含 padding-bottom 的计算
- 通过 CSS 变量传递给模态框

### 2. CSS 变量设置

```typescript
const applyHeaderMetrics = (height: number, paddingBottom: number) => {
  if (!modalElement.value && headerRef.value) {
    const headerEl = getHeaderElement();
    modalElement.value = headerEl?.closest('.page-like-modal') as HTMLElement | null;
  }
  if (modalElement.value) {
    modalElement.value.style.setProperty('--plm-header-height', `${height}px`);
    modalElement.value.style.setProperty('--plm-header-padding-bottom', `${paddingBottom}px`);
  }
};
```

- 向上查找 `.page-like-modal` 元素
- 设置 CSS 变量供内容区域使用
- 用于内容区域的 padding-top 设置

### 3. ResizeObserver 监听

```typescript
onMounted(() => {
  const headerEl = getHeaderElement();
  if (typeof ResizeObserver !== 'undefined' && headerEl) {
    resizeObserver = new ResizeObserver(() => {
      updateHeaderMetrics();
    });
    resizeObserver.observe(headerEl);
  }
});
```

- 使用 ResizeObserver 监听 Header 尺寸变化
- 自动更新高度信息
- 支持动态内容变化

### 4. 多种事件监听

```typescript
window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', handleOrientationChange);
window.visualViewport?.addEventListener('resize', handleVisualViewportResize);
window.visualViewport?.addEventListener('scroll', handleVisualViewportScroll);
```

- 窗口大小变化
- 屏幕方向变化
- 视口大小变化（移动端键盘弹出等）
- 视口滚动

### 5. Props 变化监听

```typescript
watch(() => [
  props.showMainMenu,
  props.showSubMenu,
  props.activeIndex,
  props.activeSubIndex,
  props.menus?.length,
  props.currentSubMenus?.length
], () => scheduleMetricsUpdate());
```

- 菜单显示/隐藏时重新计算
- 菜单项变化时重新计算
- 使用 nextTick 确保 DOM 更新完成

### 6. centerRef 导出

```typescript
const centerRef = computed(() => modalTopBarRef.value?.centerRef || null);

defineExpose({
  centerRef
});
```

- 导出 ModalTopBar 的 centerRef
- 供父组件访问标题中心区域的 DOM 元素

## 子组件

### ModalTopBar
- 顶部工具栏组件
- 包含返回按钮、标题、工具栏

### MainNavBar
- 主菜单导航栏
- 支持水平滚动
- 菜单项选择和高亮

### SubNavBar
- 子菜单导航栏
- 与主菜单联动
- 支持滚动到顶部

## 样式特性

### 1. Fixed 定位

```css
.modal-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--header-z-index, 100);
}
```

- 始终固定在顶部
- 使用 z-index 管理层级

### 2. 安全区域适配

```css
.modal-header {
  padding: calc(env(safe-area-inset-top, 0px)) 0 0;
}
```

- 适配 iPhone 刘海屏
- 确保内容不被遮挡

### 3. 毛玻璃效果

```css
.modal-header.transparent-blur {
  background: rgba(37, 38, 43, 0.75);
  backdrop-filter: blur(18px) saturate(140%);
}

.modal-header.transparent-blur::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(to right, rgba(255,255,255,0.10), rgba(255,255,255,0.02));
}
```

- 半透明背景
- 毛玻璃模糊效果
- 底部渐变分隔线

### 4. 移除默认边框

```css
.modal-header {
  border: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
}

.modal-header::part(native) {
  border: none !important;
  box-shadow: none !important;
}
```

- 移除 ion-header 的默认边框
- 移除 Shadow DOM 中的边框

## 注意事项

### 1. 高度计算时机

- 必须在 DOM 渲染完成后计算
- 使用 `nextTick` 确保时机正确
- 内容变化时需要重新计算

### 2. CSS 变量作用域

- CSS 变量设置在 `.page-like-modal` 元素上
- 确保变量在正确的作用域内生效

### 3. 事件传递

- 所有子组件事件都需要向上传递
- 保持事件名称的一致性

### 4. 性能优化

- 使用 ResizeObserver 而非轮询
- 事件监听器在组件卸载时清理
- 避免频繁的 DOM 操作

### 5. 兼容性

- ResizeObserver 的兼容性检查
- visualViewport API 的错误处理
- Shadow DOM 的样式穿透

## 相关组件

- `ModalTopBar` - 顶部工具栏组件
- `MainNavBar` - 主菜单导航
- `SubNavBar` - 子菜单导航
- `PageLikeModal` - 父级模态框组件

## 更新日志

- 2025-01-17: 修复内容被 Header 遮挡问题，添加动态高度计算
- 支持多种标题类型、菜单导航、毛玻璃效果等功能
