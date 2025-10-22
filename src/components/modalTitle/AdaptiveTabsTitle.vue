<template>
    <div class="adaptive-tabs plan-tabs" ref="tabsRef">
        <div v-for="tab in tabs" :key="tab.key" :class="['tab', { active: modelValue === tab.key }]"
            @click="onSelect(tab.key)">
            <span class="tab-label">{{ tab.label || tab.key }}</span>
            <HotPill 
                v-if="tab.hot && !hotDismissed" 
                @click.stop="$emit('hot-clicked')"
            />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, watch, PropType, nextTick, computed, onUnmounted } from 'vue';
import HotPill from '@/components/pill/HotPill.vue';
import type { TabItem } from '@/types/generator';

export default defineComponent({
    name: 'AdaptiveTabsTitle',
    components: { HotPill },
    props: {
        tabs: { type: Array as PropType<TabItem[]>, required: true },
        modelValue: { type: String, required: true },
        activeScale: { type: Number, default: 1.3 },
        groupScale: { type: Number, default: 0.95 },
        firstGapFactor: { type: Number, default: 0.72 },
        lastGapFactor: { type: Number, default: 1.1 },
        hotDismissed: { type: Boolean, default: false }
    },
    emits: ['update:modelValue', 'hot-clicked'],
    setup(props, { emit }) {
        const tabsRef = ref<HTMLElement | null>(null);
        const baseTabWidths = ref<number[]>([]);
        const activeIndex = computed(() => props.tabs.findIndex(t => t.key === props.modelValue));

        const measure = () => {
            const wrap = tabsRef.value; if (!wrap) return;
            const els = Array.from(wrap.children) as HTMLElement[];
            els.forEach(el => { 
                el.style.width = ''; 
                el.style.transform = ''; 
                el.style.marginRight = '';
                el.style.zIndex = '';
            });
            wrap.offsetHeight;
            baseTabWidths.value = els.map(el => el.getBoundingClientRect().width);
        };
        const applyLayout = () => {
            const wrap = tabsRef.value; if (!wrap) return;
            const n = baseTabWidths.value.length; if (!n) return;
            const idx = activeIndex.value; if (idx < 0) return;
            const els = Array.from(wrap.children) as HTMLElement[];
            els.forEach(el => {
                el.style.width = '';
                el.style.marginRight = '';
                el.style.zIndex = '';
            });
            const normalWidthRaw = Math.max(...baseTabWidths.value);
            const baseNormal = Math.round(normalWidthRaw * props.groupScale);
            const scaled = baseTabWidths.value.map((_, i) => {
                const tab = props.tabs[i];
                const isActive = i === idx;
                const raw = (tab.key === '1P') ? Math.round(baseNormal * 0.9) : baseNormal;
                return isActive ? Math.round(raw * props.activeScale) : raw;
            });
            const containerW = wrap.getBoundingClientRect().width;
            const totalW = scaled.reduce((a, b) => a + b, 0);
            const remaining = containerW - 8 - totalW; // 8 = horizontal padding sum
            let baseGap = 3;
            const nEls = els.length;
            if (nEls > 1) {
                const factors: number[] = [];
                for (let i = 0; i < nEls - 1; i++) {
                    if (i === 0) factors.push(props.firstGapFactor);
                    else if (i === nEls - 2) factors.push(props.lastGapFactor);
                    else factors.push(1);
                }
                const sumF = factors.reduce((a, b) => a + b, 0);
                if (sumF > 0) {
                    const candidate = Math.floor(remaining / sumF);
                    if (!isNaN(candidate) && candidate > 0) baseGap = candidate;
                }
                if (baseGap < 1) baseGap = 1;
                els.forEach((el, i) => {
                    el.style.width = scaled[i] + 'px';
                    el.style.zIndex = i === idx ? '2' : '1';
                    if (i < nEls - 1) {
                        const factor = (i === 0) ? props.firstGapFactor : (i === nEls - 2 ? props.lastGapFactor : 1);
                        const px = Math.max(1, Math.floor(baseGap * factor));
                        el.style.marginRight = px + 'px';
                    } else {
                        el.style.marginRight = '0px';
                    }
                });
            } else {
                els.forEach((el, i) => { 
                    el.style.width = scaled[i] + 'px'; 
                    el.style.zIndex = i === idx ? '2' : '1';
                    el.style.marginRight = '0px';
                });
            }
        };
        const schedule = () => nextTick().then(() => { measure(); applyLayout(); });

        watch(() => props.modelValue, () => schedule());
        watch(() => props.tabs, () => { baseTabWidths.value = []; schedule(); }, { deep: true });

        const onSelect = (key: string) => {
            emit('update:modelValue', key);
            const tab = props.tabs.find(t => t.key === key);
            if (tab?.hot && !props.hotDismissed) emit('hot-clicked');
        };

        nextTick(() => { measure(); applyLayout(); setTimeout(() => { measure(); applyLayout(); }, 120); });
        const resize = () => applyLayout();
        window.addEventListener('resize', resize);
        onUnmounted(() => window.removeEventListener('resize', resize));

        return { tabsRef, onSelect };
    }
});
</script>
<style scoped>
.adaptive-tabs {
    display: flex;
    background: #343739;
    padding: 4px;
    border-radius: 40px;
}
.adaptive-tabs .tab {
    position: relative;
    min-width: 55px;
    padding: 4px 5px !important;
    text-align: center;
    color: #ffffff;
    font-weight: 700;
    font-size: var(--fs-tab, 20px);
    border-radius: 32px;
    cursor: pointer;
    transition: width .2s ease, transform .2s ease, background .2s ease;
    white-space: nowrap;
}
.adaptive-tabs .tab.active { background: #ffffff; color: #111315; }
/* 移除响应式代码 - 只支持移动端，直接应用移动端样式 */
.adaptive-tabs .tab { 
  min-width: 51px; 
  padding: 3px 6px !important; 
}
</style>