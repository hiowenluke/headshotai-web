<template>
    <PageLikeModal 
        :is-open="isOpen" 
        page-title="Payment Cancelled"
        modal-style="vertical"
        title-type="simple"
        @close="handleClose"
        class="payment-cancel-modal"
    >
        <div class="payment-cancel-content">
            <!-- Cancel Icon -->
            <div class="cancel-icon-wrapper">
                <SvgIcon name="close-circle-outline" size="80px" color="#ef4444" class="cancel-icon" />
            </div>

            <!-- Cancel Message -->
            <h2 class="cancel-title">Payment Cancelled</h2>
            <p class="cancel-message">Your payment was cancelled. No charges were made.</p>

            <!-- Action Buttons -->
            <div class="action-buttons">
                <button class="retry-button" @click="handleRetry">
                    Try Again
                </button>
                <button class="back-button" @click="handleClose">
                    Go Back
                </button>
            </div>
        </div>
    </PageLikeModal>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import SvgIcon from '@/components/icons/SvgIcon.vue';
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';

defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const router = useRouter();

function handleRetry() {
    emit('close');
    // 重新打开购买金币页面
    window.dispatchEvent(new Event('open-buy-coins'));
}

function handleClose() {
    emit('close');
    router.push('/home');
}
</script>

<style scoped>
.payment-cancel-content {
    padding: 40px 20px;
    text-align: center;
    color: #fff;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.cancel-icon-wrapper {
    margin-bottom: 24px;
}

/* 颜色通过 SvgIcon 的 color prop 设置 */

.cancel-title {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 12px 0;
}

.cancel-message {
    font-size: 16px;
    color: #ccc;
    margin: 0 0 32px 0;
}

.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    max-width: 400px;
}

.retry-button,
.back-button {
    width: 100%;
    padding: 16px;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.retry-button {
    background: #3b82f6;
    color: #fff;
}

.retry-button:hover {
    background: #2563eb;
    transform: translateY(-1px);
}

.back-button {
    background: transparent;
    color: #ccc;
    border: 1px solid #444;
}

.back-button:hover {
    background: #2a2a2a;
}

.payment-cancel-modal {
    --background: #1a1a1a;
}
</style>
