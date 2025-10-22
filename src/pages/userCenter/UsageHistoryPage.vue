<template>
    <PageLikeModal 
        :is-open="isOpen" 
        page-title="AIP.so - Usage History"
        modal-style="horizontal"
        @close="$emit('close')"
        class="usage-history-modal"
    >
        <div class="modal-page">
            <div class="modal-content">
                <div v-if="usageHistory.length === 0" class="no-data">No transactions yet</div>
                <div v-else class="usage-table">
                    <div v-for="(item, index) in usageHistory" :key="index" class="usage-row">
                        <div class="coins-column">
                            <div class="coins-amount">{{ item.coinsText }}</div>
                            <div class="usage-time">{{ item.timeText }}</div>
                        </div>
                        <div class="product-column">{{ item.productName }}</div>
                        <div class="service-column">{{ item.serviceName }}</div>
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
        const modalElement = document.querySelector('.usage-history-modal');
        if (modalElement) {
            (modalElement as HTMLElement).style.zIndex = '10000';
        }
    }
});

interface UsageHistoryItem {
  coinsText: string;
  timeText: string;
  productName: string;
  serviceName: string;
}

// 模拟数据，实际使用时应该从 API 获取
const usageHistory = ref<UsageHistoryItem[]>([
  {
    coinsText: '-15 Coins',
    timeText: '2025/9/1 12:11',
    productName: 'Headshot AI',
    serviceName: 'DIY x2'
  },
  {
    coinsText: '-25 Coins',
    timeText: '2025/8/30 15:30',
    productName: 'Headshot AI',
    serviceName: 'Premium x1'
  }
]);

// 如果要显示空数据状态，可以设置为空数组：
// const usageHistory = ref<UsageHistoryItem[]>([]);

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

.usage-table {
    width: 100%;
    border-top: 1px solid #333;
    border-bottom: 1px solid #333;
}

.usage-row {
    display: flex;
    align-items: flex-start;
    padding: 16px 0;
    border-bottom: 1px solid #333;
}

.usage-row:last-child {
    border-bottom: none;
}

.coins-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.coins-amount {
    color: #FFB6C1; /* 淡红色 */
    font-size: 16px;
    font-weight: 500;
    line-height: 1.2;
}

.usage-time {
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

.service-column {
    flex: 1;
    color: #fff;
    font-size: 16px;
    text-align: left;
    display: flex;
    align-items: center;
    min-height: 24px; /* 确保与 coins-amount 对齐 */
}

/* 确保 Usage History 模态框显示在最前面 */
.usage-history-modal {
    z-index: 10000 !important;
}

.usage-history-modal::part(content) {
    z-index: 10000 !important;
}

.usage-history-modal::part(backdrop) {
    z-index: 9999 !important;
}
</style>
