<template>
    <div class="fixed-bottom-area" ref="bottomAreaRef">
        <div class="fixed-bottom-content">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

const bottomAreaRef = ref<HTMLDivElement>();
let useDynamicPositioning = true;

// 获取窗口可视高度（优先 visualViewport）
const getWindowHeight = () => (window.visualViewport?.height || window.innerHeight);

// 添加暂停布局更新的机制，防止文件选择器期间的抖动
let layoutUpdatePaused = false;
const pauseLayoutUpdate = () => { layoutUpdatePaused = true; };
const resumeLayoutUpdate = () => { 
    layoutUpdatePaused = false; 
    // 恢复后立即更新一次
    setTimeout(() => updatePosition(), 100);
};

// 动态设置 top 位置确保元素完全显示在屏幕内
const updatePosition = async () => {
    if (!useDynamicPositioning) return;
    await nextTick();
    if (!bottomAreaRef.value || layoutUpdatePaused) return;

    const element = bottomAreaRef.value;
    const windowHeight = getWindowHeight();
    const elementHeight = element.offsetHeight;
    const elementBorderTop = parseFloat(getComputedStyle(element).borderTopWidth) || 0;
    
    // 获取顶栏的高度、padding-bottom 高度
    const topBar = document.querySelector('.plm-header');
    const topBarHeight = topBar ? topBar.clientHeight : 0;
    const topBarPaddingBottom = topBar ? parseFloat(getComputedStyle(topBar).paddingBottom) : 0;
    
    // 计算 top 位置 = 窗口高度 - 元素高度 - 顶栏的高度 + 顶栏的 padding-bottom 高度
    const topPosition = windowHeight - elementHeight - topBarHeight + topBarPaddingBottom + elementBorderTop;
    // console.log('FixedBottomArea updatePosition:', {
    //     windowHeight,
    //     elementHeight,
    //     topPosition
    // });
    // 设置元素的 top 位置
    element.style.top = `${topPosition}px`;
};

// 监听窗口大小变化和内容变化
const resizeHandler = () => { updatePosition(); };

// 当应用从后台返回/页面从 bfcache 恢复 或标签重新获取焦点时，尝试多次重算，避免第一次布局尚未稳定
const scheduleUpdate = (retries = 5, interval = 80) => {
    if (!useDynamicPositioning) return;
    updatePosition();
    for (let i = 1; i <= retries; i++) {
        setTimeout(() => updatePosition(), i * interval);
    }
};

const onPageShow = (e: PageTransitionEvent) => {
    // e.persisted 为 true 表示从 bfcache 恢复
    scheduleUpdate(e.persisted ? 6 : 4, 80);
};

const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
        scheduleUpdate(6, 80);
    }
};

const onFocus = () => { scheduleUpdate(4, 80); };

const onOrientationChange = () => { scheduleUpdate(4, 80); };

// 监听 PageLikeModal 发布的 tab 切换事件，防止切换后高度变化导致错位
const onTabChanged = () => { scheduleUpdate(3, 60); };

let observer: MutationObserver | null = null;

onMounted(() => {
    const element = bottomAreaRef.value;
    if (!element) return;

    const embeddedParent = element.closest('.plm-bottom-area');
    if (embeddedParent) {
        useDynamicPositioning = false;
        element.classList.add('fixed-bottom-area--embedded');
    }

    if (useDynamicPositioning) {
        // 初次也多次尝试，适配首屏布局渐进就绪的场景
        scheduleUpdate(5, 80);
        window.addEventListener('resize', resizeHandler);
        window.addEventListener('orientationchange', onOrientationChange as any);
        window.addEventListener('pageshow', onPageShow as any);
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('tab-changed' as any, onTabChanged as any);

        // 可选：在支持 Capacitor 的环境下，监听应用前后台切换
        // 动态导入，避免在纯 Web 环境报错
        try {
            const cap: any = (window as any).Capacitor;
            const appPlugin = cap?.App || cap?.Plugins?.App;
            appPlugin?.addListener?.('appStateChange', (state: { isActive: boolean }) => {
                if (state?.isActive) scheduleUpdate(6, 80);
            });
        } catch (_) { /* ignore */ }

        // 监听 visualViewport，处理软键盘弹出/收起与内嵌 WebView 视口变化
        try {
            window.visualViewport?.addEventListener('resize', resizeHandler as any);
            window.visualViewport?.addEventListener('scroll', resizeHandler as any);
        } catch (_) { /* ignore */ }
    } else {
        // 在嵌入模式下仍然通知内容区域更新
        window.dispatchEvent(new CustomEvent('fixed-bottom-area-changed'));
    }

    // 使用 MutationObserver 监听内容变化
    observer = new MutationObserver(() => {
        updatePosition();
        window.dispatchEvent(new CustomEvent('fixed-bottom-area-changed'));
    });

    observer.observe(element, {
        childList: true,
        subtree: true,
        attributes: true
    });
});

onUnmounted(() => {
    if (useDynamicPositioning) {
        window.removeEventListener('resize', resizeHandler);
        // 清理 visualViewport 监听
        try {
            window.visualViewport?.removeEventListener('resize', resizeHandler as any);
            window.visualViewport?.removeEventListener('scroll', resizeHandler as any);
        } catch (_) { /* ignore */ }
        window.removeEventListener('orientationchange', onOrientationChange as any);
        window.removeEventListener('pageshow', onPageShow as any);
        window.removeEventListener('focus', onFocus);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('tab-changed' as any, onTabChanged as any);
    }
    if (observer) {
        observer.disconnect();
        observer = null;
    }
});

// 暴露更新位置的方法供父组件调用
defineExpose({
    updatePosition,
    pauseLayoutUpdate,
    resumeLayoutUpdate
});
</script>

<style scoped>
.fixed-bottom-area {
    /* 使用绝对定位，通过 JavaScript 动态设置 top 位置 */
    position: absolute;
    left: 0;
    right: 0;
    width: 100%;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    box-sizing: border-box;
    background: #343739;
    /* 高度完全由内容决定，支持动态变化 */
    height: auto;
    flex-shrink: 0; /* 防止被压缩 */
    /* 确保在最上层显示 */
    z-index: 1000;
}

.fixed-bottom-content {
    /* 移动端优化的内边距 */
    padding: 0 20px;
    /* 底部安全区域处理 */
    padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: #fff;
    /* 确保内容高度自适应 */
    min-height: auto;
    box-sizing: border-box;
    padding-left: 0;
    padding-right: 0;
}

.fixed-bottom-area--embedded {
    position: static;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    width: 100%;
}

/* 移除响应式代码 - 只支持移动端，直接应用移动端样式 */
.fixed-bottom-content {
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
    gap: 8px;
}
</style>
