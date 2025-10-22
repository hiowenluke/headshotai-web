# 新用户设置功能文档

## 功能概述

实现了新用户初始设置功能，包括：
1. 服务端提供新用户初始配置
2. 客户端自动加载并应用配置
3. 选项页面智能排序和默认选择

---

## 1. 服务端接口

### 文件: `server/api/new_user.py`

**Blueprint**: `new_user_api`

**路由**: `GET /api/new_user`

**返回数据结构**：
```json
{
  "options_card_sel_number": {
    "20P": {
      "backdrops": 3,
      "hairstyles": 3,
      "poses": 3,
      "outfits": 3
    },
    "40P": {
      "backdrops": 5,
      "hairstyles": 5,
      "poses": 5,
      "outfits": 5
    },
    "80P": {
      "backdrops": 8,
      "hairstyles": 8,
      "poses": 8,
      "outfits": 8
    }
  }
}
```

**注册**: 在 `server/app.py` 中注册 blueprint
```python
from api.new_user import bp as new_user_bp
app.register_blueprint(new_user_bp)
```

---

## 2. 客户端实现

### 2.1 客户端服务 (`src/services/userSettingsService.ts`)

**功能**：
- 调用服务端 API 获取新用户设置
- 提供类型定义
- **不包含默认值**（如果 API 失败会抛出错误）

**API**：
```typescript
import { fetchNewUserSettings } from '@/services/userSettingsService';

try {
  const settings = await fetchNewUserSettings();
  // 返回: NewUserSettings 对象
} catch (error) {
  // 处理错误
}
```

**设计原则**：
- ✅ 只负责 API 调用
- ✅ 不包含业务逻辑
- ✅ 错误由调用者处理

### 2.2 状态管理 (`src/state/newUserSettings.ts`)

**功能**：
- 存储从服务器获取的新用户设置
- 提供获取特定 plan 配置的方法
- **不包含回退默认值**（服务端不可用时整个应用不可用）

**API**：
```typescript
// 加载新用户设置
await loadNewUserSettings();

// 获取指定 plan 的配置
try {
  const counts = getOptionsCardSelNumber('20P');
  // 返回: { backdrops: 3, hairstyles: 3, poses: 3, outfits: 3 }
} catch (error) {
  // 设置未加载，需要处理错误
}
```

**错误处理**：
- 如果 API 调用失败，`loadNewUserSettings()` 不会设置 `isLoaded = true`
- 如果设置未加载，`getOptionsCardSelNumber()` 会抛出错误
- 调用者需要处理这些错误情况

**设计原则**：
- ✅ 依赖服务端：本项目完全基于服务端，服务端不可用时应用不可用
- ✅ 明确错误：通过抛出错误明确告知调用者问题
- ✅ 无回退值：不在客户端硬编码默认值

### 2.3 自动加载 (`src/state/authState.ts`)

**时机**：用户登录后自动加载

```typescript
// 在 refreshSession() 中
if (data.authenticated) {
    // ... 设置用户信息
    
    // 登录后加载新用户设置
    const { loadNewUserSettings } = await import('@/state/newUserSettings');
    await loadNewUserSettings();
}
```

### 2.4 Generator20P 初始化 (`src/pages/generator/tabcontent/Generator20P.vue`)

**功能**：根据新用户设置初始化 counter

```typescript
onMounted(async () => {
    // 从新用户设置初始化 counter
    const { getOptionsCardSelNumber } = await import('@/state/newUserSettings');
    const defaultCounts = getOptionsCardSelNumber('20P');
    
    // 只在 counter 为 0 时设置默认值（表示第一次访问）
    if (selectionCounts.Backdrops === 0) {
        selectionCounts.Backdrops = defaultCounts.backdrops; // 3
    }
    // ... 其他选项类似
});
```

### 2.5 OptionsPageBase 智能行为 (`src/pages/generator/optionsPages/OptionsPageBase.vue`)

