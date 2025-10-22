<template>
    <OptionsPageBase
        :is-open="isOpen"
        page-title="Poses"
        option-type="poses"
        :menu-config="MENU_CONFIG"
        :plan="plan"
        :initial-selection="initialSelection"
        instance-key="options-poses"
        @close="$emit('close', $event)"
        @apply="$emit('apply', $event)"
    />
</template>

<script setup lang="ts">
import OptionsPageBase from './OptionsPageBase.vue';
import type { MenuItemConfig } from './composables/useBackdropMenus';

interface Props {
    isOpen: boolean;
    plan?: string;
    initialSelection?: Record<string, string[]>;
}

withDefaults(defineProps<Props>(), {
    plan: '20P',
    initialSelection: () => ({})
});

interface SelectionResult {
    total: number;
    selections: Record<string, string[]>;
    selectedUrls: string[];
}

defineEmits<{
    close: [payload: SelectionResult];
    apply: [payload: SelectionResult];
}>();

// PosesPage 菜单配置
// 扁平结构，按拍摄角度/距离分类
const MENU_CONFIG: MenuItemConfig[] = [
    {
        id: 'poses-hot',
        name: 'HOT',
        displayName: 'HOT'
    },
    {
        id: 'poses-close-up',
        name: 'Close-Up',
        displayName: 'Close-Up'
    },
    {
        id: 'poses-waist-up',
        name: 'Waist-Up',
        displayName: 'Waist-Up'
    },
    {
        id: 'poses-half-body',
        name: 'Half-Body',
        displayName: 'Half-Body'
    }
];
</script>
