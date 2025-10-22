<template>
    <AdaptiveContentArea ref="adaptiveContentRef" :instanceKey="instanceKey" class="preview-image-area">
        <img 
            v-if="previewImage" 
            :src="previewImage" 
            alt="preview" 
            class="preview-image"
            :style="previewImageStyle"
            v-show="visible"
        />
    </AdaptiveContentArea>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import AdaptiveContentArea from '@/components/layout/AdaptiveContentArea.vue';

// 组件属性
interface Props {
    image?: string | null;
    // 可选：用于跨 tab/父容器稳定标识该实例（例如："tab-1P-preview"）
    instanceKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
    image: null,
    instanceKey: undefined
});

// 组件事件
const emit = defineEmits<{
    sizeChange: [size: { width: number; height: number }];
}>();

const previewImage = ref<string | null>(null);
const adaptiveContentRef = ref<any>(null);
const instanceKey = computed(() => props.instanceKey || `preview-image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

// AdaptiveContentArea 尺寸状态
const contentAreaSize = ref({ width: 0, height: 0 });
const visible = ref(false);

// 本地缓存键
const cacheKey = computed(() => `PreviewImageArea:${instanceKey.value}:size`);

const readCache = () => {
    try {
        const raw = localStorage.getItem(cacheKey.value);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (typeof data?.width === 'number' && typeof data?.height === 'number') return data;
    } catch { /* ignore cache read */ }
    return null;
};

const writeCache = (size: { width: number; height: number }) => {
    try {
        localStorage.setItem(cacheKey.value, JSON.stringify(size));
    } catch { /* ignore cache write */ }
};

// 监听 image prop 变化
watch(() => props.image, (v) => { 
    previewImage.value = v; 
}, { immediate: true });

// 计算 previewImage 的样式
const previewImageStyle = computed(() => {
    const { width, height } = contentAreaSize.value;

    // 如果尺寸还没有计算出来，优先使用缓存，避免闪烁
    if (width === 0 || height === 0) {
        const cached = readCache();
        const base = cached ?? { width: window.innerWidth * 0.7, height: window.innerHeight * 0.7 };
        const estimatedWidth = base.width * 0.7; // 继续使用先前比例策略
        const estimatedHeight = estimatedWidth * 1.25;

        return {
            width: `${estimatedWidth}px`,
            height: `${estimatedHeight}px`,
            maxWidth: `${estimatedWidth}px`,
            maxHeight: `${estimatedHeight}px`
        };
    }

    let imageWidth: number;
    let imageHeight: number;
    
    // 判断 AdaptiveContentArea 的形状
    if (width > height) {
        // 横向矩形：用高度的 80% 作为图片高度
        imageHeight = height * 0.8;
        imageWidth = imageHeight * 0.8; // 宽度为高度的 0.8 倍
    } else {
        // 正方形或纵向矩形：用宽度的 70% 作为图片宽度
        imageWidth = width * 0.7;
        imageHeight = imageWidth * 1.25; // 高度为宽度的 1.25 倍
    }

    return {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        maxWidth: `${imageWidth}px`,
        maxHeight: `${imageHeight}px`
    };
});

// 更新 AdaptiveContentArea 尺寸
const updateContentAreaSize = () => {
    if (adaptiveContentRef.value?.$el) {
        const rect = adaptiveContentRef.value.$el.getBoundingClientRect();
        const newSize = {
            width: rect.width,
            height: rect.height
        };
        contentAreaSize.value = newSize;
    writeCache(newSize);
        
        // 向父组件发出尺寸变化事件
        emit('sizeChange', newSize);
    }
};

// ResizeObserver 监听尺寸变化
let resizeObserver: ResizeObserver | null = null;

// 稳定检测：连续两次测量差异很小即视为稳定
let last: { w: number; h: number } | null = null;
let stableCount = 0;
const checkStable = () => {
    if (!adaptiveContentRef.value?.$el) return;
    const r = adaptiveContentRef.value.$el.getBoundingClientRect();
    const cur = { w: Math.round(r.width), h: Math.round(r.height) };
    if (last && Math.abs(cur.w - last.w) <= 1 && Math.abs(cur.h - last.h) <= 1) {
        stableCount++;
    } else {
        stableCount = 0;
    }
    last = cur;
    if (stableCount >= 2) {
        visible.value = true;
    } else {
        setTimeout(checkStable, 60);
    }
};
const scheduleStabilityCheck = () => { stableCount = 0; last = null; setTimeout(checkStable, 60); };

// 事件处理：tab 切换与 modal 展示完成后复测
const onTabChanged = (e: any) => {
    const active = e?.detail?.activeTab;
    if (!active) return;
    setTimeout(() => { updateContentAreaSize(); scheduleStabilityCheck(); }, 80);
};
const onModalDidPresent = () => {
    let tries = 0;
    const tick = () => {
        tries++;
        updateContentAreaSize();
        if (tries < 4) setTimeout(tick, 90);
    };
    setTimeout(tick, 50);
    scheduleStabilityCheck();
};

onMounted(async () => {
    await nextTick();
    // 先用缓存预热，避免首次白屏/跳动
    const cached = readCache();
    if (cached) contentAreaSize.value = cached;

    // 移除多余延迟，但在下一帧执行一次真实测量
    updateContentAreaSize();
    
    // 监听 AdaptiveContentArea 尺寸变化
    if (adaptiveContentRef.value?.$el && window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => {
            updateContentAreaSize();
        });
        resizeObserver.observe(adaptiveContentRef.value.$el);
    }
    
    // 监听窗口尺寸变化
    const handleResize = () => {
        updateContentAreaSize();
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // 稳定后再显示，避免可见期内跳动
    setTimeout(checkStable, 60);

    // 监听 tab 切换与 modal 展示完成事件，进行复测
    window.addEventListener('tab-changed', onTabChanged as any);
    window.addEventListener('modal-did-present', onModalDidPresent as any);
});

onUnmounted(() => {
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
    const handleResize = () => {
        updateContentAreaSize();
    };
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
    window.removeEventListener('tab-changed', onTabChanged as any);
    window.removeEventListener('modal-did-present', onModalDidPresent as any);
});

// 向父组件暴露更新尺寸的方法
defineExpose({
    updateSize: updateContentAreaSize,
    contentAreaSize: computed(() => contentAreaSize.value)
});
</script>

<style scoped>
/* 预览图片样式 */
.preview-image {
    position: absolute;
    object-fit: cover;
    border-radius: 20px;
    /* 动态计算 top 为容器的高度的一半，
    并扣除 6px（tab 栏的 padding-bottom 的高度）的一半作为偏移量，
    让对象在视觉上的垂直方向上完全居中。
    */
    top: calc(50% - 3px);
    transform: translateY(calc(-50% - 3px));
}
</style>
