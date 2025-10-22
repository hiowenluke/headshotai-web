<template>
    <div class="eta" v-if="!generating">Ready in {{ formattedEta }}</div>
    <div class="eta" v-else>{{ generatingText }}</div>
</template>

<script setup lang="ts">
// 组件属性
interface Props {
    formattedEta: string;
    generating?: boolean;
    generatingText?: string;
}

withDefaults(defineProps<Props>(), {
    generating: false,
    generatingText: 'Generating...'
});
</script>

<style scoped>
.eta {
    margin-top: 4px;
    font-size: var(--fs-small-text, 15.4px);
    color: #ffffff;
    font-weight: 500;
}
</style>