**功能**：
1. 第一次访问：默认选中前 n 个卡片
2. 非第一次访问：已选择的卡片排在前面

**实现**：
```typescript
// 获取默认选择数量
const getDefaultSelectionCount = () => {
    const counts = getOptionsCardSelNumber(props.plan);
    return counts[props.optionType]; // 例如：3
};

// 传递给数据管理
const dataManagement = useOptionsData(
    props.optionType,
    props.initialSelection,
    defaultCount // 3
);
```

---

## 3. 数据源策略

### 3.1 单一数据源原则

**设计理念**：
- ✅ 服务端是唯一的数据源
- ✅ 客户端不包含任何硬编码的默认值
- ✅ 服务端不可用时，应用不可用（这是合理的）

**数据流**：
```
服务端（唯一数据源）
    ↓
server/api/new_user.py
    ↓ HTTP GET /api/new_user
src/services/userSettingsService.ts
    ↓ 成功？
    ├─ 是 → 存储到 state
    └─ 否 → 抛出错误
         ↓
    应用层处理错误
    （用户需要手动选择）
```

### 3.2 为什么不需要客户端回退默认值？

**原因**：
1. **项目完全基于服务端**
   - 图片存储在服务端
   - 用户认证在服务端
   - 所有业务逻辑在服务端

2. **服务端不可用 = 应用不可用**
   - 无法加载图片
   - 无法生成照片
   - 无法保存数据

3. **客户端回退值没有意义**
   - 即使有默认值，也无法完成任何操作
   - 反而会给用户错误的预期

**结论**：不在客户端硬编码任何默认值

### 3.3 错误处理策略

| 场景 | 处理方式 |
|------|---------|
| API 调用失败 | 记录错误，不设置默认值 |
| 设置未加载 | 抛出错误，由调用者处理 |
| 用户未登录 | 不加载设置，功能降级 |

## 4. 数据流

### 4.1 第一次访问流程

```
用户登录
    ↓
加载新用户设置 (loadNewUserSettings)
    ↓
进入 Generator20P
    ↓
初始化 counter = 3 (从新用户设置)
    ↓
打开 BackdropsPage
    ↓
检测到第一次访问 (isFirstVisit = true)
    ↓
加载卡片数据
    ↓
自动选中前 3 个卡片 (getDefaultSelection)
    ↓
用户看到已选中的卡片
```

### 3.2 非第一次访问流程

```
用户登录
    ↓
进入 Generator20P
    ↓
counter 显示上次的选择数量 (例如 5)
    ↓
打开 BackdropsPage (传入 initialSelection)
    ↓
检测到非第一次访问 (isFirstVisit = false)
    ↓
加载卡片数据
    ↓
智能排序：已选择的卡片排在前面 (sortCardsBySelection)
    ↓
用户看到之前选择的卡片在最前面
```

---

## 4. 关键优化

### 4.1 同步排序

**问题**：如果在渲染后才排序，用户会看到卡片突然跳动

**解决**：在数据加载完成后立即排序，然后再设置到 reactive 状态

```typescript
// ✅ 正确：先排序，再设置状态
let cards = result.images;
if (!isFirstVisit) {
    cards = sortCardsBySelection(cards, category);
}
cardDataMap.value[category] = cards; // 一次性设置

// ❌ 错误：先设置状态，再排序
cardDataMap.value[category] = result.images;
// ... 延迟后排序，用户会看到跳动
```

### 4.2 默认选择时机

**时机**：在第一个分类加载完成后立即应用

```typescript
useBackdropLifecycle(
    toRef(props, 'isOpen'),
    currentFlatIndex,
    flatMenus,
    async (category: string) => {
        await loadCategory(category); // 加载数据
        
        // 立即应用默认选择
        if (isFirstVisit && Object.keys(selectedMap.value).length === 0) {
            const defaultSelection = getDefaultSelection();
            initializeSelection(defaultSelection);
        }
    }
);
```

