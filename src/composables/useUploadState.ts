import { ref } from 'vue';

// 上传状态管理的组合式函数
export const useUploadState = () => {
    // 上传进度状态
    const uploading = ref(false);
    const uploadError = ref(false);
    const uploadedCount = ref(0);
    const uploadTotal = ref(0);
    
    // 更新上传状态的方法
    const updateUploading = (value: boolean) => {
        uploading.value = value;
    };
    
    const updateUploadError = (value: boolean) => {
        uploadError.value = value;
    };
    
    const updateUploadedCount = (value: number) => {
        uploadedCount.value = value;
    };
    
    const updateUploadTotal = (value: number) => {
        uploadTotal.value = value;
    };
    
    // 重置上传状态
    const resetUploadState = () => {
        uploading.value = false;
        uploadError.value = false;
        uploadedCount.value = 0;
        uploadTotal.value = 0;
    };
    
    // 处理上传完成
    const handleUploadComplete = () => {
        uploading.value = false;
        uploadError.value = false;
    };
    
    // 处理上传错误
    const handleUploadError = () => {
        uploadError.value = true;
        // 通常错误时也要停止上传状态显示
        uploading.value = true; // 保持显示，让用户看到错误信息
    };
    
    return {
        // 状态
        uploading,
        uploadError,
        uploadedCount,
        uploadTotal,
        
        // 方法
        updateUploading,
        updateUploadError,
        updateUploadedCount,
        updateUploadTotal,
        resetUploadState,
        handleUploadComplete,
        handleUploadError
    };
};
