<template>
    <div class="icon-tabs-title">
        <div class="title-text" v-if="title">{{ title }}</div>
        <div class="icon-tabs">
            <div v-for="tab in tabs" :key="tab.key"
                :class="['tab-item', { active: currentTab === tab.key }]"
                @click="$emit('tabChange', tab.key)">
                <ion-icon v-if="tab.icon" :icon="tab.icon" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';

import type { TabItem } from '@/types/generator';

defineProps<{
    title?: string;
    tabs: TabItem[];
    currentTab?: string;
}>();

defineEmits<{
    tabChange: [key: string];
}>();
</script>

<style scoped>
.icon-tabs-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.title-text {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
}

.icon-tabs {
    display: flex;
    gap: 8px;
}

.tab-item {
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 20px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tab-item.active {
    background: var(--ion-color-primary);
    color: white;
}

.tab-item ion-icon {
    font-size: 20px;
}
</style>