### 4.3 性能优化

1. **懒加载**：新用户设置模块按需导入
2. **缓存**：设置加载后缓存，不重复请求
3. **同步操作**：排序和选择都在数据加载阶段完成

---

## 5. 配置说明

### 5.1 修改默认选择数量

**服务端**：修改 `/api/new_user` 返回的数据

**客户端回退值**：
```typescript
// src/pages/generator/optionsPages/OptionsPageBase.vue
const defaults: Record<string, number> = {
    '20P': 3,  // 修改这里
    '40P': 5,
    '80P': 8
};
```

### 5.2 添加新的 Plan

1. 在服务端添加新的 plan 配置
2. 更新 TypeScript 类型：
```typescript
// src/services/imageService.ts
export interface NewUserSettings {
  options_card_sel_number: {
    '20P': { ... };
    '40P': { ... };
    '80P': { ... };
    '100P': { ... }; // 新增
  };
}
```

---

## 6. 测试清单

### 6.1 第一次访问测试

- [ ] 登录后，新用户设置成功加载
- [ ] Generator20P 的 counter 显示为 3
- [ ] 打开 BackdropsPage，前 3 个卡片自动选中
- [ ] 打开 HairstylesPage，前 3 个卡片自动选中
- [ ] 打开 OutfitsPage，前 3 个卡片自动选中
- [ ] 打开 PosesPage，前 3 个卡片自动选中
- [ ] 卡片选中状态立即显示，无延迟或跳动

### 6.2 非第一次访问测试

- [ ] 选择 5 个 backdrops，关闭页面
- [ ] 重新打开 BackdropsPage
- [ ] 之前选择的 5 个卡片排在最前面
- [ ] 卡片顺序立即正确，无延迟或跳动
- [ ] counter 显示为 5

### 6.3 切换 Plan 测试

- [ ] Generator40P 的 counter 显示为 5
- [ ] 打开选项页面，前 5 个卡片自动选中
- [ ] Generator80P 的 counter 显示为 8
- [ ] 打开选项页面，前 8 个卡片自动选中

### 6.4 错误处理测试

- [ ] API 请求失败时，使用默认值
- [ ] 未登录时，使用默认值
- [ ] 网络错误时，功能正常降级

---

## 7. 故障排查

### 问题 1：Counter 没有初始化

**检查**：
1. 新用户设置是否成功加载？
2. `getOptionsCardSelNumber` 是否返回正确的值？
3. `onMounted` 中的初始化代码是否执行？

### 问题 2：卡片没有默认选中

**检查**：
1. `isFirstVisit` 是否正确判断？
2. `getDefaultSelection` 是否返回正确的数据？
3. `initializeSelection` 是否被调用？

### 问题 3：卡片排序有延迟

**检查**：
1. 排序是否在 `loadCategory` 中同步完成？
2. 是否在设置状态后才排序？（应该先排序再设置）

### 问题 4：已选择的卡片没有排在前面

**检查**：
1. `initialSelection` 是否正确传递？
2. `sortCardsBySelection` 是否正确实现？
3. `isFirstVisit` 判断是否正确？

---

## 8. 未来扩展

### 8.1 个性化推荐

可以基于用户历史选择，推荐相似的卡片：

```typescript
function getRecommendedCards(userHistory: string[]): string[] {
    // 基于用户历史推荐
}
```

### 8.2 A/B 测试

可以测试不同的默认选择数量：

```typescript
const defaultCount = getABTestVariant() === 'A' ? 3 : 5;
```

### 8.3 用户偏好学习

可以记录用户的选择模式，动态调整默认值：

```typescript
function learnUserPreference(selections: Record<string, string[]>) {
    // 学习用户偏好
}
```

---

**创建日期**: 2025-01-13  
**状态**: 已实现  
**版本**: 1.0
