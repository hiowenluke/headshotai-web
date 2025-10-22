# FaceUploadedPage 复用 GeneratorModal 的上传组件

## 📋 设计目标

FaceUploadedPage 应该复用 GeneratorModal 已有的上传功能，而不是重新实现。

## ✅ 正确的复用方式

### 架构设计

```
┌─────────────────────────────────────┐
│   GeneratorModal                    │
│   FaceUploadedPage                  │
└──────────────┬──────────────────────┘
               │ 使用
               ↓
┌─────────────────────────────────────┐
│   FaceUploadController (组件)       │
│   - 文件选择                         │
│   - 上传管理                         │
│   - 状态管理                         │
│   - 本地预览                         │
└──────────────┬──────────────────────┘
               │ 使用
               ↓
┌─────────────────────────────────────┐
│   uploadFilesSequential (服务)      │
│   - 图片预处理                       │
│   - 批量上传                         │
│   - 进度报告                         │
└─────────────────────────────────────┘
```

## 🔧 实现方式

### 1. FaceUploadedPage 使用 FaceUploadController

```vue
<template>
  <PageLikeModal>
    <!-- 显示已上传的图片列表 -->
    <section class="faces-grid">
      <button class="plus-card" @click="triggerUpload">+</button>
      <article v-for="face in faces" :key="face.url">
        <img :src="face.url" />
      </article>
    </section>

    <!-- 隐藏的 FaceUploadController，只用于处理上传逻辑 -->
    <FaceUploadController
      ref="uploadControllerRef"
      style="display: none;"
      :plan="'1P'"
      :is-open="isOpen"
      :uploading="uploading"
      :upload-error="uploadError"
      :uploaded-count="uploadedCount"
      :upload-total="uploadTotal"
      @updateUploading="uploading = $event"
      @updateUploadError="uploadError = $event"
      @updateUploadedCount="uploadedCount = $event"
      @updateUploadTotal="uploadTotal = $event"
      @uploadedStateChange="handleUploadedStateChange"
    />

    <!-- 复用上传进度弹窗 -->
    <UploadProgressModal
      :is-open="uploading"
      :has-error="uploadError"
      :uploaded-count="uploadedCount"
      :upload-total="uploadTotal"
      @cancel="cancelUpload"
      @confirm="closeErrorModal"
    />
  </PageLikeModal>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';
import type { FaceUploadExpose } from '@/components/uploadPhoto/types';

const FaceUploadController = defineAsyncComponent(() =>
  import('@/components/uploadPhoto/FaceUploadController.vue')
);
const UploadProgressModal = defineAsyncComponent(() =>
  import('@/components/uploading/UploadProgressModal.vue')
);

const uploadControllerRef = ref<FaceUploadExpose | null>(null);
const uploading = ref(false);
const uploadError = ref(false);
const uploadedCount = ref(0);
const uploadTotal = ref(0);

// 触发上传
const triggerUpload = () => {
  uploadControllerRef.value?.triggerUploadDialog();
};

// 处理上传完成
const handleUploadedStateChange = (state: { uploaded: string[]; selected: string[] }) => {
  // 将新上传的图片添加到列表开头
  const newUrls = state.uploaded.filter(url => !rawFaces.value.some(f => f.url === url));
  
  if (newUrls.length > 0) {
    const newFaces = newUrls.map(url => ({
      url,
      createdAt: Date.now()
    }));
    rawFaces.value = [...newFaces, ...rawFaces.value];
  }
};

// 取消上传
const cancelUpload = () => {
  const controller = uploadControllerRef.value?.abortController();
  if (controller) {
    controller.abort();
  }
  uploading.value = false;
};

// 关闭错误弹窗
const closeErrorModal = () => {
  uploadError.value = false;
  uploading.value = false;
};
</script>
```

## 📊 复用的组件

### 1. FaceUploadController
- **功能**：完整的上传控制器
- **包含**：
  - 文件选择器
  - 上传状态管理
  - 本地预览管理
  - 与服务器通信

### 2. UploadProgressModal
- **功能**：上传进度弹窗
- **显示**：
  - 上传进度（x/y）
  - 加载动画
  - 错误提示
  - 取消/确认按钮

### 3. uploadFilesSequential (服务)
- **功能**：批量上传服务
- **处理**：
  - 图片预处理（EXIF、裁剪、缩放）
  - 顺序上传
  - 进度回调
  - 错误处理

