<template>
    <div class="adaptive-content-area" :id="instanceId" ref="contentAreaRef">
        <div class="content-wrapper">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

const contentAreaRef = ref<HTMLDivElement>();

// 支持外部提供实例键，用于稳定且可复用的标识与日志/缓存分隔
const props = defineProps<{ instanceKey?: string }>();

// 为每个实例生成唯一ID（优先使用外部传入的 instanceKey）
const instanceId = props.instanceKey
    ? `adaptive-content-area-${props.instanceKey}`
    : `adaptive-content-area-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 使用更稳健的窗口高度：取 innerHeight 与 visualViewport.height 的较大值
// 目的：规避 iOS Safari 初次渲染时 visualViewport 偶发较小导致的低估
const getWindowHeight = () => {
    const vv = window.visualViewport?.height || 0;
    return Math.max(window.innerHeight, vv);
};

// 动态计算和设置当前实例的高度和位置
const resolveHeaderMetrics = (element: HTMLElement) => {
    const modal = element.closest('.page-like-modal') as HTMLElement | null;
    let headerHeight = 0;
    let headerPaddingBottom = 0;

    if (modal) {
        const modalStyles = getComputedStyle(modal);
        const heightVar = parseFloat(modalStyles.getPropertyValue('--plm-header-height'));
        const paddingVar = parseFloat(modalStyles.getPropertyValue('--plm-header-padding-bottom'));
        if (!Number.isNaN(heightVar) && heightVar > 0) {
            headerHeight = heightVar;
        }
        if (!Number.isNaN(paddingVar) && paddingVar >= 0) {
            headerPaddingBottom = paddingVar;
        }
    }

    if (!headerHeight) {
        const header = modal?.querySelector('.modal-header') as HTMLElement || document.querySelector('.plm-header') as HTMLElement;
        if (header) {
            headerHeight = header.offsetHeight;
            headerPaddingBottom = parseFloat(getComputedStyle(header).paddingBottom || '0') || 0;
        } else {
            headerHeight = 60;
        }
    }

    return { headerHeight, headerPaddingBottom };
};

const updateAreaSize = async () => {
    await nextTick();
    if (!contentAreaRef.value) return;

    const element = contentAreaRef.value;
    const windowHeight = getWindowHeight();

    const { headerHeight: topBarHeight, headerPaddingBottom: topBarPaddingBottom } = resolveHeaderMetrics(element);
    
    // 关键改进：基于当前实例的父容器计算底部区域高度
    const bottomAreaHeight = calculateBottomAreaHeightForInstance(element);
    
    // 计算可用高度 = 窗口高度 - 顶栏高度 - 底部区域高度 + 顶栏的 padding-bottom 高度
    const availableHeight = windowHeight - topBarHeight - bottomAreaHeight + topBarPaddingBottom;
    
    // console.log(`AdaptiveContentArea[${instanceId}] updateAreaSize:`, {
    //     windowHeight,
    //     topBarHeight,
    //     bottomAreaHeight,
    //     availableHeight,
    //     parentContext: getParentContext(element)
    // });
    
    // 应用计算结果
    element.style.height = `${availableHeight}px`;
    const topOffset = Math.max(topBarHeight - topBarPaddingBottom, 0);
    element.style.top = `${topOffset}px`;
};

// 初次与恢复场景：多次重算，等待布局稳定
const scheduleUpdate = (retries = 5, interval = 80) => {
    updateAreaSize();
    for (let i = 1; i <= retries; i++) setTimeout(() => updateAreaSize(), i * interval);
};

// 为当前实例计算底部区域高度
const calculateBottomAreaHeightForInstance = (element: HTMLElement): number => {
    // 找到当前实例所在的 tab 内容区域
    const tabPanel = element.closest('.tab-slide-panel, .plm-single');
    if (!tabPanel) {
        // 如果找不到 tab 容器，使用全局底部区域
        const globalBottomArea = document.querySelector('.fixed-bottom-area') as HTMLElement;
        return globalBottomArea ? globalBottomArea.offsetHeight : 0;
    }
    
    // 在当前 tab 容器内查找底部固定区域
    const localBottomArea = tabPanel.querySelector('.fixed-bottom-area') as HTMLElement;
    if (localBottomArea) {
        return localBottomArea.offsetHeight;
    }
    
    // 如果 tab 内没有局部底部区域，查找全局底部区域
    const globalBottomArea = document.querySelector('.plm-bottom-area, .fixed-bottom-area') as HTMLElement;
    return globalBottomArea ? globalBottomArea.offsetHeight : 0;
};

// 监听窗口大小变化
const resizeHandler = () => {
    updateAreaSize();
};

// 监听 tab 切换，只有当前实例在活跃 tab 中时才重新计算
const tabChangeHandler = () => {
    // 检查当前实例是否在活跃的 tab 中
    if (isInActiveTab()) {
    // 延迟计算，确保 DOM 更新完成
    setTimeout(updateAreaSize, 50);
    }
};

// 检查当前实例是否在活跃的 tab 中
const isInActiveTab = (): boolean => {
    if (!contentAreaRef.value) return false;
    
    const element = contentAreaRef.value;
    
    // 检查元素是否可见（不被隐藏）
    const computedStyle = getComputedStyle(element);
    const isVisible = computedStyle.display !== 'none' && 
                     computedStyle.visibility !== 'hidden' &&
                     computedStyle.opacity !== '0';
    
    if (!isVisible) return false;
    
    // 检查是否在当前活跃的 tab 面板中
    const tabPanel = element.closest('.tab-slide-panel');
    if (tabPanel) {
        const tabContainer = tabPanel.parentElement;
        if (tabContainer) {
            // 检查当前 tab 面板是否处于可视位置（transform: translateX(0))
            const transform = getComputedStyle(tabContainer).transform;
            const isActiveTab = transform.includes('matrix') ? 
                transform.includes('0, 0, 0, 1, 0, 0') || transform.includes('1, 0, 0, 1, 0, 0') :
                transform === 'none' || transform.includes('translateX(0');
            return isActiveTab;
        }
    }
    
    // 如果不在 tab 结构中，认为是活跃的
    return true;
};

// 监听DOM变化（如底部区域高度变化）
let observer: MutationObserver | null = null;
let modalDidPresentHandler: ((e: any) => void) | null = null;
let bottomAreaChangeHandler: (() => void) | null = null;

onMounted(() => {
    scheduleUpdate(5, 80);

    window.addEventListener('resize', resizeHandler);
    window.addEventListener('orientationchange', resizeHandler as any);
    window.addEventListener('focus', () => scheduleUpdate(4, 80));
    window.addEventListener('pageshow', (e: any) => scheduleUpdate(e?.persisted ? 6 : 4, 80));
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') scheduleUpdate(6, 80);
    });
    // visualViewport 支持（软键盘/内嵌视口变化）
    try {
        window.visualViewport?.addEventListener('resize', resizeHandler as any);
        window.visualViewport?.addEventListener('scroll', resizeHandler as any);
    } catch { /* ignore */ }
    // 可选：Capacitor 前后台切换（若存在）
    try {
        const cap: any = (window as any).Capacitor;
        const appPlugin = cap?.App || cap?.Plugins?.App;
        appPlugin?.addListener?.('appStateChange', (state: { isActive: boolean }) => {
            if (state?.isActive) scheduleUpdate(6, 80);
        });
    } catch { /* ignore */ }
    
    // 监听自定义的 tab 切换事件
    window.addEventListener('tab-changed', tabChangeHandler);
    
    // 监听 FixedBottomArea 的变化事件
    bottomAreaChangeHandler = () => {
        if (isInActiveTab()) {
            setTimeout(updateAreaSize, 50);
        }
    };
    window.addEventListener('fixed-bottom-area-changed', bottomAreaChangeHandler);
    
    // 观察当前实例的父容器变化
    observer = new MutationObserver(() => {
        if (isInActiveTab()) {
            updateAreaSize();
        }
    });
    
    // 观察整个模态框容器的变化
    const modalContainer = document.querySelector('.page-like-modal');
    if (modalContainer) {
        observer.observe(modalContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }
    
    // 延时再次执行，确保所有组件都已渲染
    setTimeout(() => {
        if (isInActiveTab()) {
            updateAreaSize();
        }
    }, 100);

    // Modal 完全展示后，在 iOS Safari 上再进行更密集的复测，降低首帧误差概率
    modalDidPresentHandler = () => scheduleUpdate(8, 90);
    window.addEventListener('modal-did-present', modalDidPresentHandler as any);
    
    // console.log(`AdaptiveContentArea[${instanceId}] mounted in context:`, getParentContext(contentAreaRef.value!));
});

onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler);
    window.removeEventListener('orientationchange', resizeHandler as any);
    try {
        window.visualViewport?.removeEventListener('resize', resizeHandler as any);
        window.visualViewport?.removeEventListener('scroll', resizeHandler as any);
    } catch { /* ignore */ }
    window.removeEventListener('tab-changed', tabChangeHandler);
    if (bottomAreaChangeHandler) {
        window.removeEventListener('fixed-bottom-area-changed', bottomAreaChangeHandler);
        bottomAreaChangeHandler = null;
    }
    if (modalDidPresentHandler) {
        window.removeEventListener('modal-did-present', modalDidPresentHandler as any);
        modalDidPresentHandler = null;
    }
    if (observer) {
        observer.disconnect();
        observer = null;
    }
});
</script>

<style scoped>
.adaptive-content-area {
    /* 使用绝对定位，由 JavaScript 动态设置位置和高度 */
    position: absolute;
    /* 上移顶栏 padding-bottom 6px 的一半，视觉上在垂直方向更居中 */
    top: -3px;
    left: 0;
    right: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-sizing: border-box;
    z-index: 1;
}

.content-wrapper {
    /* 内容在区域内居中显示 */
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
}

/* 移除响应式代码 - 只支持移动端，直接应用移动端样式 */
.adaptive-content-area {
    padding-top: 0;
}
</style>
