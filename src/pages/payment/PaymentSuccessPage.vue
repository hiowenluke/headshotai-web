<template>
    <PageLikeModal 
        :is-open="isOpen" 
        page-title="Payment Successful"
        modal-style="vertical"
        title-type="simple"
        @close="handleClose"
        class="payment-success-modal"
    >
        <div class="payment-success-content">
            <!-- Success Icon -->
            <div class="success-icon-wrapper">
                <SvgIcon name="checkmark-circle-outline" size="80px" color="#86efac" class="success-icon" />
            </div>

            <!-- Success Message -->
            <h2 class="success-title">Payment Successful!</h2>
            <p class="success-message">Your coins have been added to your account.</p>

            <!-- Payment Details -->
            <div v-if="paymentDetails" class="payment-details">
                <div class="detail-row">
                    <span class="detail-label">Coins Added:</span>
                    <span class="detail-value coins-value">+{{ paymentDetails.coins_added }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">New Balance:</span>
                    <span class="detail-value balance-value">{{ paymentDetails.new_balance }}</span>
                </div>
            </div>

            <!-- Loading State -->
            <div v-else class="loading-state">
                <ion-spinner name="crescent"></ion-spinner>
                <p>Verifying payment...</p>
            </div>

            <!-- Action Button -->
            <button class="continue-button" @click="handleClose">
                Continue
            </button>
        </div>
    </PageLikeModal>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { IonSpinner } from '@ionic/vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';
import { getPaymentStatus } from '@/services/paymentService';
import { refreshSession } from '@/state/authState';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const router = useRouter();
const route = useRoute();

const paymentDetails = ref<{
    coins_added: number;
    new_balance: number;
} | null>(null);

// 存储 session ID（从事件或 URL 获取）
const sessionId = ref<string>('');

// 验证支付状态
async function verifyPayment() {
    // 优先使用存储的 session ID，否则从 URL 获取
    const sid = sessionId.value || (route.query.session_id as string);
    
    if (!sid) {
        console.error('[PaymentSuccess] No session ID provided');
        return;
    }

    try {
        console.log('[PaymentSuccess] Verifying payment for session:', sid);
        
        const status = await getPaymentStatus(sid);
        
        console.log('[PaymentSuccess] Payment status response:', status);
        
        // 适配后端实际返回的字段名
        const response = status as any;
        
        // 检查多种可能的状态字段
        const isCompleted = status.status === 'completed' || 
                           response.payment_status === 'completed' ||
                           response.status === 'succeeded' ||
                           (response.coins_total && response.coins_total > 0);
        
        if (isCompleted) {
            paymentDetails.value = {
                coins_added: response.coins_total || response.coins_added || 0,
                new_balance: response.new_balance || 0
            };
            
            // 刷新用户会话以更新金币余额
            await refreshSession();
            
            console.log('[PaymentSuccess] Payment verified successfully, details:', paymentDetails.value);
        } else {
            console.warn('[PaymentSuccess] Payment not completed, status:', status.status, 'full response:', response);
            
            // 即使状态是 pending，如果有 coins_total，也显示详情
            if (response.coins_total && response.coins_total > 0) {
                paymentDetails.value = {
                    coins_added: response.coins_total,
                    new_balance: response.new_balance || 0
                };
                
                // 刷新用户会话
                await refreshSession();
                
                console.log('[PaymentSuccess] Showing payment details despite pending status');
            }
        }
    } catch (error) {
        console.error('[PaymentSuccess] Failed to verify payment:', error);
    }
}

function handleClose() {
    emit('close');
    router.push('/home');
}

// 监听自定义事件来接收 session ID
function handlePaymentSuccessEvent(event: Event) {
    const customEvent = event as CustomEvent<{ sessionId: string }>;
    if (customEvent.detail?.sessionId) {
        sessionId.value = customEvent.detail.sessionId;
        console.log('[PaymentSuccess] Received session ID from event:', sessionId.value);
    }
}

onMounted(() => {
    window.addEventListener('payment-success-data', handlePaymentSuccessEvent);
});

onBeforeUnmount(() => {
    window.removeEventListener('payment-success-data', handlePaymentSuccessEvent);
});

// 监听弹窗打开状态
watch(() => props.isOpen, (isOpen) => {
    console.log('[PaymentSuccess] isOpen changed:', isOpen);
    console.log('[PaymentSuccess] Current route:', route.fullPath);
    console.log('[PaymentSuccess] Session ID from query:', route.query.session_id);
    console.log('[PaymentSuccess] Session ID from ref:', sessionId.value);
    
    if (isOpen) {
        verifyPayment();
    }
}, { immediate: true });
</script>

<style scoped>
.payment-success-content {
    position: relative;
    top: -100px;
    padding: 0 20px;
    text-align: center;
    color: #fff;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.success-icon-wrapper {
    margin-bottom: 24px;
}

/* 颜色通过 SvgIcon 的 color prop 设置 */

.success-title {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 12px 0;
}

.success-message {
    font-size: 16px;
    color: #ccc;
    margin: 0 0 32px 0;
}

.payment-details {
    width: 100%;
    max-width: 400px;
    background: #2a2a2a;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 32px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #444;
}

.detail-row:last-child {
    border-bottom: none;
}

.detail-label {
    font-size: 16px;
    color: #ccc;
}

.detail-value {
    font-size: 18px;
    font-weight: 600;
}

.coins-value {
    color: #4ade80;
}

.balance-value {
    color: #ffd700;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin: 32px 0;
}

.loading-state p {
    color: #ccc;
    font-size: 16px;
}

.continue-button {
    width: 100%;
    max-width: 400px;
    padding: 16px;
    background: #3b82f6;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.continue-button:hover {
    background: #2563eb;
    transform: translateY(-1px);
}

.payment-success-modal {
    --background: #1a1a1a;
}
</style>
