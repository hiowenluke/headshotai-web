<template>
    <ion-modal :is-open="open" :css-class="modalClass" @didDismiss="handleCancel">
        <div class="dialog-wrapper">
            <!-- 标题行 -->
            <div class="dialog-header">
                <h2 class="title">{{ title }}</h2>
            </div>
            
            <!-- 内容区域 -->
            <div v-if="hasContent" class="dialog-content">
                <slot>
                    <p v-if="message" class="message" :class="{ 'message-centered': isShortMessage }">{{ message }}</p>
                </slot>
            </div>
            
            <!-- 底部按钮 -->
            <div class="dialog-footer">
                <button class="dialog-btn cancel-btn" @click="handleCancel">
                    {{ cancelText }}
                </button>
                <button class="dialog-btn confirm-btn" @click="handleConfirm">
                    {{ confirmText }}
                </button>
            </div>
        </div>
    </ion-modal>
</template>

<script setup lang="ts">
import { IonModal } from '@ionic/vue';
import { computed, useSlots } from 'vue';

interface Props {
    open: boolean;
    title?: string;
    message?: string;
    cancelText?: string;
    confirmText?: string;
    showCancel?: boolean;
    showBackdrop?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    title: 'Confirm',
    message: '',
    cancelText: 'Cancel',
    confirmText: 'OK',
    showCancel: true,
    showBackdrop: false
});

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'cancel'): void;
    (e: 'confirm'): void;
}>();

const slots = useSlots();

// 动态生成模态框类名
const modalClass = computed(() => {
    return props.showBackdrop ? 'confirm-dialog with-backdrop' : 'confirm-dialog no-backdrop';
});

// 检查是否有内容需要显示
const hasContent = computed(() => {
    return props.message || slots.default;
});

// 检查消息是否为短消息（单行显示）
const isShortMessage = computed(() => {
    if (!props.message) return false;
    
    // 基于字符数量和换行符判断
    const hasLineBreaks = props.message.includes('\n');
    const isShort = props.message.length <= 50; // 大约一行的字符数
    
    return !hasLineBreaks && isShort;
});

function handleCancel() {
    emit('cancel');
    emit('close');
}

function handleConfirm() {
    emit('confirm');
    emit('close');
}
</script>

<style scoped>
/* 基础样式 */
.confirm-dialog::part(content) {
    --background: transparent;
    --box-shadow: none;
}

/* 有遮罩的样式 */
.with-backdrop::part(backdrop) {
    --backdrop-opacity: 1;
    background: rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(8px) saturate(110%);
}

/* 无遮罩的样式 */
.no-backdrop::part(backdrop) {
    --backdrop-opacity: 0;
    background: transparent !important;
    backdrop-filter: none;
}

.dialog-wrapper {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 92vw;
    max-width: 480px;
    background: rgba(64, 65, 74, 0.6);
    backdrop-filter: blur(18px) saturate(140%);
    border-radius: 28px;
    padding: 26px 26px 24px;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 12px 40px -8px rgba(0, 0, 0, 0.55);
}

.dialog-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
}

.title {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 0.3px;
    line-height: 1.2;
    text-align: center;
}

.dialog-content {
    margin-bottom: 24px;
    line-height: 1.5;
}

.message {
    margin: 0;
    font-size: 16px;
    opacity: 0.9;
    text-align: left;
}

.message-centered {
    text-align: center;
}

.dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: center;
    align-items: center;
}

.dialog-btn {
    border: none;
    font-size: 16px;
    font-weight: 600;
    padding: 12px 24px;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
}

.cancel-btn {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-btn:hover {
    background: rgba(255, 255, 255, 0.15);
}

.cancel-btn:active {
    transform: translateY(1px);
    background: rgba(255, 255, 255, 0.08);
}

.confirm-btn {
    background: #2a78ff;
    color: #fff;
    box-shadow: 0 4px 12px -2px rgba(42, 120, 255, 0.4);
}

.confirm-btn:hover {
    background: #1968e6;
    box-shadow: 0 6px 16px -2px rgba(42, 120, 255, 0.5);
}

.confirm-btn:active {
    transform: translateY(1px);
    background: #1558cc;
}

/* 移除响应式代码 - 只支持移动端，直接应用移动端样式 */
.dialog-wrapper {
    width: 88vw;
    padding: 24px 20px 20px;
}

.title {
    font-size: 22px;
}

.dialog-btn {
    font-size: 15px;
    padding: 11px 20px;
}
</style>
