<template>
    <div class="gen-wrapper" ref="wrapperRef">
        <div class="gen-body">
            <PreviewImageArea
                :image="previewImage"
                instanceKey="tab-1P-preview"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import PreviewImageArea from '@/components/layout/PreviewImageArea.vue';

// 组件属性
interface Props {
    demoFaces?: string[];
    image?: string | null;
    selectedPlan: string;

}

const props = withDefaults(defineProps<Props>(), {
    image: null,
    demoFaces: () => []
});

// 组件事件
defineEmits<{
    openSubPage: [];
}>();

const previewImage = ref<string | null>(null);

const toLargeVariant = (url: string | null): string | null => {
    if (!url) return url;

    const queryIndex = url.indexOf('?');
    const hashIndex = url.indexOf('#');
    const cutIndex = [queryIndex, hashIndex]
        .filter(index => index >= 0)
        .reduce((prev, curr) => Math.min(prev, curr), Number.POSITIVE_INFINITY);
    const splitIndex = Number.isFinite(cutIndex) ? cutIndex : url.length;

    const mainPart = url.slice(0, splitIndex);
    const suffixPart = url.slice(splitIndex);

    const dotIndex = mainPart.lastIndexOf('.');
    if (dotIndex <= mainPart.lastIndexOf('/') + 1) return url;

    const namePart = mainPart.slice(0, dotIndex);
    if (namePart.endsWith('_l')) return url;

    return `${namePart}_l${mainPart.slice(dotIndex)}${suffixPart}`;
};

// 相关 DOM 引用
const wrapperRef = ref<HTMLElement | null>(null);
const generating = ref(false);
const selectedDemoFaces = ref<string[]>([]);

// 监听 image prop 变化
watch(() => props.image, (v) => { previewImage.value = toLargeVariant(v); }, { immediate: true });

const handleGenerate = async () => { 
    generating.value = true; 
    setTimeout(() => { generating.value = false; }, 1500); 
};



// 计算属性
// 组件挂载时初始化
onMounted(async () => {
    await nextTick();
});

// 暴露给父组件的方法
defineExpose({
    handleGenerate,
    setPreviewImage: (url: string | null) => { previewImage.value = toLargeVariant(url); },
    setSelectedDemoFaces: (faces: string[]) => { selectedDemoFaces.value = faces; }
});
</script>

<style scoped>
/* 生成器主体样式 */
.gen-wrapper {
    color: #fff;
    width: 100%;
    /* 使用容器的可用高度，而不是整个视口 */
    height: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
    --fs-normal-text: 16.5px;
    --fs-small-text: 15.4px;
    --fs-btn-large: 23.4px;
    --fs-tab: 20px;
}

.gen-body {
    /* 使用 flex: 1 让 PreviewImageArea 占用除 FixedBottomArea 外的所有空间 */
    flex: 1;
    overflow: hidden;
    position: relative;
    /* 确保触摸事件可以传播到父级模态框的手势处理器 */
    touch-action: none;
    pointer-events: auto;
}

/* 移除响应式代码 - 只支持移动端 */
</style>