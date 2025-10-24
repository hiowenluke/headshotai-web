<template>
    <PageLikeModal 
        :is-open="isOpen" 
        page-title="Buy Coins"
        modal-style="H"
        title-type="simple"
        @close="$emit('close')"
        class="buy-coins-modal"
    >
        <div class="buy-coins-content">
            <!-- Coin Balance Display -->
            <div class="balance-section">
                <span class="balance-label">Your coins balance</span>
                <span class="balance-amount">{{ coinBalance }}</span>
            </div>

            <!-- Pricing Table -->
            <div class="pricing-table">
                <!-- Table Header -->
                <div class="table-header">
                    <div class="header-select"></div>
                    <div class="header-price">Price</div>
                    <div class="header-coins">Coins</div>
                    <div class="header-bonus">Bonus</div>
                    <div class="header-save">Save</div>
                </div>

                <!-- Pricing Rows -->
                <div 
                    v-for="(plan, index) in pricingPlans" 
                    :key="index"
                    class="pricing-row"
                    :class="{ 
                        'selected': selectedPlan === index,
                        'most-popular': plan.badge === 'MOST POPULAR',
                        'best-value': plan.badge === 'BEST VALUE'
                    }"
                    @click="selectPlan(index)"
                >
                    <!-- Badge -->
                    <div v-if="plan.badge" class="plan-badge" :class="plan.badge === 'BEST VALUE' ? 'best-value-badge' : 'most-popular-badge'">
                        <ion-icon v-if="plan.badge === 'MOST POPULAR'" :icon="flameOutline" class="badge-icon"></ion-icon>
                        <ion-icon v-if="plan.badge === 'BEST VALUE'" :icon="diamondOutline" class="badge-icon"></ion-icon>
                        {{ plan.badge }}
                    </div>

                    <!-- Selection Column with Checkmark -->
                    <div class="plan-select">
                        <div v-if="selectedPlan === index">
                            <ion-icon :icon="checkmarkOutline" class="checkmark-icon"></ion-icon>
                        </div>
                    </div>

                    <!-- Plan Details -->
                    <div class="plan-price">${{ plan.price }}</div>
                    <div class="plan-coins">{{ plan.coins }}</div>
                    <div class="plan-bonus">{{ plan.bonus > 0 ? `+${plan.bonus}` : '-' }}</div>
                    <div class="plan-save">{{ plan.save > 0 ? `${plan.save}%` : '-' }}</div>
                </div>
            </div>

            <!-- Money Back Guarantee -->
            <div class="guarantee-section">
                <ion-icon :icon="shieldCheckmarkOutline" class="guarantee-icon"></ion-icon>
                <span class="guarantee-text">100% MONEY BACK GUARANTEE</span>
            </div>

            <!-- Purchase Button -->
            <div class="purchase-section">
                <button 
                    class="purchase-button"
                    :disabled="selectedPlan === null || isProcessing"
                    @click="handlePurchase"
                >
                    <span v-if="!isProcessing">
                        Pay ${{ selectedPlan !== null ? pricingPlans[selectedPlan].price : '0.00' }}
                    </span>
                    <span v-else>Processing...</span>
                </button>
            </div>
        </div>
    </PageLikeModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { IonIcon } from '@ionic/vue';
