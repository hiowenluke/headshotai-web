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
                <ion-icon :icon="checkmarkCircleOutline" class="success-icon"></ion-icon>
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
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { IonIcon, IonSpinner } from '@ionic/vue';
import { checkmarkCircleOutline } from 'ionicons/icons';
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

// 验证支付状态
async function verifyPayment() {
    const sessionId = route.query.session_id as string;
    
    if (!sessionId) {
        console.error('[PaymentSuccess] No session ID provided');
        return;
    }

    try {
        console.log('[PaymentSuccess] Verifying payment for session:', sessionId);
        
        const status = await getPaymentStatus(sessionId);
        
        if (status.status === 'completed') {
            paymentDetails.value = {
                coins_added: status.coins_added || 0,
                new_balance: status.new_balance || 0
            };
            
            // 刷新用户会话以更新金币余额
            await refreshSession();
            
            console.log('[PaymentSuccess] Payment verified successfully');
        } else {
            console.warn('[PaymentSuccess] Payment not completed:', status.status);
        }
    } catch (error) {
        console.error('[PaymentSuccess] Failed to verify payment:', error);
    }
}

function handleClose() {
    emit('close');
    router.push('/home');
}

onMounted(() => {
    if (props.isOpen) {
        verifyPayment();
    }
});
</script>

<style scoped>
.payment-success-content {
    padding: 40px 20px;
    text-align: center;
    color: #fff;
    background: #1a1a1a;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.success-icon-wrapper {
    margin-bottom: 24px;
}

.success-icon {
    font-size: 80px;
    color: #4ade80;
}

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
