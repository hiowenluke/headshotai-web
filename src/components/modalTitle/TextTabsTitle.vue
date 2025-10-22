<template>
    <!-- 自适应模式：仅当 tabs 数量 >= 5 或显式 adaptive=true 时启用 -->
    <AdaptiveTabsTitle
        v-if="useAdaptive"
        v-bind="adaptiveProps"
    />
    <!-- 等分模式（常态）：按 barWidth 等分每个 tab 的像素宽度 -->
    <div v-else class="equal-tabs plan-tabs" ref="tabsRef" :style="{ width: barWidthPx }">
        <!-- 平滑过渡：活动指示器在等分模式下横向滑动 -->
        <div class="active-indicator" :style="indicatorStyle"></div>
        <div
            v-for="tab in tabs"
            :key="tab.key"
            :class="['tab', { active: modelValue === tab.key }]"
            :style="{ width: equalTabWidthPx }"
            @click="onSelect(tab.key)"
        >
            <span class="tab-label">{{ tab.label || tab.key }}</span>
            <HotPill v-if="tab.hot && !hotDismissed" @click.stop="$emit('hot-clicked')" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, PropType, computed, onMounted, onUnmounted, nextTick } from 'vue';
import HotPill from '@/components/pill/HotPill.vue';
import AdaptiveTabsTitle from '@/components/modalTitle/AdaptiveTabsTitle.vue';

import type { TabItem } from '@/types/generator';

