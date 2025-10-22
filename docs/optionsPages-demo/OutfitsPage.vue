<template>
    <OptionsPageBase
        :is-open="isOpen"
        page-title="Outfits"
        option-type="outfits"
        :menu-config="MENU_CONFIG"
        :plan="plan"
        :initial-selection="initialSelection"
        instance-key="options-outfits"
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

// OutfitsPage 菜单配置
// 扁平结构，按服装类型分类
const MENU_CONFIG: MenuItemConfig[] = [
    {
        id: 'outfits-hot',
        name: 'HOT',
        displayName: 'HOT'
    },
    {
        id: 'outfits-shirt',
        name: 'Shirt',
        displayName: 'Shirt'
    },
    {
        id: 'outfits-vest',
        name: 'Vest',
        displayName: 'Vest'
    },
    {
        id: 'outfits-suit',
        name: 'Suit',
        displayName: 'Suit'
    },
    {
        id: 'outfits-suit-vest',
        name: 'Suit & Vest',
        displayName: 'Suit & Vest'
    }
];
</script>
