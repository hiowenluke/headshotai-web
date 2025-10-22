# FaceUploadedPage 页面内上传功能

## 📋 功能概述

在 FaceUploadedPage 中实现页面内直接上传人脸图片，无需跳转到其他页面。

## 🎨 架构设计

### 可复用的 Composable

创建了 `useFaceUpload` composable，提供通用的上传功能：

```typescript
// src/composables/useFaceUpload.ts
export function useFaceUpload(options: UseFaceUploadOptions) {
  return {
    uploading,      // 上传状态
    uploadError,    // 错误信息
    uploadedCount,  // 已上传数量
    uploadTotal,    // 总数量
    triggerUpload,  // 触发文件选择
    uploadFiles     // 直接上传文件数组
  };
}
```

### 优势

1. **代码复用**：GeneratorModal 和 FaceUploadedPage 都可以使用
2. **统一逻辑**：上传流程、错误处理、预览管理都在一个地方
3. **易于维护**：修改上传逻辑只需改一处
4. **灵活配置**：通过 options 自定义回调函数

## 🎯 实现需求

1. ✅ 点击 "+" 按钮打开文件选择窗口
2. ✅ **支持多选图片文件**
3. ✅ 展示上传过程（加载动画）
4. ✅ 上传完成后立即显示本地预览
5. ✅ 新上传的图片显示在列表开头
6. ✅ 0.5秒后用服务器 URL 替换本地 URL
7. ✅ **复用 GeneratorModal 的上传逻辑**

## 🔧 实现细节

### 1. Composable 层 (useFaceUpload.ts)

封装了完整的上传逻辑：

```typescript
import { uploadFilesSequential } from '@/services/faceUpload';

export function useFaceUpload(options: UseFaceUploadOptions = {}) {
  const uploading = ref(false);
  const uploadError = ref<string | null>(null);
  
  const triggerUpload = () => {
    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.click();
  };
  
  const uploadFiles = async (files: File[]) => {
    // 1. 创建本地预览
    // 2. 调用 uploadFilesSequential 上传
    // 3. 替换为服务器 URL
    // 4. 处理错误
  };
  
  return { uploading, uploadError, triggerUpload, uploadFiles };
}
```

### 2. 服务层 (faceUpload/)

使用 `src/services/faceUpload/` 提供的完整上传功能：

- ✅ 图片预处理（方向校正、裁剪、缩放）
- ✅ EXIF 信息解析
- ✅ 文件上传（支持重试和进度报告）
- ✅ 批量上传支持

### 3. 页面实现 (FaceUploadedPage.vue)

#### 使用 Composable
```typescript
// 使用上传 composable
const { uploading, triggerUpload } = useFaceUpload({
  onSuccess: (uploadedFaces: UploadedFace[]) => {
    // 将上传的图片合并到列表开头
    const newFaces = uploadedFaces.map(f => ({
      url: f.url,
      createdAt: f.createdAt
    }));
    
    // 去重并添加到列表
    const existingUrls = new Set(rawFaces.value.map(f => f.url));
    const uniqueNewFaces = newFaces.filter(f => !existingUrls.has(f.url));
    
    if (uniqueNewFaces.length > 0) {
      rawFaces.value = [...uniqueNewFaces, ...rawFaces.value];
    }
  },
  onError: (errorMsg: string) => {
    error.value = errorMsg;
  }
});

const handleUpload = () => {
  triggerUpload();
};
```

