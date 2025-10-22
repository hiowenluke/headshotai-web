# 卡片布局缓存分析

## 发现的优化

### 1. CardList 组件已实现布局缓存 ✅

**位置**: `src/components/cardList/CardList.vue`

**功能**:
- ✅ 测量卡片高度并缓存到 localStorage
- ✅ 下次打开时使用缓存值，避免布局跳动
- ✅ 根据缓存计算更准确的 skeleton 数量

**实现**:
```typescript
// 缓存 key 生成
const cacheKeyForViewport = () => {
  const vw = Math.max(320, Math.round((window.innerWidth || 390)));
  const bucket = Math.floor(vw / 20) * 20;
  return `home_card_layout_${CACHE_VERSION}_${bucket}`;
};

// 读取缓存
function readCache() {
  const key = cacheKeyForViewport();
  const raw = localStorage.getItem(key);
  return JSON.parse(raw);
}

// 写入缓存
function writeCache(data: LayoutCache) {
  const key = cacheKeyForViewport();
  localStorage.setItem(key, JSON.stringify(data));
}
```

---

## 问题分析

### 问题 1: 缓存 key 硬编码 ❌

**当前代码**:
```typescript
return `home_card_layout_${CACHE_VERSION}_${bucket}`;  // ❌ 硬编码 "home"
```

**问题**:
- 所有使用 CardList 的页面共享同一个缓存
- 主页、OptionsPage、其他页面的卡片布局可能不同
- 缓存冲突导致布局不准确

**影响的页面**:
1. **主页** (homepage/index.vue) - 使用 CardList ✅
2. **OptionsPage** (通过 CategoryPanels) - 使用 CardList ✅
3. **FaceUploadedPage** - 不使用 CardList，使用自定义网格 ❌

---

## 解决方案

### 方案: 为 CardList 添加 instanceKey prop

**目标**:
- 不同页面使用不同的缓存 key
- 避免缓存冲突
- 最小代码改动

**实现**:

#### 1. 修改 CardList.vue

```typescript
const props = withDefaults(defineProps<{
  // ... 其他 props
  instanceKey?: string;  // 新增：实例唯一标识
}>(), {
  instanceKey: 'default'  // 默认值
});

const cacheKeyForViewport = () => {
  const vw = Math.max(320, Math.round((window.innerWidth || 390)));
  const bucket = Math.floor(vw / 20) * 20;
  // ✅ 使用 instanceKey 而不是硬编码 "home"
  return `card_layout_${props.instanceKey}_${CACHE_VERSION}_${bucket}`;
};
```

#### 2. 在各个页面传入 instanceKey

**主页**:
```vue
<CardList instance-key="home" ... />
```

**OptionsPage (通过 CategoryPanels)**:
```vue
<CategoryPanels instance-key="options-backdrops" ... />
<!-- CategoryPanels 需要将 instanceKey 传递给内部的 CardList -->
```

**FaceUploadedPage**:
- 不使用 CardList，不需要修改

---

## 各页面使用情况

### 1. 主页 (homepage/index.vue)

**使用**: CardList ✅  
**当前缓存 key**: `home_card_layout_v1_380`  
**建议 instanceKey**: `"home"`  
**需要修改**: 否（已经是 home）

### 2. OptionsPage (OptionsPageBase.vue)

**使用**: CategoryPanels → CardList ✅  
**当前缓存 key**: `home_card_layout_v1_380` ❌（与主页冲突）  
**建议 instanceKey**: 
- BackdropsPage: `"options-backdrops"`
- HairstylesPage: `"options-hairstyles"`
- OutfitsPage: `"options-outfits"`
- PosesPage: `"options-poses"`

**需要修改**: 是

### 3. FaceUploadedPage

**使用**: 自定义网格布局 ❌  
**当前缓存**: 无  
**建议**: 可以添加类似的布局缓存机制  
**需要修改**: 可选（低优先级）

---

## 实施计划

### 第一阶段: 修复 CardList 缓存冲突（高优先级）

1. ✅ 修改 `CardList.vue`
   - 添加 `instanceKey` prop
   - 使用 `instanceKey` 生成缓存 key

2. ✅ 修改 `CategoryPanels.vue`
   - 添加 `instanceKey` prop
   - 传递给内部的 `CardList`

3. ✅ 修改 `OptionsPageBase.vue`
   - 添加 `instanceKey` prop
   - 传递给 `CategoryPanels`

4. ✅ 修改各个 OptionsPage
   - BackdropsPage: `instance-key="options-backdrops"`
   - HairstylesPage: `instance-key="options-hairstyles"`
   - OutfitsPage: `instance-key="options-outfits"`
   - PosesPage: `instance-key="options-poses"`

5. ✅ 修改主页
   - 明确传入 `instance-key="home"`

### 第二阶段: 为 FaceUploadedPage 添加布局缓存（可选）

1. 提取布局缓存逻辑为 composable
2. 在 FaceUploadedPage 中应用
3. 测试效果

---

## 预期效果

### 修复前 ❌
```
主页打开 → 缓存 key: home_card_layout_v1_380
OptionsPage 打开 → 缓存 key: home_card_layout_v1_380  ❌ 冲突
主页再次打开 → 读取缓存 → 使用了 OptionsPage 的布局 ❌ 错误
```

### 修复后 ✅
```
主页打开 → 缓存 key: card_layout_home_v1_380
OptionsPage 打开 → 缓存 key: card_layout_options-backdrops_v1_380  ✅ 独立
主页再次打开 → 读取缓存 → 使用主页自己的布局 ✅ 正确
```

---

## 缓存 key 命名规范

**格式**: `card_layout_{instanceKey}_{version}_{viewportBucket}`

**示例**:
- 主页: `card_layout_home_v1_380`
- Backdrops: `card_layout_options-backdrops_v1_380`
- Hairstyles: `card_layout_options-hairstyles_v1_380`
- Outfits: `card_layout_options-outfits_v1_380`
- Poses: `card_layout_options-poses_v1_380`

---

## 总结

### 当前状态
- ✅ CardList 已实现布局缓存
- ❌ 所有页面共享同一个缓存 key（冲突）
- ❌ FaceUploadedPage 没有布局缓存

### 需要做的
1. **高优先级**: 为 CardList 添加 instanceKey，避免缓存冲突
2. **低优先级**: 为 FaceUploadedPage 添加布局缓存

---

**日期**: 2025-01-13  
**状态**: 待实施
