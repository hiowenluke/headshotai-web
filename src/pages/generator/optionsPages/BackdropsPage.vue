<template>
    <OptionsPage
        :is-open="isOpen"
        option-type="backdrops"
        page-title="Backdrop Types"
        :plan="plan"
        :initial-selection="initialSelection"
        :source-context="sourceContext"
        :folder-style="true"
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