#### Composable 内部流程
```typescript
const uploadFiles = async (files: File[]): Promise<UploadedFace[]> => {
  uploading.value = true;
  uploadedCount.value = 0;
  uploadTotal.value = files.length;
  
  // 1. 创建本地预览
  const localPreviews = new Map<File, string>();
  const uploadedFaces: UploadedFace[] = [];
  
  files.forEach(file => {
    const localUrl = URL.createObjectURL(file);
    localPreviews.set(file, localUrl);
    uploadedFaces.push({
      url: localUrl,
      createdAt: Date.now(),
      isLocal: true
    });
  });
  
  // 2. 立即通知页面显示本地预览
  if (options.onSuccess) {
    options.onSuccess([...uploadedFaces]);
  }
  
  try {
    // 3. 使用 uploadFilesSequential 批量上传
    const results = await uploadFilesSequential(files, {
      signal: new AbortController().signal,
      minDisplayTime: options.minDisplayTime ?? 0,
      userId: authState.user?.sub || undefined,
      category: 'faces',
      aspectRatio: 1,
      onProgress: (e) => {
        if (e.status === 'success' && e.url) {
          uploadedCount.value = e.index + 1;
          
          // 4. 更新为服务器 URL
          const file = files[e.index];
          const localUrl = localPreviews.get(file);
          
          if (localUrl) {
            const faceIndex = uploadedFaces.findIndex(f => f.url === localUrl);
            if (faceIndex !== -1) {
              uploadedFaces[faceIndex] = {
                url: e.url,
                createdAt: Date.now(),
                isLocal: false
              };
              
              // 通知页面更新
              if (options.onSuccess) {
                options.onSuccess([...uploadedFaces]);
              }
            }
            
            // 5. 释放本地 URL
            setTimeout(() => {
              URL.revokeObjectURL(localUrl);
              localPreviews.delete(file);
            }, 500);
          }
        }
      }
    });
    
    // 6. 处理失败的上传
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      failures.forEach((result, index) => {
        const file = files[index];
        const localUrl = localPreviews.get(file);
        if (localUrl) {
          const faceIndex = uploadedFaces.findIndex(f => f.url === localUrl);
          if (faceIndex !== -1) {
            uploadedFaces.splice(faceIndex, 1);
          }
          URL.revokeObjectURL(localUrl);
        }
      });
      
      const errorMsg = `${failures.length} of ${files.length} uploads failed.`;
      if (options.onError) {
        options.onError(errorMsg);
      }
      
      // 通知最终结果
      if (options.onSuccess) {
        options.onSuccess([...uploadedFaces]);
      }
    }
    
    return uploadedFaces.filter(f => !f.isLocal);
    
  } catch (err: any) {
    // 清理所有本地预览
    localPreviews.forEach((localUrl) => {
      URL.revokeObjectURL(localUrl);
    });
    
    if (options.onError) {
      options.onError(err?.message || 'Failed to upload faces.');
    }
    
    return [];
  } finally {
    uploading.value = false;
  }
};
```

#### UI 更新
```vue
<!-- 加号按钮显示上传状态 -->
<button class="face-card plus-card" @click="handleUpload" :disabled="uploading">
  <span v-if="!uploading" class="plus-symbol">+</span>
  <div v-else class="upload-spinner"></div>
</button>
```

## 🎨 用户体验优化

### 1. 即时反馈
- ✅ 点击 "+" 后立即打开文件选择器
- ✅ **支持一次选择多张图片**
- ✅ 选择文件后显示加载动画
- ✅ 上传完成立即显示图片（无需等待服务器响应）

### 2. 平滑过渡
- ✅ 使用本地 blob URL 立即显示预览
- ✅ 0.5秒后静默替换为服务器 URL
- ✅ 用户感知不到 URL 切换

### 3. 错误处理
- ✅ 上传失败自动移除失败的图片
- ✅ 显示失败数量统计
- ✅ 上传中禁用按钮防止重复点击
- ✅ 自动清理本地 URL 避免内存泄漏

### 4. 批量上传
- ✅ 支持同时选择多张图片
- ✅ 所有图片立即显示本地预览
- ✅ 按顺序上传并替换为服务器 URL
- ✅ 部分失败不影响成功的图片

## 📊 上传流程图

```
用户点击 "+"
    ↓
打开文件选择器
    ↓
用户选择图片
    ↓
显示加载动画
    ↓
上传到服务器
    ↓
立即显示本地预览 (blob URL)
    ↓
添加到列表开头
    ↓
1秒后替换为服务器 URL
    ↓
释放本地 URL
```

## 🔄 与原有功能的对比

### 修改前 ❌
```
点击 "+" → 触发 'request-upload' 事件 → 父组件处理 → 可能跳转页面
```

### 修改后 ✅
```
点击 "+" → 页面内直接处理 → 立即显示预览 → 无需跳转
```

## 📝 上传服务

使用 `uploadFilesSequential` 函数，该函数：

1. **预处理图片**：
   - 读取 EXIF 信息并校正方向
   - 按 1:1 比例裁剪
   - 缩放到合适尺寸
   - 转换为 WebP 格式

2. **批量上传**：
   - 顺序上传多个文件
   - 支持进度回调
   - 支持取消操作
   - 自动重试失败的上传

3. **返回结果**：
   ```typescript
   interface UploadTaskResult {
     success: boolean;
     url?: string;
     error?: string;
   }
   ```

## ⚠️ 注意事项

1. **内存管理**：使用 `URL.revokeObjectURL()` 释放 blob URL
2. **错误处理**：网络错误、认证失败等都有相应处理
3. **并发控制**：上传中禁用按钮，防止重复上传
4. **URL 切换**：1秒延迟确保用户看到平滑过渡

## ✅ 已实现的功能

1. ✅ **多选上传**：一次可选择多张图片
2. ✅ **图片预处理**：自动校正方向、裁剪、缩放
3. ✅ **即时预览**：立即显示本地预览
4. ✅ **批量处理**：顺序上传多个文件
5. ✅ **错误处理**：自动移除失败的上传

## 🚀 未来扩展

1. **进度条**：显示每个文件的上传进度百分比
2. **拖拽上传**：支持拖拽文件到页面
3. **上传队列**：显示上传队列和状态
4. **取消上传**：支持取消正在进行的上传
