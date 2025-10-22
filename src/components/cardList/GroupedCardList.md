# GroupedCardList 组件文档

**日期**: 2025-10-16  
**状态**: ✅ 已完成  
**目的**: 创建一个支持分类分组显示的 3 列卡片列表组件

---

## 组件概述

`GroupedCardList` 是一个基于 `FiniteCardList3` 样式的新组件，支持按分类自动分组显示卡片。

### 为什么创建新组件？

1. **单一职责原则** - `FiniteCardList3` 负责简单列表，`GroupedCardList` 负责分组列表
2. **避免过度耦合** - 不通过参数切换模式，保持组件简单
3. **更好的可维护性** - 两个独立组件更容易理解和维护
4. **样式复用** - 复用 `FiniteCardList3` 的卡片样式

---

## 功能特性

### 1. 自动分类解析 ✅
从图片 URL 中自动提取分类名称：
- 输入: `"images/demo/options/backdrops/1@Studio/photo1.webp"`
- 提取: `"1@Studio"`

### 2. 分类名称处理 ✅
- 去重：确保分类名称唯一
- 排序：按字符串正序排序
- 格式化：
  - 去掉开头的 `{id}@` 格式（例如 `"1@"` → `""`）
  - 将 `-` 替换为空格（例如 `"Executive-Office"` → `"Executive Office"`）

### 3. 分组显示 ✅
- 分组标题独占一行
- 每个分组下的卡片以 3 列网格显示
- 支持选中状态
- 支持加载、错误、空状态

---

## Props

```typescript
interface Props {
  items: CardItem[];           // 卡片数据列表
  baseUrl: string;             // 图片 URL 根目录
  selectedUrls?: string[];     // 选中的 URL 列表
  aspectRatio?: number;        // 卡片宽高比，默认 1
  selectable?: boolean;        // 是否可选中，默认 false
  loading?: boolean;           // 加载状态
  loadingText?: string;        // 加载文本
  error?: string | null;       // 错误信息
  showRetry?: boolean;         // 是否显示重试按钮
  emptyText?: string;          // 空状态文本
}
```

### CardItem 接口

```typescript
interface CardItem {
  url: string;                 // 图片 URL（完整路径）
  displayName?: string;        // 显示名称（可选）
  [key: string]: any;          // 其他自定义属性
}
```

---

## Emits

```typescript
{
  toggle: [url: string];       // 切换选中状态
  retry: [];                   // 重试加载
}
```

---

## 使用示例

### 基本用法

```vue
<template>
  <GroupedCardList
    :items="backdropItems"
    base-url="images/demo/options/backdrops"
    :selected-urls="selectedUrls"
    :selectable="true"
    @toggle="handleToggle"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GroupedCardList from '@/components/cardList/GroupedCardList.vue';

const backdropItems = ref([
  { url: 'images/demo/options/backdrops/1@Studio/photo1.webp' },
  { url: 'images/demo/options/backdrops/1@Studio/photo2.webp' },
  { url: 'images/demo/options/backdrops/2@Executive-Office/photo1.webp' },
  { url: 'images/demo/options/backdrops/2@Executive-Office/photo2.webp' },
  { url: 'images/demo/options/backdrops/3@Standard-Office/photo1.webp' },
]);

const selectedUrls = ref<string[]>([]);

const handleToggle = (url: string) => {
  const index = selectedUrls.value.indexOf(url);
  if (index >= 0) {
    selectedUrls.value.splice(index, 1);
  } else {
    selectedUrls.value.push(url);
  }
};
</script>
```

### 带加载和错误处理

```vue
<template>
  <GroupedCardList
    :items="items"
    base-url="images/demo/options/backdrops"
    :loading="loading"
    :error="error"
    :show-retry="true"
    loading-text="Loading backdrops..."
    empty-text="No backdrops available."
    @retry="loadItems"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GroupedCardList from '@/components/cardList/GroupedCardList.vue';

const items = ref([]);
const loading = ref(false);
const error = ref<string | null>(null);

const loadItems = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // 加载数据
    const response = await fetch('/api/backdrops');
    items.value = await response.json();
  } catch (err) {
    error.value = 'Failed to load backdrops';
  } finally {
    loading.value = false;
  }
};
</script>
```

