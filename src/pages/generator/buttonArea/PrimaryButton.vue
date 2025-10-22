<template>
    <button 
        class="primary-btn" 
        @click="$emit('click')" 
        :disabled="disabled"
    >
        <span class="spacer"></span>
        <span class="gen-label">{{ label }}</span>
        <span class="price-pill" :class="pricePillClass">
            <SvgIcon name="flash-outline-bold" class="coin" size="20px" color="#FFD700" />{{ priceString }}
        </span>
    </button>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/icons/SvgIcon.vue';

// 组件属性
interface Props {
    label: string;
    priceString: string | number;
    pricePillClass?: object;
    disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
    pricePillClass: () => ({}),
    disabled: false
});

// 组件事件
defineEmits<{
    click: [];
}>();
</script>

<style scoped>
.primary-btn {
    width: 90%;
    height: 50px;
    background: #2a78ff;
    color: #fff;
    border: none;
    font-size: var(--fs-btn-large, 23.4px);
    font-weight: 700;
    padding: 0 20px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.6);
    position: relative;
}

.primary-btn .spacer {
    flex: 1;
}

.primary-btn .gen-label {
    order: 2;
    white-space: nowrap;
}

.primary-btn .price-pill {
    order: 3;
}

.primary-btn:disabled {
    opacity: 0.6;
}

.price-pill {
    background: #2d2f33;
    color: #FFD700;
    font-weight: 700;
    font-size: 22px;
    padding: 6px 18px;
    border-radius: 50px;
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 88px;
    justify-content: center;
}

.price-pill.w-wide {
    min-width: 108px;
    padding-left: 14px;
    padding-right: 14px;
}

.price-pill.w-wide .coin {
    color: #FFD700;
    margin-left: -4px;
}

.price-pill .coin {
    color: #FFD700;
    font-size: 23.4px;
}
</style>
