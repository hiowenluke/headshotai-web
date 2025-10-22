<template>
    <OptionsPageBase
        :is-open="isOpen"
        page-title="Hairstyles"
        option-type="hairstyles"
        :menu-config="MENU_CONFIG"
        :plan="plan"
        :initial-selection="initialSelection"
        instance-key="options-hairstyles"
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

// HairstylesPage 菜单配置
// 扁平结构，按发型长度分类
const MENU_CONFIG: MenuItemConfig[] = [
    {
        id: 'hairstyles-hot',
        name: 'HOT',
        displayName: 'HOT'
    },
    {
        id: 'hairstyles-extra-short',
        name: 'Extra-Short',
        displayName: 'Extra Short'
    },
    {
        id: 'hairstyles-short',
        name: 'Short',
        displayName: 'Short'
    },
    {
        id: 'hairstyles-medium',
        name: 'Medium',
        displayName: 'Medium'
    },
    {
        id: 'hairstyles-long',
        name: 'Long',
        displayName: 'Long'
    }
];
</script>
