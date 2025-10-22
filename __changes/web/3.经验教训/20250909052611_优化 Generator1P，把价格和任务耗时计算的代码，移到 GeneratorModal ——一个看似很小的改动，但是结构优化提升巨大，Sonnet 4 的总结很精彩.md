把 Generator1P 中，价格和任务耗时计算的代码，移到 GeneratorModal 中，由 GeneratorModal 决定在 tab 切换后，计算价格和任务耗时，并通知当前 tab （例如 Generator1P、Generator20P、GeneratorDIY），由当前 tab 决定在它内部如何展示。

## Sonnet 4：

我需要将价格和任务耗时计算的逻辑从 Generator1P 移动到 __mainPage.vue（GeneratorModal）中，然后通过 props 传递给各个 tab 组件。

。。。

## 🎯 **价格和任务耗时计算逻辑重构完成总结**

### ✅ **重构内容**：

#### 1. **__mainPage.vue（GeneratorModal）** - 中央计算中心

- 🔧 **新增功能**：
  - `selectedCounts` - 管理所有 tab 的选中数量状态
  - `currentSelectedCount` - 当前 tab 的选中数量
  - [generateLabel](vscode-file://vscode-app/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) - 生成按钮标签计算
  - `priceBase`、`totalPrice`、[priceString](vscode-file://vscode-app/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) - 价格计算链
  - `etaSeconds`、[formattedEta](vscode-file://vscode-app/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) - 耗时计算和格式化
  - [pricePillClass](vscode-file://vscode-app/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) - 价格标签样式类计算
  - `handleSelectedCountChange` - 处理选中数量变化

#### 2. **[Generator1P.vue](vscode-file://vscode-app/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html)** - 简化的 1P 生成器

- 🔄 **移除的逻辑**：
  - ❌ 价格计算逻辑（`priceBase`、`totalPrice`、[priceString](vscode-file://vscode-app/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html)）
  - ❌ 耗时计算逻辑（`etaSeconds`、[formattedEta](vscode-file://vscode-app/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html)）
  - ❌ 按钮样式计算逻辑（[pricePillClass](vscode-file://vscode-app/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html)）
  - ❌ 生成标签计算逻辑（[generateLabel](vscode-file://vscode-app/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html)）
- 🔧 **保留的逻辑**：
  - ✅ 选中数量计算（`selectedCount`）
  - ✅ 选中数量变化监听和上报
  - ✅ 生成按钮控制和其他业务逻辑
- 📥 **新增 Props**：
  - [generateLabel](vscode-file://vscode-app/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) - 从父组件接收生成按钮标签
  - [priceString](vscode-file://vscode-app/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) - 从父组件接收价格字符串
  - [formattedEta](vscode-file://vscode-app/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) - 从父组件接收格式化的耗时
  - [pricePillClass](vscode-file://vscode-app/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) - 从父组件接收价格标签样式类

#### 3. **其他 Tab 组件（Generator20P、Generator40P、Generator80P、GeneratorDIY）**

- 🔄 **统一更新**：
  - ❌ 移除了直接访问 `priceMap` 和 `etaMap` 的逻辑
  - ✅ 改为接收父组件计算后的结果（[priceString](vscode-file://vscode-app/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html)、[formattedEta](vscode-file://vscode-app/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html)）
  - ✅ 添加了 `selectedCountChange` 事件上报
  - ✅ 在 `onMounted` 中初始化选中数量为 1

#### 4. **类型定义更新（generator.ts）**

- 🔄 **GeneratorProps 接口重构**：
  - ❌ 移除了 `priceMap`、`etaMap` 原始数据传递
  - ✅ 改为传递计算后的结果数据

### 🏗️ **架构优势**：

1. **中央化计算**：
   - ✅ 所有价格和耗时计算逻辑集中在 GeneratorModal 中
   - ✅ 避免了各个 tab 组件重复计算逻辑
   - ✅ 确保计算逻辑的一致性
2. **响应式更新**：
   - ✅ Tab 切换时自动重新计算价格和耗时
   - ✅ 选中数量变化时实时更新计算结果
   - ✅ 所有 tab 都能获得最新的计算结果
3. **组件解耦**：
   - ✅ Tab 组件只需要关注自己的展示逻辑
   - ✅ 计算逻辑与展示逻辑分离，便于维护
   - ✅ 新增 tab 组件时只需遵循统一接口
4. **数据流清晰**：
   - 📊 **向上流**：`selectedCountChange` 事件上报选中数量
   - 📊 **向下流**：计算后的 props 传递给 tab 组件
   - 📊 **单向数据流**：避免了双向绑定的复杂性

### 🎨 **用户体验改进**：

- ✅ Tab 切换时价格和耗时信息立即更新
- ✅ 选中数量变化时价格实时响应
- ✅ 所有 tab 都有一致的价格显示格式
- ✅ 计算结果缓存，避免重复计算

现在架构更加清晰，计算逻辑集中管理，各个 tab 组件职责明确，便于后续的维护和扩展！