## 🎯 关键点

### 1. 隐藏 FaceUploadController
```vue
<FaceUploadController
  ref="uploadControllerRef"
  style="display: none;"
  ...
/>
```
- FaceUploadedPage 有自己的 UI（3列网格）
- 只需要 FaceUploadController 的上传逻辑
- 所以隐藏它的 UI，只用它的功能

### 2. 通过 ref 调用方法
```typescript
const uploadControllerRef = ref<FaceUploadExpose | null>(null);

const triggerUpload = () => {
  uploadControllerRef.value?.triggerUploadDialog();
};
```
- 使用 `triggerUploadDialog()` 打开文件选择器
- 使用 `abortController()` 取消上传

### 3. 监听上传事件
```typescript
@uploadedStateChange="handleUploadedStateChange"
```
- 上传完成后接收新的图片 URL
- 添加到页面的图片列表

### 4. 复用进度弹窗
```vue
<UploadProgressModal
  :is-open="uploading"
  :has-error="uploadError"
  ...
/>
```
- 与 GeneratorModal 使用相同的进度弹窗
- 统一的用户体验

## ✨ 优势

### 1. 真正的代码复用
- ✅ 不是复制粘贴代码
- ✅ 不是重新实现逻辑
- ✅ 直接使用现有组件

### 2. 统一的上传行为
- ✅ 相同的文件选择器
- ✅ 相同的上传流程
- ✅ 相同的错误处理
- ✅ 相同的进度显示

### 3. 易于维护
- ✅ 修改上传逻辑只需改一处
- ✅ 所有使用的页面自动更新
- ✅ 减少 bug 数量

### 4. 灵活的 UI
- ✅ FaceUploadedPage 有自己的 3列网格 UI
- ✅ GeneratorModal 有自己的 FaceThumbBar UI
- ✅ 共享上传逻辑，UI 各自独立

## 🔄 工作流程

```
用户点击 "+" 按钮
    ↓
FaceUploadedPage.triggerUpload()
    ↓
FaceUploadController.triggerUploadDialog()
    ↓
打开文件选择器（支持多选）
    ↓
用户选择文件
    ↓
FaceUploadController 处理上传
  - 创建本地预览
  - 调用 uploadFilesSequential
  - 显示进度弹窗
    ↓
上传完成
    ↓
触发 @uploadedStateChange 事件
    ↓
FaceUploadedPage.handleUploadedStateChange()
    ↓
将新图片添加到列表开头
    ↓
用户看到新上传的图片
```

## ❌ 错误的做法

### 1. 复制粘贴代码
```typescript
// ❌ 错误：在 FaceUploadedPage 中复制上传逻辑
const handleUpload = () => {
  const input = document.createElement('input');
  // ... 100+ 行重复代码
};
```

### 2. 创建新的 Composable
```typescript
// ❌ 错误：创建新的 useFaceUpload composable
// 这只是把代码移到另一个文件，不是真正的复用
export function useFaceUpload() {
  // ... 重新实现上传逻辑
}
```

### 3. 重新实现上传服务
```typescript
// ❌ 错误：创建新的上传函数
export async function uploadFace(file: File) {
  // ... 重新实现上传逻辑
}
```

## ✅ 正确的做法

### 1. 直接使用现有组件
```vue
<!-- ✅ 正确：使用 FaceUploadController -->
<FaceUploadController
  ref="uploadControllerRef"
  style="display: none;"
  ...
/>
```

### 2. 通过 ref 调用方法
```typescript
// ✅ 正确：调用组件的方法
uploadControllerRef.value?.triggerUploadDialog();
```

### 3. 监听组件事件
```typescript
// ✅ 正确：监听上传完成事件
@uploadedStateChange="handleUploadedStateChange"
```

## 📝 总结

### 复用层次

1. **UI 层**：各自独立
   - FaceUploadedPage：3列网格
   - GeneratorModal：FaceThumbBar

2. **逻辑层**：完全复用
   - FaceUploadController：上传控制
   - UploadProgressModal：进度显示

3. **服务层**：完全复用
   - uploadFilesSequential：上传服务
   - 图片预处理、批量上传等

### 关键原则

1. **不要重复实现**：使用现有组件
2. **隐藏不需要的 UI**：只用逻辑
3. **通过事件通信**：解耦组件
4. **保持 UI 灵活性**：各自定制

这才是真正的代码复用！🎉