---

## 数据处理流程

### 输入数据

```typescript
const items = [
  { url: 'images/demo/options/backdrops/1@Studio/photo1.webp' },
  { url: 'images/demo/options/backdrops/1@Studio/photo2.webp' },
  { url: 'images/demo/options/backdrops/2@Executive-Office/photo1.webp' },
  { url: 'images/demo/options/backdrops/3@Standard-Office/photo1.webp' },
];

const baseUrl = 'images/demo/options/backdrops';
```

### 处理步骤

#### 1. 提取分类名称
```
"images/demo/options/backdrops/1@Studio/photo1.webp"
→ 移除 baseUrl: "1@Studio/photo1.webp"
→ 提取第一级目录: "1@Studio"
```

#### 2. 去重和排序
```
原始分类: ["1@Studio", "1@Studio", "2@Executive-Office", "3@Standard-Office"]
去重后: ["1@Studio", "2@Executive-Office", "3@Standard-Office"]
排序后: ["1@Studio", "2@Executive-Office", "3@Standard-Office"]
```

#### 3. 格式化分类名称
```
"1@Studio" → "Studio"
"2@Executive-Office" → "Executive Office"
"3@Standard-Office" → "Standard Office"
```

### 输出结果

```typescript
const groupedItems = [
  {
    category: "1@Studio",
    displayName: "Studio",
    items: [
      { url: 'images/demo/options/backdrops/1@Studio/photo1.webp' },
      { url: 'images/demo/options/backdrops/1@Studio/photo2.webp' }
    ]
  },
  {
    category: "2@Executive-Office",
    displayName: "Executive Office",
    items: [
      { url: 'images/demo/options/backdrops/2@Executive-Office/photo1.webp' }
    ]
  },
  {
    category: "3@Standard-Office",
    displayName: "Standard Office",
    items: [
      { url: 'images/demo/options/backdrops/3@Standard-Office/photo1.webp' }
    ]
  }
];
```

---

## 样式特性

### 布局
- **3 列网格布局** - 每行显示 3 个卡片
- **分组标题** - 独占一行，18px 字体，600 字重
- **卡片间距** - 8px gap
- **分组间距** - 32px gap

### 卡片样式
- **圆角** - 12px border-radius
- **阴影** - 0 10px 24px rgba(0, 0, 0, 0.35)
- **背景** - rgba(255, 255, 255, 0.08) + blur(14px)
- **选中状态** - 蓝色边框 + 蓝色阴影
- **勾选标记** - 右上角蓝色圆形勾选标记

### 交互
- **点击缩放** - active 时 scale(0.98)
- **平滑过渡** - 0.2s ease transition
- **选中动画** - 勾选标记淡入淡出

---

## 与 FiniteCardList3 的对比

| 特性 | FiniteCardList3 | GroupedCardList |
|------|----------------|-----------------|
| 布局 | 简单列表 | 分组列表 |
| 分类 | ❌ 不支持 | ✅ 自动分类 |
| 分组标题 | ❌ 无 | ✅ 有 |
| 加号按钮 | ✅ 支持 | ❌ 不支持 |
| 卡片名称 | ✅ 支持 | ❌ 不支持 |
| 角标 | ✅ 支持 | ❌ 不支持 |
| 选中状态 | ✅ 支持 | ✅ 支持 |
| 适用场景 | 简单列表 | 分类选项 |

---

## 适用场景

### ✅ 适合使用 GroupedCardList

1. **选项页面** - Backdrops、Poses、Outfits、Hairstyles
2. **分类图库** - 需要按类别组织的图片
3. **主题选择** - 按主题分组的选项
4. **模板库** - 按类型分组的模板

### ❌ 不适合使用 GroupedCardList

