<template>
    <PageLikeModal 
        :is-open="isOpen" 
        page-title="AIP.so - Payment History"
        modal-style="horizontal"
        @close="$emit('close')"
        class="payment-history-modal"
    >
        <div class="modal-page">
            <div class="modal-content">
                <div v-if="paymentHistory.length === 0" class="no-data">
                    No transactions yet
                </div>
                <div v-else class="payment-table">
                    <div v-for="(item, index) in paymentHistory" :key="index" class="payment-row">
                        <div class="coins-column">
                            <div class="coins-amount">{{ item.coinsText }}</div>
                            <div class="payment-time">{{ item.timeText }}</div>
                        </div>
                        <div class="product-column">{{ item.productName }}</div>
                        <div class="amount-column">{{ item.amount }}</div>
                    </div>
                </div>
            </div>
        </div>
    </PageLikeModal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';

const props = defineProps<{ isOpen: boolean }>();
defineEmits<{ (e: 'close'): void }>();

// 监听 isOpen 变化，确保模态框正确显示
watch(() => props.isOpen, async (newValue) => {
    if (newValue) {
        // 强制重新渲染和层级管理
        await nextTick();
        const modalElement = document.querySelector('.payment-history-modal');
        if (modalElement) {
            (modalElement as HTMLElement).style.zIndex = '10000';
        }
    }
});

interface PaymentHistoryItem {
  coinsText: string;
  timeText: string;
  productName: string;
  amount: string;
}

// 模拟数据，实际使用时应该从 API 获取
const paymentHistory = ref<PaymentHistoryItem[]>([
  {
    coinsText: '+50 Coins',
    timeText: '2025/9/1 12:11',
    productName: 'Headshot AI',
    amount: '$5'
  },
  {
    coinsText: '+100 Coins',
    timeText: '2025/8/30 15:30',
    productName: 'Headshot AI',
    amount: '$10'
  }
]);

// 如果要显示空数据状态，可以设置为空数组：
// const paymentHistory = ref<PaymentHistoryItem[]>([]);

</script>

<style scoped>
.no-data {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    color: #888;
    font-size: 16px;
}

.payment-table {
    width: 100%;
    border-top: 1px solid #333;
    border-bottom: 1px solid #333;
}

.payment-row {
    display: flex;
    align-items: flex-start;
    padding: 16px 0;
    border-bottom: 1px solid #333;
}

.payment-row:last-child {
    border-bottom: none;
}

.coins-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.coins-amount {
    color: #90EE90; /* 淡绿色 */
    font-size: 16px;
    font-weight: 500;
    line-height: 1.2;
}

.payment-time {
    color: #888;
    font-size: 12px;
    margin-top: 4px;
    line-height: 1;
}

.product-column {
    flex: 1;
    color: #fff;
    font-size: 16px;
    text-align: left;
    display: flex;
    align-items: center;
    min-height: 24px; /* 确保与 coins-amount 对齐 */
}

.amount-column {
    flex: 0 0 auto;
    color: #fff;
    font-size: 16px;
    text-align: right;
    display: flex;
    align-items: center;
    min-height: 24px; /* 确保与 coins-amount 对齐 */
    min-width: 60px;
}

/* 确保 Payment History 模态框显示在最前面 */
.payment-history-modal {
    z-index: 10000 !important;
}

.payment-history-modal::part(content) {
    z-index: 10000 !important;
}

.payment-history-modal::part(backdrop) {
    z-index: 9999 !important;
}
</style>
