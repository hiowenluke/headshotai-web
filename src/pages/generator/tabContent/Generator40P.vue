<template>
    <div class="gen-wrapper">
        <div class="gen-body">
            <div class="placeholder-content">
                <h2>40P Generator</h2>
                <p>40P 生成器界面待开发</p>
                <div class="price-info">
                    价格: {{ priceString || 0 }} 币
                </div>
                <div class="eta-info">
                    预计时间: {{ formattedEta || 'Calculating...' }}
                </div>
                <!-- 
                接入模板（取消注释即可使用）：
                1) 预览图区域（基于 AdaptiveContentArea，含缓存与稳定显示）
                   建议 instanceKey："tab-40P-preview" 或加 modalId 前缀（如 gen-<modalId>-40P-preview）

                <PreviewImageArea
                    :image="previewImage"
                    instanceKey="tab-40P-preview"
                />

                2) 选项卡区域（2x2 卡片网格，含缓存与稳定显示）
                   建议 instanceKey："tab-40P-options" 或加 modalId 前缀

                <OptionsCardsArea
                    :cardsInfos="cardsInfos"
                    instanceKey="tab-40P-options"
                    @openPopup="handleOpenPopup"
                />
                -->
                

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { GeneratorProps } from '@/types/generator';

defineProps<GeneratorProps>();

// 发送事件给父组件
const emit = defineEmits<{
    openSubPage: [];
    selectedCountChange: [count: number];
}>();

// 模拟选中数量为1
import { onMounted } from 'vue';

onMounted(() => {
    emit('selectedCountChange', 1);
});
</script>

<style scoped>
@import '@/theme/generator-common.css';
</style>