export default defineComponent({
    name: 'TextTabsTitle',
    components: { HotPill, AdaptiveTabsTitle },
    props: {
        tabs: { type: Array as PropType<TabItem[]>, required: true },
        modelValue: { type: String, required: true },
        // 可选：强制启用自适应（动态宽度）模式；默认仅当 tabs 数量 >= 5 时启用
        adaptive: { type: Boolean, default: false },
        // 可选：传入整个 tab 栏的总宽度（像素）。未传入时按规则自动计算
        barWidth: { type: Number, default: 0 },
        // 以下仅用于自适应模式时透传给 AdaptiveTabsTitle
        activeScale: { type: Number, default: 1.3 },
        groupScale: { type: Number, default: 0.95 },
        firstGapFactor: { type: Number, default: 0.72 },
        lastGapFactor: { type: Number, default: 1.1 },
        hotDismissed: { type: Boolean, default: false }
    },
    emits: ['update:modelValue', 'hot-clicked'],
    setup(props, { emit }) {
        const tabsRef = ref<HTMLElement | null>(null);
        const containerWidth = ref(0);
        let ro: ResizeObserver | null = null;

        // 模式判断：当 tabs 数量 >= 5 或者 adaptive=true 时启用自适应
        const useAdaptive = computed(() => props.adaptive || props.tabs.length >= 5);

        // 自适应组件的透传 props
        const adaptiveProps = computed(() => ({
            tabs: props.tabs,
            modelValue: props.modelValue,
            activeScale: props.activeScale,
            groupScale: props.groupScale,
            firstGapFactor: props.firstGapFactor,
            lastGapFactor: props.lastGapFactor,
            hotDismissed: props.hotDismissed,
            'onUpdate:modelValue': (v: string) => emit('update:modelValue', v),
            onHotClicked: () => emit('hot-clicked')
        }));

        // 自动 bar 宽度：2->50%，3->60%，4->70%，否则占满父容器
        const autoBarWidth = computed(() => {
            const n = props.tabs.length;
            const base = containerWidth.value;
            if (!base) return 0;
            if (n === 2) return Math.floor(base * 0.5);
            if (n === 3) return Math.floor(base * 0.6);
            if (n === 4) return Math.floor(base * 0.7);
            return base;
        });
        const effectiveBarWidth = computed(() => props.barWidth > 0 ? props.barWidth : autoBarWidth.value);
        const barWidthPx = computed(() => effectiveBarWidth.value > 0 ? `${effectiveBarWidth.value}px` : 'auto');
        const equalTabWidthPx = computed(() => {
            const n = Math.max(1, props.tabs.length);
            const total = effectiveBarWidth.value || containerWidth.value;
            const horizontalPadding = 8; // 与 CSS 中 padding: 4px 对齐
            const per = total > 0 ? Math.floor((total - horizontalPadding) / n) : 0;
            return `${Math.max(40, per)}px`;
        });
        const equalTabWidthNumber = computed(() => {
            const n = Math.max(1, props.tabs.length);
            const total = effectiveBarWidth.value || containerWidth.value;
            const horizontalPadding = 8;
            const per = total > 0 ? Math.floor((total - horizontalPadding) / n) : 0;
            return Math.max(40, per);
        });

        const activeIndex = computed(() => Math.max(0, props.tabs.findIndex(t => t.key === props.modelValue)));
        const indicatorStyle = computed(() => {
            // 指示器定位：CSS 中已设置 left: 4px，这里只需按索引位移每个等分宽度
            const x = activeIndex.value * equalTabWidthNumber.value;
            const w = equalTabWidthNumber.value;
            return {
                width: `${w}px`,
                transform: `translateX(${x}px)`
            };
        });

        const onSelect = (key: string) => {
            emit('update:modelValue', key);
            const tab = props.tabs.find(t => t.key === key);
            if (tab?.hot && !props.hotDismissed) emit('hot-clicked');
        };

        const updateContainerWidth = () => {
            const el = tabsRef.value;
            const target = el?.parentElement || el;
            if (!target) return;
            const w = Math.round(target.getBoundingClientRect().width);
            if (w && Math.abs(w - containerWidth.value) > 1) containerWidth.value = w;
        };

        onMounted(() => {
            nextTick(() => updateContainerWidth());
            try {
                ro = new ResizeObserver(() => updateContainerWidth());
                const target = tabsRef.value?.parentElement || tabsRef.value;
                if (ro && target) ro.observe(target);
            } catch { /* ignore */ }
            const resize = () => updateContainerWidth();
            window.addEventListener('resize', resize);
            onUnmounted(() => {
                try { ro?.disconnect(); } catch { /* ignore */ }
                window.removeEventListener('resize', resize);
            });
        });

        return { tabsRef, onSelect, useAdaptive, adaptiveProps, equalTabWidthPx, barWidthPx, indicatorStyle };
    }
});
</script>
<style scoped>
.equal-tabs, .adaptive-tabs {
    display: flex;
    background: #343739;
    padding: 4px;
    border-radius: 40px;
}
.equal-tabs {
    position: relative;
}
.equal-tabs .active-indicator {
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: 4px;
    background: #ffffff;
    border-radius: 32px;
    transition: transform .22s cubic-bezier(0.2, 0.8, 0.2, 1), width .22s ease;
    z-index: 1;
}
.equal-tabs .tab, .adaptive-tabs .tab {
    position: relative;
    box-sizing: border-box; /* 确保设置的 width 包含 padding，与指示器宽度对齐 */
    min-width: 55px;
    padding: 4px 5px !important; /* 从 9px 减少到 8px，减少约 11% */
    text-align: center;
    color: #ffffff;
    font-weight: 700;
    font-size: var(--fs-tab, 20px);
    border-radius: 32px;
    cursor: pointer;
    transition: width .2s ease, transform .2s ease, background .2s ease, color .2s ease;
    white-space: nowrap;
    z-index: 2; /* 位于活动指示器之上 */
}
.equal-tabs .tab.active, .adaptive-tabs .tab.active {
    /* 等分模式下由 active-indicator 绘制背景，这里不再设置背景 */
    background: transparent;
    color: #111315;
}
.equal-tabs .tab .tab-label {
    display: inline-block;
    transition: transform .18s ease;
}
.equal-tabs .tab.active .tab-label {
    transform: scale(1.05);
}
/* 移除响应式代码 - 只支持移动端，直接应用移动端样式 */
.equal-tabs .tab, .adaptive-tabs .tab {
    min-width: 51px;
    padding: 3px 6px !important;
}
</style>
