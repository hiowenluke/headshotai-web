<template>
    <AdaptiveContentArea ref="adaptiveContentRef" :instanceKey="resolvedInstanceKey" class="options-cards-area">
        <div class="cards-container" ref="cardsContainerRef" v-show="visible">
            <div class="cards-grid" :style="{ gap: cardSize.gap + 'px' }">
                <OptionCard
                    v-for="(cardInfo, index) in cardsInfos"
                    :key="index"
                    :cardSize="cardSize"
                    :title="cardInfo.title"
                    :counter="cardInfo.counter"
                    :coverUrl="cardInfo.coverUrl"
                    :popup="cardInfo.popup"
                    :arguments="cardInfo.arguments"
                    @openPopup="handleOpenPopup"
                >
                    <template v-if="hasCheckbox(cardInfo)" #checkbox-title>
                        <label :for="getCheckboxId(cardInfo)" class="checkbox-label" @click.stop>
                            <div class="checkbox-row" @click.stop="handleToggleCheckbox(cardInfo, !isCheckboxChecked(cardInfo))">
                                <div class="checkbox-icon-wrap">
                                    <SvgIcon :name="isCheckboxChecked(cardInfo) ? 'checkbox-outline' : 'square-outline'"
                                        class="checkbox-icon" :aria-checked="isCheckboxChecked(cardInfo) ? 'true' : 'false'"
                                        role="checkbox" size="26px"></SvgIcon>
                                </div>
                                <div class="checkbox-text">{{ getCheckboxLabel(cardInfo) }}</div>
                            </div>
                        </label>
                    </template>
                </OptionCard>
            </div>
        </div>
    </AdaptiveContentArea>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';
import AdaptiveContentArea from '@/components/layout/AdaptiveContentArea.vue';
import OptionCard from '@/components/layout/OptionCard.vue';

// 导入组合式函数
import { useOptionsCardsArea } from './composables/useOptionsCardsArea';

interface CardInfo {
    title: string;
    counter: string | number;
    coverUrl: string;
    popup: string;
    arguments: Record<string, any>;
}

interface Props {
    cardsInfos: CardInfo[];
    // 可选：用于跨 tab/父容器稳定标识该实例（例如："tab-20P-options"）
    instanceKey?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    openPopup: [popup: string, args: Record<string, any>];
    checkboxChange: [{ card: CardInfo; checked: boolean }];
}>();

// 模板引用
const adaptiveContentRef = ref<any>(null);
const cardsContainerRef = ref<HTMLElement | null>(null);

// 使用主要业务逻辑组合式函数
const {
    resolvedInstanceKey,
    visible,
    cardSize,
    hasCheckbox,
    isCheckboxChecked,
    getCheckboxLabel,
    getCheckboxId,
    getCheckboxValue,
    handleOpenPopup,
    handleToggleCheckbox
} = useOptionsCardsArea(props, emit, adaptiveContentRef);

// 提供外部访问的方法
defineExpose({
    getCheckboxValue,
});
</script>

<style scoped>
.cards-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}

.cards-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    /* gap 通过 :style 动态设置，确保横纵间距相同 */
    aspect-ratio: 1;
    padding: 0;
}
/* 复选框行样式 */
.checkbox-label {
    cursor: pointer;
}
.checkbox-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 0;
    border-bottom: 1px solid #4f4f4f;
    margin-bottom: 5px;
}
.checkbox-icon-wrap {
    display: flex;
    align-items: center;
    height: 24px;
}
.checkbox-icon {
    width: 26px;
    height: 26px;
    font-size: 26px;
    color: #fff;
    border-radius: 6px;
}
.checkbox-icon[aria-checked="true"] {
    background: #2a78ff;
}
.checkbox-text {
    display: flex;
    align-items: center;
    height: 24px;
    font-size: 20px;
    font-weight: bold;
    color: #fff;
}
</style>