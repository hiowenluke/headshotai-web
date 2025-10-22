# Icons 图标系统

## 📁 目录结构

```
src/components/icons/
├── README.md           # 使用说明
├── iconUtils.ts        # 核心工具函数
├── iconMap.ts          # 图标映射（已有）
├── IconComponents.ts   # 图标组件工厂（已有）
├── SvgIcon.vue         # 通用SVG图标组件
└── ImgIcon.vue         # IMG标签图标组件
```

## 🎯 设计原则

1. **统一管理**: 所有图标相关逻辑集中在此目录
2. **职责分离**: 不同组件有明确的使用场景
3. **类型安全**: 完整的TypeScript支持
4. **易于扩展**: 新增功能不影响现有代码

## 🔧 核心工具函数

### `getIconPath(iconName: string)`
```typescript
// 输入: "close-outline"
// 输出: "/images/icons/close-outline.svg"
```

### `getColorFilter(color: string)`
```typescript
// 输入: "white" 或 "#ffffff"
// 输出: "brightness(0) invert(1)"
```

### `createIconConfig(config: IconConfig)`
```typescript
// 输入: { name: "close-outline", color: "white", size: "24px" }
// 输出: { src: "...", style: {...}, class: "..." }
```

## 📦 组件说明

### SvgIcon.vue
- **用途**: 通用图标组件，大多数场景使用
- **特点**: 支持 `currentColor`，继承父元素颜色
- **推荐**: 优先选择

### ImgIcon.vue  
- **用途**: 需要精确颜色控制的场景
- **特点**: 使用CSS filter实现颜色变换
- **适用**: 特殊颜色需求

## 🎨 颜色系统

支持的颜色类型：
- 颜色名称: `'white'`, `'black'`, `'red'` 等
- 十六进制: `'#ffffff'`, `'#000000'` 等  
- 特殊值: `'currentColor'` (仅SvgIcon)

## 📝 使用示例

```vue
<template>
  <!-- 基础使用 -->
  <SvgIcon name="close-outline" />
  
  <!-- 自定义颜色和大小 -->
  <SvgIcon name="menu-outline" color="white" size="30px" />
  
  <!-- 继承父元素颜色 -->
  <div style="color: red;">
    <SvgIcon name="heart-outline" color="currentColor" />
  </div>
  
  <!-- 精确颜色控制 -->
  <ImgIcon name="flash-outline" color="#ff0000" size="20px" />
</template>

<script setup lang="ts">
import SvgIcon from '@/components/icons/SvgIcon.vue';
import ImgIcon from '@/components/icons/ImgIcon.vue';
</script>
```

## 🔄 与其他组件的关系

- **BaseButton**: 使用 `ImgIcon` 实现按钮图标
- **其他组件**: 推荐使用 `SvgIcon`
- **工具函数**: 可在任何地方导入使用

这样的设计确保了图标系统的统一性和可维护性！