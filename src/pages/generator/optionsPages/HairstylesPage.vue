<template>
    <OptionsPage
        :is-open="isOpen"
        option-type="hairstyles"
        page-title="Hairstyles"
        :plan="plan"
        :initial-selection="initialSelection"
        :source-context="sourceContext"
        :folder-style="false"
        @close="$emit('close', $event)"
        @apply="$emit('apply', $event)"
    />
</template>

<script setup lang="ts">
import OptionsPage from './OptionsPage.vue';

interface Props {
    isOpen: boolean;
    plan?: string;
    initialSelection?: Record<string, string[]>;
    sourceContext?: string;
}

withDefaults(defineProps<Props>(), {
    plan: '20P',
    initialSelection: () => ({}),
    sourceContext: 'default'
});

defineEmits<{
    close: [payload: any];
    apply: [payload: any];
}>();
</script>
