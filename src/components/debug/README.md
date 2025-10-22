# DebugPanel 组件

一个用于真机调试的可视化调试面板组件，特别适用于iPhone等无法直接查看控制台的设备。

## 功能特性

- 📱 **真机友好**：在移动设备上可视化显示调试信息
- 🎛️ **可切换显示**：点击可隐藏/显示，不影响正常使用
- 📝 **自动时间戳**：每条日志自动添加时间戳
- 🔄 **自动滚动**：新日志自动滚动到底部
- 🎨 **经典样式**：绿色文字黑色背景的经典调试界面
- 🧹 **日志管理**：支持限制最大日志数量，自动清理旧日志

## 基本用法

```vue
<template>
  <div>
    <!-- 你的组件内容 -->
    
    <!-- 调试面板 -->
    <DebugPanel 
      ref="debugPanel"
      v-model="debugLogs"
      title="My Component Debug"
      :max-logs="20"
      :initial-visible="true" />
  </div>
</template>

<script setup lang="ts">
import DebugPanel from '@/components/debug/DebugPanel.vue';
import { ref } from 'vue';

const debugLogs = ref<string[]>([]);
const debugPanel = ref<InstanceType<typeof DebugPanel> | null>(null);

// 添加调试信息
function addDebug(message: string) {
  debugPanel.value?.addLog(message);
}

// 示例：在某个事件中添加调试信息
function onSomeEvent() {
  addDebug('Some event triggered');
  addDebug(`Data: ${JSON.stringify(someData)}`);
}
</script>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `'Debug Info'` | 调试面板标题 |
| `maxLogs` | `number` | `10` | 最大显示日志数量 |
| `initialVisible` | `boolean` | `true` | 初始是否显示面板 |

## v-model

- `v-model`: `string[]` - 双向绑定日志数组

## 暴露的方法

通过 `ref` 可以调用以下方法：

- `addLog(message: string)` - 添加一条日志
- `clearLogs()` - 清空所有日志
- `show()` - 显示面板
- `hide()` - 隐藏面板
- `toggle()` - 切换显示/隐藏

## 样式定制

组件使用 scoped 样式，如需定制可以通过 CSS 变量或深度选择器：

```css
/* 自定义调试面板位置 */
:deep(.debug-panel) {
  left: 10px;
  right: auto;
}

/* 自定义颜色 */
:deep(.debug-panel) {
  --debug-bg: rgba(20, 20, 20, 0.95);
  --debug-text: #00ffff;
}
```

## 使用场景

1. **移动端调试**：在iPhone、Android等设备上查看调试信息
2. **滚动事件调试**：监控滚动位置、距离等数值
3. **网络请求调试**：显示API调用状态和响应
4. **用户交互调试**：记录点击、滑动等用户操作
5. **性能监控**：显示渲染时间、内存使用等信息

## 注意事项

- 调试面板会覆盖在内容上方，注意不要影响用户操作
- 生产环境建议通过环境变量控制是否显示调试面板
- 大量日志可能影响性能，建议设置合理的 `maxLogs` 值