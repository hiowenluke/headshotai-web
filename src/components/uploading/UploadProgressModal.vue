<!--
# UploadProgressModal

一个可重用的上传进度模态框组件。

## Props
- `isOpen` (boolean): 控制模态框的显示/隐藏
- `hasError` (boolean): 是否显示错误状态
- `uploadedCount` (number): 已上传文件数量
- `uploadTotal` (number): 总文件数量

## Events
- `cancel`: 用户点击取消按钮时触发
- `confirm`: 用户点击确认按钮时触发（错误状态下）

## 使用示例
```vue
<template>
    <UploadProgressModal
        :is-open="uploading"
        :has-error="uploadError"
        :uploaded-count="uploadedCount"
        :upload-total="uploadTotal"
        @cancel="handleCancel"
        @confirm="handleConfirm"
    />
</template>

<script setup>
import UploadProgressModal from '@/components/uploading/UploadProgressModal.vue';

// ... 组件逻辑
</script>
```
-->
<template>
    <ion-modal 
        :is-open="isOpen" 
        css-class="upload-progress-modal" 
        backdrop-dismiss="false"
    >
        <div class="modal-container" v-if="isOpen">
            <div class="upload-progress">
            <h2 v-if="!hasError">Uploading Photos</h2>
            <h2 v-else class="err">Upload Error</h2>
            
            <div v-if="!hasError" class="counter">{{ uploadedCount }}/{{ uploadTotal }}</div>
            <div v-else class="err-msg">Some photos couldn't be uploaded. Please try again later.</div>
            
            <div class="spinner" v-if="!hasError"></div>
            
            <button v-if="!hasError" class="cancel-btn" @click="$emit('cancel')">Cancel</button>
            <button v-else class="ok-btn" @click="$emit('confirm')">OK</button>
            </div>
        </div>
    </ion-modal>
</template>

<script setup lang="ts">
import { IonModal } from '@ionic/vue';

interface Props {
    isOpen: boolean;
    hasError: boolean;
    uploadedCount: number;
    uploadTotal: number;
}

withDefaults(defineProps<Props>(), {
    isOpen: false,
    hasError: false,
    uploadedCount: 0,
    uploadTotal: 0
});

defineEmits<{
    cancel: [];
    confirm: [];
}>();
</script>

<style scoped>
/* 上传进度弹窗样式 */
.upload-progress-modal::part(content) { 
    --background: transparent;
}

.upload-progress-modal::part(backdrop) {
    /* 添加半透明背景和模糊效果 */
    --backdrop-opacity: 1;
    background: rgba(0, 0, 0, 0.4) !important;
    backdrop-filter: blur(8px) saturate(110%) !important;
    -webkit-backdrop-filter: blur(8px) saturate(110%) !important;
}

.modal-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
    /* 向上偏移10vw，看起来更舒服 */
    transform: translateY(-10vw);
}

.upload-progress { 
    width: 82vw; 
    max-width: 420px; 
    padding: 34px 26px 40px; 
    border-radius: 34px; 
    backdrop-filter: blur(22px) saturate(140%); 
    background: rgba(60, 64, 68, 0.55); 
    color: #fff; 
    text-align: center; 
    position: relative; 
}

.upload-progress h2 { 
    margin: 0 0 20px; 
    font-size: 22px; 
    font-weight: 700; 
    letter-spacing: 0.5px; 
}

.upload-progress h2.err { 
    color: #ff8d8d; 
}

.upload-progress .counter { 
    font-size: 30px; 
    font-weight: 600; 
    margin-bottom: 28px; 
    letter-spacing: 2px; 
}

.upload-progress .spinner { 
    width: 54px; 
    height: 54px; 
    border: 5px solid rgba(255, 255, 255, 0.18); 
    border-top-color: #fff; 
    border-radius: 50%; 
    margin: 0 auto 36px; 
    animation: spin 1s linear infinite; 
}

.upload-progress .cancel-btn, 
.upload-progress .ok-btn { 
    width: 100%; 
    height: 50px;
    background: #fff; 
    color: #0d57c9; 
    font-size: 20px; 
    font-weight: 600; 
    border: none; 
    border-radius: 16px; 
    letter-spacing: 0.5px; 
}

.upload-progress .ok-btn { 
    background: #0d57c9; 
    color: #fff; 
}

.upload-progress .err-msg { 
    font-size: 16px; 
    line-height: 1.5; 
    margin: 0 0 36px; 
    color: #e7e7e7; 
}

@keyframes spin { 
    to { 
        transform: rotate(360deg); 
    } 
}
</style>
