# ConfirmDialog 通用对话框组件

## 功能特性

- 🎨 毛玻璃效果的现代化设计
- 📱 响应式布局，移动端优化
- 🔧 高度可定制的属性
- 📦 支持插槽自定义内容
- ⌨️ 完整的事件处理

## 基本用法

```vue
<template>
  <ConfirmDialog 
    :open="showDialog"
    title="确认删除"
    message="此操作无法撤销，确定要删除吗？"
    @confirm="handleDelete"
    @cancel="showDialog = false"
  />
</template>

<script setup>
import ConfirmDialog from '@/components/dialog/ConfirmDialog.vue';

const showDialog = ref(false);

function handleDelete() {
  // 执行删除操作
  console.log('用户确认删除');
  showDialog.value = false;
}
</script>
```

## 属性 (Props)

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `open` | `boolean` | `false` | 控制对话框显示/隐藏 |
| `title` | `string` | `'Confirm'` | 对话框标题 |
| `message` | `string` | `''` | 消息内容（可选） |
| `cancelText` | `string` | `'Cancel'` | 取消按钮文本 |
| `confirmText` | `string` | `'OK'` | 确认按钮文本 |
| `showCancel` | `boolean` | `true` | 是否显示取消按钮 |
| `showBackdrop` | `boolean` | `false` | 是否显示背景遮罩 |

## 事件 (Events)

| 事件 | 说明 | 参数 |
|------|------|------|
| `close` | 对话框关闭时触发 | - |
| `cancel` | 点击取消按钮时触发 | - |
| `confirm` | 点击确认按钮时触发 | - |

## 插槽 (Slots)

### 默认插槽
用于自定义对话框内容区域

```vue
<ConfirmDialog :open="showDialog" title="自定义内容">
  <div class="custom-content">
    <p>这是自定义的内容区域</p>
    <ul>
      <li>可以包含任何 HTML 元素</li>
      <li>支持复杂的布局</li>
    </ul>
  </div>
</ConfirmDialog>
```

## 使用场景

### 1. 简单确认对话框
```vue
<ConfirmDialog 
  :open="showConfirm"
  title="确认操作"
  message="确定要执行此操作吗？"
  @confirm="doAction"
  @cancel="showConfirm = false"
/>
```

### 2. 仅显示信息（单按钮）
```vue
<ConfirmDialog 
  :open="showAlert"
  title="操作成功"
  message="数据已成功保存！"
  :show-cancel="false"
  confirm-text="知道了"
  @confirm="showAlert = false"
/>
```

### 3. 自定义按钮文本
```vue
<ConfirmDialog 
  :open="showLogout"
  title="退出登录"
  message="确定要退出当前账户吗？"
  cancel-text="继续使用"
  confirm-text="退出登录"
  @confirm="logout"
  @cancel="showLogout = false"
/>
```

### 4. 复杂内容布局
```vue
<ConfirmDialog :open="showDetails" title="用户信息">
  <div class="user-details">
    <img :src="user.avatar" class="avatar" />
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
    <div class="actions">
      <button @click="editUser">编辑</button>
      <button @click="deleteUser">删除</button>
    </div>
  </div>
</ConfirmDialog>
```

### 5. 带背景遮罩的对话框
```vue
<ConfirmDialog 
  :open="showImportant"
  title="重要提示"
  message="这是一个重要的系统通知"
  :show-backdrop="true"
  @confirm="handleImportant"
  @cancel="showImportant = false"
/>
```

### 6. 无背景遮罩的对话框（默认）
```vue
<ConfirmDialog 
  :open="showQuick"
  title="快速确认"
  message="这是一个不阻塞背景的快速确认"
  @confirm="handleQuick"
  @cancel="showQuick = false"
/>
```

## 样式说明

- 使用毛玻璃效果 (`backdrop-filter`)
- 黑色半透明遮罩背景
- 圆角设计符合现代UI规范
- 按钮有悬停和点击效果
- 移动端响应式优化

## 注意事项

1. 组件依赖 Ionic Vue 的 `IonModal` 和 `IonIcon`
2. 需要支持 `backdrop-filter` 的现代浏览器
3. 事件处理需要手动关闭对话框 (`open` 属性控制)
4. 可以通过 CSS 变量进一步自定义样式
