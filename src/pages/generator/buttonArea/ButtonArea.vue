<template>
    <div class="button-area">
        <PrimaryButton
            :label="generateLabel"
            :priceString="priceString"
            :pricePillClass="pricePillClass"
            :disabled="generating"
            @click="$emit('generate')"
        />
        <TaskETA
            :formattedEta="formattedEta"
            :generating="generating"
            :generatingText="generatingText"
        />
    </div>
</template>

<script setup lang="ts">
import PrimaryButton from './PrimaryButton.vue';
import TaskETA from './TaskETA.vue';

// 组件属性
interface Props {
    generateLabel: string;
    priceString: string | number;
    formattedEta: string;
    pricePillClass?: object;
    generating?: boolean;
    generatingText?: string;
}

withDefaults(defineProps<Props>(), {
    pricePillClass: () => ({}),
    generating: false,
    generatingText: 'Generating...'
});

// 组件事件
defineEmits<{
    generate: [];
}>();
</script>

<style scoped>
.button-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
}
</style>
