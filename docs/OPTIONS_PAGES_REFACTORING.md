# Options Pages 重构文档

## 概述

将选项页面重构为通用组件架构，所有选项页面（Backdrops、Hairstyles、Outfits、Poses）共享相同的代码逻辑，只通过参数区分不同的选项类型。

## 架构设计

### 组件层级

```
OptionsPage (通用基础组件)
├── BackdropsPage (Backdrop Types)
├── HairstylesPage (Hairstyles)
├── OutfitsPage (Outfits)
└── PosesPage (Poses)
```

### 文件结构

```
src/pages/generator/optionsPages/
├── OptionsPage.vue          # 通用基础组件
├── BackdropsPage.vue         # Backdrops 页面
├── HairstylesPage.vue        # Hairstyles 页面
├── OutfitsPage.vue           # Outfits 页面
└── PosesPage.vue             # Poses 页面
```

## OptionsPage 组件

### Props

```typescript
interface Props {
  isOpen: boolean;                    // 是否打开
  optionType: 'backdrops' | 'hairstyles' | 'outfits' | 'poses'; // 选项类型
  pageTitle: string;                  // 页面标题
  plan?: string;                      // 计划类型（20P, 40P等）
  initialSelection?: Record<string, string[]>; // 初始选择
  sourceContext?: string;             // 来源上下文标识
  folderStyle?: boolean;              // 是否使用文件夹样式
}
```

### Events

```typescript
{
  close: [SelectionResult];           // 关闭事件
  apply: [SelectionResult];           // 应用事件
}
```

### 核心功能

1. **数据加载**
   - 根据 `optionType` 加载对应的图片数据
   - 使用 `fetchDemoOptionsImages` API
   - 支持重试机制

2. **选择管理**
   - 支持多选
   - 实时显示选中数量
   - 选择状态持久化到 localStorage

3. **localStorage 持久化**
   - 存储键格式：`{optionType}_selection_{sourceContext}`
   - 例如：`backdrops_selection_generator-20P`
   - 优先从 localStorage 加载，其次使用 `initialSelection`

4. **UI 展示**
   - 使用 GroupedCardList 组件
   - 支持文件夹样式（层叠效果）
   - 显示加载状态、错误状态、空状态

## 具体页面组件

### BackdropsPage

- **选项类型**: `backdrops`
- **页面标题**: "Backdrop Types"
- **文件夹样式**: `true` （显示层叠效果）
- **用途**: 选择背景类型

### HairstylesPage

- **选项类型**: `hairstyles`
- **页面标题**: "Hairstyles"
- **文件夹样式**: `false`
- **用途**: 选择发型

### OutfitsPage

- **选项类型**: `outfits`
- **页面标题**: "Outfits"
- **文件夹样式**: `false`
- **用途**: 选择服装

### PosesPage

- **选项类型**: `poses`
- **页面标题**: "Poses"
- **文件夹样式**: `false`
- **用途**: 选择姿势

## 使用示例

### 在 Generator20P 中使用

```vue
<template>
  <div>
    <!-- Backdrops -->
    <BackdropsPage
      :is-open="backdropsOpen"
      :plan="selectedPlan"
      :source-context="`generator-${selectedPlan}`"
      @close="handleBackdropsClose"
      @apply="handleBackdropsApply"
    />
    
    <!-- Hairstyles -->
    <HairstylesPage
      :is-open="hairstylesOpen"
      :plan="selectedPlan"
      :source-context="`generator-${selectedPlan}`"
      @close="handleHairstylesClose"
      @apply="handleHairstylesApply"
    />
    
    <!-- Outfits -->
    <OutfitsPage
      :is-open="outfitsOpen"
      :plan="selectedPlan"
      :source-context="`generator-${selectedPlan}`"
      @close="handleOutfitsClose"
      @apply="handleOutfitsApply"
    />
    
    <!-- Poses -->
    <PosesPage
      :is-open="posesOpen"
      :plan="selectedPlan"
      :source-context="`generator-${selectedPlan}`"
      @close="handlePosesClose"
      @apply="handlePosesApply"
    />
  </div>
</template>

<script setup>
import BackdropsPage from '@/pages/generator/optionsPages/BackdropsPage.vue';
import HairstylesPage from '@/pages/generator/optionsPages/HairstylesPage.vue';
import OutfitsPage from '@/pages/generator/optionsPages/OutfitsPage.vue';
import PosesPage from '@/pages/generator/optionsPages/PosesPage.vue';

// 状态管理
const backdropsOpen = ref(false);
const hairstylesOpen = ref(false);
const outfitsOpen = ref(false);
const posesOpen = ref(false);

// 事件处理
const handleBackdropsClose = (payload) => {
  backdropsOpen.value = false;
  console.log('Backdrops selection:', payload);
};

// ... 其他处理函数
</script>
```

## 优势

### 1. 代码复用
- 所有选项页面共享相同的逻辑
- 减少重复代码
- 统一的行为和体验

### 2. 易于维护
- 修改一处，所有页面同步更新
- 集中管理核心逻辑
- 降低维护成本

### 3. 易于扩展
- 添加新的选项类型只需创建新的包装组件
- 无需重复实现逻辑
- 保持一致性

### 4. 类型安全
- TypeScript 类型定义
- 编译时类型检查
- 更好的 IDE 支持

## 数据流

```
1. 用户打开页面
   ↓
2. 尝试从 localStorage 加载选择
   ↓
3. 如果没有，使用 initialSelection
   ↓
4. 加载图片数据（fetchDemoOptionsImages）
   ↓
5. 用户选择/取消选择
   ↓
6. 自动保存到 localStorage
   ↓
7. 用户关闭页面
   ↓
8. 触发 close 和 apply 事件，返回选择结果
```

## localStorage 键格式

```
{optionType}_selection_{sourceContext}
```

### 示例

- `backdrops_selection_generator-20P`
- `hairstyles_selection_generator-40P`
- `outfits_selection_generator-20P`
- `poses_selection_generator-40P`

这样不同的 tab 和不同的选项类型都有独立的存储空间。

## 注意事项

1. **sourceContext 的重要性**
   - 必须为每个使用场景提供唯一的 `sourceContext`
   - 建议格式：`{页面}-{tab}`
   - 例如：`generator-20P`, `generator-40P`

2. **folderStyle 的使用**
   - 只有 Backdrops 使用文件夹样式（层叠效果）
   - 其他选项页面使用普通卡片样式

3. **API 依赖**
   - 依赖 `fetchDemoOptionsImages` API
   - 需要确保 API 支持所有选项类型

4. **事件处理**
   - 必须同时处理 `close` 和 `apply` 事件
   - `close` 在关闭时触发
   - `apply` 在应用选择时触发

## 未来扩展

### 添加新的选项类型

1. 在 `OptionsPage` 的 `optionType` 类型中添加新类型
2. 创建新的包装组件（如 `NewOptionPage.vue`）
3. 设置对应的 `pageTitle` 和 `folderStyle`
4. 在使用的地方导入和使用

### 示例：添加 Lighting 选项

```vue
<!-- LightingPage.vue -->
<template>
    <OptionsPage
        :is-open="isOpen"
        option-type="lighting"
        page-title="Lighting"
        :plan="plan"
        :initial-selection="initialSelection"
        :source-context="sourceContext"
        :folder-style="false"
        @close="$emit('close', $event)"
        @apply="$emit('apply', $event)"
    />
</template>

<script setup lang="ts">
import OptionsPage from './OptionsPage.vue';
// ... props 和 emits 定义
</script>
```

就这么简单！
