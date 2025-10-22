# FaceUploadedPage 布局缓存优化

## 📋 优化目标

为 FaceUploadedPage 的卡片列表添加布局缓存，减少首次渲染时的布局抖动，提升用户体验。

## 🎯 实现方案

### 1. 布局缓存机制

参考 CardList.vue 的实现，为 FaceUploadedPage 添加类似的布局缓存：

- **缓存内容**：卡片尺寸（cardSize）
- **缓存 Key**：`card_layout_face-uploaded_v1_{viewport_bucket}`
- **视口分桶**：以 20px 为粒度，避免细微差异导致缓存失效

### 2. 缓存流程

```
页面打开
  ↓
读取 localStorage 缓存
  ↓
应用缓存的卡片尺寸（如果存在）
  ↓
数据加载完成后测量实际尺寸
  ↓
更新缓存（如果尺寸有变化）
```

### 3. 关键实现

#### 缓存读写
```typescript
// 缓存 Key 生成
const cacheKeyForViewport = () => {
  const vw = Math.max(320, Math.round((window.innerWidth || 390)));
  const bucket = Math.floor(vw / 20) * 20;
  return `card_layout_face-uploaded_v1_${bucket}`;
};

// 读取缓存
function readCache(): LayoutCache | null {
  const key = cacheKeyForViewport();
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

// 写入缓存
function writeCache(data: LayoutCache) {
  const key = cacheKeyForViewport();
  localStorage.setItem(key, JSON.stringify({ ...data, ts: Date.now() }));
}
```

#### 测量与缓存
```typescript
async function measureAndCache() {
  await nextTick();
  const cardEl = document.querySelector('.faces-grid .face-card');
  if (!cardEl) return;
  
  const cardRect = cardEl.getBoundingClientRect();
  const cardSize = Math.round(cardRect.width);
  
  // 只在尺寸变化超过 1px 时更新缓存
  if (!cached.value || Math.abs(cached.value.cardSize - cardSize) > 1) {
    cached.value = { cardSize, ts: Date.now() };
    writeCache(cached.value);
  }
}
```

#### 触发时机
```typescript
// 1. 组件挂载时读取缓存
onMounted(() => {
  cached.value = readCache();
  window.addEventListener('resize', handleResize);
});

// 2. 数据加载完成后测量
watch(() => faces.value.length, (newLen, oldLen) => {
  if (newLen > 0 && oldLen === 0) {
    setTimeout(measureAndCache, 100);
    setTimeout(measureAndCache, 500);
  }
});

// 3. 窗口大小变化时重新测量
function handleResize() {
  measureAndCache();
}
```

## 📊 布局特点

### FaceUploadedPage vs CardList

| 特性 | FaceUploadedPage | CardList |
|------|------------------|----------|
| 布局方式 | CSS Grid (3列) | Ionic Grid (2列) |
| 卡片比例 | 1:1 (正方形) | 4:5 (竖向) |
| 缓存内容 | cardSize | cardHeight |
| 实例标识 | `face-uploaded` | `home` / `options-*` |

## ✅ 优化效果

1. **减少布局抖动**：首次打开时使用缓存的尺寸，避免卡片大小突变
2. **提升加载体验**：后续打开页面时立即应用正确的布局
3. **响应式适配**：不同视口宽度使用独立的缓存
4. **向后兼容**：缓存不存在时正常降级，不影响功能

## 🔄 缓存版本管理

- **当前版本**：`v1`
- **升级策略**：修改 `CACHE_VERSION` 常量即可使旧缓存失效
- **清理策略**：浏览器自动管理 localStorage，无需手动清理

## 🎯 未来扩展

当创建其他 UploadedPage 时（如 BackdropUploadedPage），可以：
1. 复用相同的缓存机制
2. 使用不同的 `INSTANCE_KEY`（如 `backdrop-uploaded`）
3. 根据需要调整缓存内容（如支持不同的列数、宽高比）

## 📝 注意事项

1. **缓存粒度**：20px 的视口分桶平衡了缓存命中率和精确度
2. **测量延迟**：使用 100ms 和 500ms 两次延迟测量，确保图片加载后的准确尺寸
3. **容错处理**：所有缓存操作都有 try-catch 保护，失败时静默降级
