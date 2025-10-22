# 类型定义组织策略

## 问题

**原始问题**：`NewUserSettings` 类型定义应该放在哪里？
- `src/services/userSettingsService.ts`？
- `src/state/newUserSettings.ts`？

## 解决方案

### ✅ 采用方案：独立的 types 文件

```
src/types/userSettings.ts
    ↓ 导入
    ├─ src/services/userSettingsService.ts
    └─ src/state/newUserSettings.ts
```

## 文件结构

### 1. 类型定义层 (`src/types/userSettings.ts`)

**职责**：
- ✅ 定义所有用户设置相关的类型
- ✅ 可被多个模块导入
- ✅ 不包含任何实现逻辑

**内容**：
```typescript
export interface NewUserSettings { ... }
export type PlanType = '20P' | '40P' | '80P';
export type OptionType = 'backdrops' | 'hairstyles' | 'poses' | 'outfits';
```

### 2. 服务层 (`src/services/userSettingsService.ts`)

**职责**：
- ✅ 调用 API
- ✅ 导入类型定义
- ❌ 不定义类型

**内容**：
```typescript
import type { NewUserSettings } from '@/types/userSettings';

export async function fetchNewUserSettings(): Promise<NewUserSettings> {
  // API 调用
}
```

### 3. 状态层 (`src/state/newUserSettings.ts`)

**职责**：
- ✅ 管理状态
- ✅ 导入类型定义
- ❌ 不定义类型

**内容**：
```typescript
import type { NewUserSettings, PlanType } from '@/types/userSettings';

const state = reactive<{ settings: NewUserSettings | null }>({ ... });
```

## 设计原则

### 1. 单一职责原则

| 层级 | 职责 | 是否定义类型 |
|------|------|-------------|
| Types | 定义类型 | ✅ 是 |
| Service | API 调用 | ❌ 否 |
| State | 状态管理 | ❌ 否 |

### 2. 依赖方向

```
Types（底层，无依赖）
    ↑
Service（依赖 Types）
    ↑
State（依赖 Types + Service）
    ↑
Components（依赖 State）
```

### 3. 可复用性

**优点**：
- ✅ 类型可以被任何模块导入
- ✅ 避免循环依赖
- ✅ 易于维护和扩展

**示例**：
```typescript
// 其他模块也可以使用这些类型
import type { PlanType, OptionType } from '@/types/userSettings';

function someFunction(plan: PlanType, option: OptionType) {
  // ...
}
```

## 对比其他方案

### ❌ 方案 A：类型定义在 Service 层

```typescript
// src/services/userSettingsService.ts
export interface NewUserSettings { ... }  // ❌ Service 层定义类型

// src/state/newUserSettings.ts
import { type NewUserSettings } from '@/services/userSettingsService';  // ⚠️ State 依赖 Service 的类型
```

**问题**：
- State 层必须依赖 Service 层才能获取类型
- 类型与 API 实现耦合

### ❌ 方案 B：类型定义在 State 层

```typescript
// src/state/newUserSettings.ts
export interface NewUserSettings { ... }  // ❌ State 层定义类型

// src/services/userSettingsService.ts
import { type NewUserSettings } from '@/state/newUserSettings';  // ❌ Service 依赖 State（依赖反转）
```

**问题**：
- 违反分层原则（下层依赖上层）
- Service 层不应该依赖 State 层

## 项目中的应用

### 当前类型文件

```
src/types/
├── userSettings.ts          ✅ 用户设置类型
└── (其他类型文件...)
```

### 未来扩展

可以继续添加其他类型文件：

```
src/types/
├── userSettings.ts          # 用户设置
├── imageTypes.ts            # 图片相关
├── generatorTypes.ts        # 生成器相关
└── apiTypes.ts              # API 响应类型
```

## 最佳实践

### ✅ 推荐

1. **类型定义独立**
   ```typescript
   // src/types/xxx.ts
   export interface XXX { ... }
   ```

2. **按功能模块组织**
   ```
   src/types/
   ├── userSettings.ts
   ├── images.ts
   └── generator.ts
   ```

3. **使用 type 导入**
   ```typescript
   import type { NewUserSettings } from '@/types/userSettings';
   ```

### ❌ 避免

1. **在实现文件中定义类型**
   ```typescript
   // ❌ 不要这样
   // src/services/xxx.ts
   export interface XXX { ... }
   export function fetchXXX() { ... }
   ```

2. **循环依赖**
   ```typescript
   // ❌ 不要这样
   // A 导入 B 的类型，B 又导入 A 的类型
   ```

3. **类型散落各处**
   ```typescript
   // ❌ 不要这样
   // 同一个类型在多个文件中重复定义
   ```

## 总结

**为什么选择独立的 types 文件？**

1. ✅ **清晰的职责分离**：类型定义与实现分离
2. ✅ **避免循环依赖**：类型层不依赖任何其他层
3. ✅ **易于复用**：任何模块都可以导入类型
4. ✅ **易于维护**：类型集中管理
5. ✅ **符合最佳实践**：大型项目的标准做法

---

**日期**: 2025-01-13  
**结论**: 类型定义应该放在独立的 `src/types/` 目录中