1. **上传的图片** - 使用 `FiniteCardList3`
2. **搜索结果** - 使用 `FiniteCardList3`
3. **最近使用** - 使用 `FiniteCardList3`
4. **需要加号按钮** - 使用 `FiniteCardList3`

---

## 性能优化

### 1. 计算缓存
使用 `computed` 缓存分组结果，只在 `items` 或 `baseUrl` 变化时重新计算。

### 2. 虚拟滚动（可选）
如果分组数量很多，可以考虑添加虚拟滚动：

```typescript
// 未来优化
import { useVirtualList } from '@vueuse/core';

const { list, containerProps, wrapperProps } = useVirtualList(
  groupedItems,
  { itemHeight: 200 }
);
```

### 3. 图片懒加载（可选）
可以添加图片懒加载：

```vue
<img :src="item.url" loading="lazy" alt="..." />
```

---

## 测试建议

### 单元测试

```typescript
describe('GroupedCardList', () => {
  it('should extract category from URL', () => {
    const url = 'images/demo/options/backdrops/1@Studio/photo1.webp';
    const baseUrl = 'images/demo/options/backdrops';
    const category = extractCategory(url, baseUrl);
    expect(category).toBe('1@Studio');
  });

  it('should format category name', () => {
    expect(formatCategoryName('1@Studio')).toBe('Studio');
    expect(formatCategoryName('2@Executive-Office')).toBe('Executive Office');
  });

  it('should group items by category', () => {
    const items = [
      { url: 'images/demo/options/backdrops/1@Studio/photo1.webp' },
      { url: 'images/demo/options/backdrops/1@Studio/photo2.webp' },
      { url: 'images/demo/options/backdrops/2@Office/photo1.webp' },
    ];
    const grouped = groupItems(items, 'images/demo/options/backdrops');
    expect(grouped).toHaveLength(2);
    expect(grouped[0].items).toHaveLength(2);
  });

  it('should sort categories', () => {
    const items = [
      { url: 'images/demo/options/backdrops/3@C/photo1.webp' },
      { url: 'images/demo/options/backdrops/1@A/photo1.webp' },
      { url: 'images/demo/options/backdrops/2@B/photo1.webp' },
    ];
    const grouped = groupItems(items, 'images/demo/options/backdrops');
    expect(grouped[0].category).toBe('1@A');
    expect(grouped[1].category).toBe('2@B');
    expect(grouped[2].category).toBe('3@C');
  });
});
```

### 集成测试

```typescript
describe('GroupedCardList Integration', () => {
  it('should render groups with titles', () => {
    const wrapper = mount(GroupedCardList, {
      props: {
        items: mockItems,
        baseUrl: 'images/demo/options/backdrops'
      }
    });
    
    expect(wrapper.findAll('.group')).toHaveLength(3);
    expect(wrapper.find('.group-title').text()).toBe('Studio');
  });

  it('should toggle selection on click', async () => {
    const wrapper = mount(GroupedCardList, {
      props: {
        items: mockItems,
        baseUrl: 'images/demo/options/backdrops',
        selectable: true
      }
    });
    
    await wrapper.find('.card').trigger('click');
    expect(wrapper.emitted('toggle')).toBeTruthy();
  });
});
```

---

## 总结

### 创建的文件
- ✅ `src/components/cardList/GroupedCardList.vue` - 新组件

### 功能特性
- ✅ 自动分类解析
- ✅ 分类名称格式化
- ✅ 分组显示（3 列网格）
- ✅ 选中状态支持
- ✅ 加载、错误、空状态
- ✅ 无编译错误

### 优势
- ✅ 单一职责，易于维护
- ✅ 样式复用 FiniteCardList3
- ✅ 自动化数据处理
- ✅ 类型安全

### 下一步
- 在 BackdropsPage、PosesPage 等页面中使用
- 测试功能是否正常
- 根据实际使用情况优化

---

**文档创建**: 2025-10-16  
**组件状态**: ✅ 已完成  
**测试状态**: ⏸️ 待测试