import { flameOutline, diamondOutline, checkmarkOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';
import { authState } from '@/state/authState';
import { fetchRechargeRules, type RechargeRule } from '@/services/rechargeService';
import { createCheckoutSession, redirectToCheckout } from '@/services/paymentService';

const props = defineProps<{ isOpen: boolean }>();
defineEmits<{ (e: 'close'): void }>();

// State
const selectedPlan = ref<number | null>(null);
const isProcessing = ref(false);
const pricingPlans = ref<Array<{
    price: string;
    coins: number;
    bonus: number;
    save: number;
    badge?: string;
}>>([]);

// Computed
const coinBalance = computed(() => authState.user?.coin_balance || 0);

// Methods
function selectPlan(index: number) {
    selectedPlan.value = index;
    console.log('[BuyCoinsPage] Selected plan:', pricingPlans.value[index]);
    console.log('[BuyCoinsPage] Plan index:', index);
}

async function handlePurchase() {
    if (selectedPlan.value === null) return;
    
    isProcessing.value = true;
    const plan = pricingPlans.value[selectedPlan.value];
    
    try {
        console.log('[BuyCoinsPage] Processing purchase for plan:', plan);
        
        // 创建 Stripe Checkout Session
        const session = await createCheckoutSession({
            price_usd: parseFloat(plan.price),
            coins: plan.coins,
            bonus: plan.bonus,
            success_url: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${window.location.origin}/payment/cancel`
        });
        
        console.log('[BuyCoinsPage] Checkout session created, redirecting to Stripe...');
        
        // 重定向到 Stripe Checkout 页面
        redirectToCheckout(session.checkout_url);
        
    } catch (error) {
        console.error('[BuyCoinsPage] Purchase failed:', error);
        
        // 显示错误提示
        window.dispatchEvent(new CustomEvent('app:toast', {
            detail: {
                message: 'Failed to initiate payment. Please try again.',
                type: 'error',
                ttl: 3000
            }
        }));
        
        isProcessing.value = false;
    }
    // 注意：不在这里设置 isProcessing = false，因为页面会重定向
}

// Load pricing data
async function loadPricingData() {
    try {
        const response = await fetchRechargeRules();
        console.log('[BuyCoinsPage] Loaded recharge rules:', response);
        
        // Transform API data to display format
        pricingPlans.value = response.rules.map((rule: RechargeRule, index: number) => {
            const savePercentage = rule.bonus > 0 ? Math.round((rule.bonus / rule.coins) * 100) : 0;
            
            // Determine badge based on index and bonus
            let badge: string | undefined;
            if (index === 3) { // Assuming 4th item is most popular
                badge = 'MOST POPULAR';
            } else if (index === response.rules.length - 1) { // Last item is best value
                badge = 'BEST VALUE';
            }
            
            return {
                price: rule.usd.toFixed(2),
                coins: rule.coins,
                bonus: rule.bonus,
                save: savePercentage,
                badge
            };
        });
        
        // Auto-select the most popular plan
        const mostPopularIndex = pricingPlans.value.findIndex(plan => plan.badge === 'MOST POPULAR');
        if (mostPopularIndex !== -1) {
            selectedPlan.value = mostPopularIndex;
        }
        
    } catch (error) {
        console.error('[BuyCoinsPage] Failed to load pricing data:', error);
        
        // Auto-select the most popular plan
        selectedPlan.value = 3;
    }
}

// Watch for modal open/close
watch(() => props.isOpen, (newValue) => {
    if (newValue) {
        console.log('[BuyCoinsPage] Modal opened, current coin balance:', coinBalance.value);
    }
});

onMounted(() => {
    console.log('[BuyCoinsPage] Component mounted, loading pricing data...');
    loadPricingData();
});
</script>

<style scoped>
.buy-coins-content {
    padding: 20px;
    padding-top: 0px;
    color: #fff;
    min-height: 100%;
}

/* Balance Section */
.balance-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding: 0 4px;
}

.balance-label {
    color: #ccc;
    font-size: 16px;
}

.balance-amount {
    color: #ffd700;
    font-size: 18px;
    font-weight: 600;
}

/* Pricing Table */
.pricing-table {
    background: #363636;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 20px;
}

.table-header {
    display: grid;
    grid-template-columns: 20px 1.5fr 1fr 1fr 1fr;
    gap: 8px;
    padding: 16px 8px;
    background: #3f3f3f;
    border-bottom: 1px solid #444;
}

.table-header > div {
    color: #ccc;
    font-size: 14px;
    font-weight: 600;
    text-align: left;
}

.header-select {
    width: 20px;
}

/* Pricing Rows */
.pricing-row {
    position: relative;
    display: grid;
    grid-template-columns: 20px 1.5fr 1fr 1fr 1fr;
    gap: 8px;
    padding: 16px 8px;
    border-bottom: 1px solid #444;
    cursor: pointer;
    /* transition: all 0.05s ease; */
}

.pricing-row:last-child {
    border-bottom: none;
}

.pricing-row:hover {
    background: #333;
}

.pricing-row.selected {
    background: #192946;
    border: 1px solid #6ba1ff;
    border-radius: 12px;
    /* margin: 2px; */
    padding: 14px 7px;
}

/* Selection Column */
.plan-select {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    /* background: blue; */
}

.checkmark-icon {
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    margin-top: 3px;
}

@keyframes checkmark-appear {
    from {
        transform: scale(0);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

/* Plan Details */
.plan-price {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    text-align: left;
}

.plan-coins {
    color: #ffd700;
    font-size: 16px;
    font-weight: 500;
    text-align: left;
}

.plan-bonus {
    color: #a0c3ff;
    font-size: 16px;
    font-weight: 500;
    text-align: left;
}

.plan-save {
    color: #a0c3ff;
    font-size: 16px;
    font-weight: 500;
    text-align: left;
}

/* Badges */
.plan-badge {
    position: absolute;
    top: -12px;
    left: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
    z-index: 10;
}

.most-popular-badge {
    background: #890000;
    color: #fff;
}

.best-value-badge {
    background: #2058b9;
    color: #fff;
}

.badge-icon {
    font-size: 20px;
}



/* Guarantee Section */
.guarantee-section {
    display: flex;
    align-items: center;
    justify-content: center;
    /* gap: 8px; */
    /* background: rgba(255, 145, 0, 0.1); */
    /* border-radius: 8px;
    border: 1px solid rgba(74, 222, 128, 0.3); */
}

.guarantee-icon {
    color: #4ade80;
    font-size: 18px;
    margin-right: 5px;
}

.guarantee-text {
    color: #4ade80;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
}

/* Purchase Button */
.purchase-section {
    margin-top: 10px;
}

.purchase-button {
    width: 100%;
    padding: 16px;
    background: #2a78ff;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.purchase-button:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
}

.purchase-button:disabled {
    background: #666;
    cursor: not-allowed;
    transform: none;
}

/* Modal Styling */
.buy-coins-modal {
    --background: #1a1a1a;
}

.buy-coins-modal::part(content) {
    --background: #1a1a1a;
}
</style>