/**
 * 垂直滚动弹性回弹效果
 * 
 * 为 Android 和其他不支持原生弹性滚动的平台提供类似 iOS 的回弹效果
 * 
 * 专为 CategoryPanels 的面板内容设计，与 NativeScrollGesture 的水平手势配合使用
 * 手势方向检测逻辑参考自 src/components/gesture/composables/useTouchGesture.ts
 * 
 * @see src/components/gesture/NativeScrollGesture.vue - 水平滚动手势
 * @see src/components/gesture/composables/useTouchGesture.ts - 手势方向检测
 */

interface BounceState {
    startX: number;
    startY: number;
    startScrollTop: number;
    isDragging: boolean;
    velocity: number;
    lastY: number;
    lastTime: number;
    rafId: number | null;
    gestureDetected: boolean;
    isVerticalGesture: boolean;
}

export function useVerticalBounce() {
    const bounceElements = new Map<HTMLElement, BounceState>();

    // 检测是否是 iOS（iOS 原生支持弹性滚动）
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    // 配置参数
    const BOUNCE_RESISTANCE = 0.4; // 拉动阻力（越小越难拉）
    const BOUNCE_BACK_DURATION = 300; // 回弹动画时长（毫秒）
    const MAX_BOUNCE_DISTANCE = 150; // 最大回弹距离
    const GESTURE_THRESHOLD = 10; // 手势方向检测阈值（像素）

    /**
     * 为元素启用弹性回弹
     */
    function enableBounce(element: HTMLElement) {
        // iOS 原生支持，不需要自定义实现
        if (isIOS) {
            (element.style as any).webkitOverflowScrolling = 'touch';
            return;
        }

        // 已经启用过，跳过
        if (bounceElements.has(element)) {
            return;
        }

        // 初始化状态
        const state: BounceState = {
            startX: 0,
            startY: 0,
            startScrollTop: 0,
            isDragging: false,
            velocity: 0,
            lastY: 0,
            lastTime: 0,
            rafId: null,
            gestureDetected: false,
            isVerticalGesture: false
        };

        bounceElements.set(element, state);

        // 添加事件监听
        element.addEventListener('touchstart', (e) => handleTouchStart(e, element, state), { passive: false });
        element.addEventListener('touchmove', (e) => handleTouchMove(e, element, state), { passive: false });
        element.addEventListener('touchend', (e) => handleTouchEnd(e, element, state), { passive: false });
        element.addEventListener('touchcancel', (e) => handleTouchEnd(e, element, state), { passive: false });
    }

    /**
     * 禁用元素的弹性回弹
     */
    function disableBounce(element: HTMLElement) {
        const state = bounceElements.get(element);
        if (state) {
            if (state.rafId !== null) {
                cancelAnimationFrame(state.rafId);
            }
            bounceElements.delete(element);
        }
    }

    /**
     * 处理触摸开始
     */
    function handleTouchStart(event: TouchEvent, element: HTMLElement, state: BounceState) {
        state.startX = event.touches[0].clientX;
        state.startY = event.touches[0].clientY;
        state.lastY = state.startY;
        state.startScrollTop = element.scrollTop;
        state.isDragging = true;
        state.velocity = 0;
        state.lastTime = Date.now();
        state.gestureDetected = false;
        state.isVerticalGesture = false;

        // 取消正在进行的动画
        if (state.rafId !== null) {
            cancelAnimationFrame(state.rafId);
            state.rafId = null;
        }

        // 移除过渡效果
        element.style.transition = 'none';
    }

    /**
     * 处理触摸移动
     */
    function handleTouchMove(event: TouchEvent, element: HTMLElement, state: BounceState) {
        if (!state.isDragging) return;

        const currentX = event.touches[0].clientX;
        const currentY = event.touches[0].clientY;
        const deltaX = currentX - state.startX;
        const deltaY = currentY - state.startY;
        const currentTime = Date.now();
        const deltaTime = currentTime - state.lastTime;

        // 首次检测手势方向（与 NativeScrollGesture 的逻辑一致）
        if (!state.gestureDetected && (Math.abs(deltaX) > GESTURE_THRESHOLD || Math.abs(deltaY) > GESTURE_THRESHOLD)) {
            state.gestureDetected = true;
            // 垂直手势：垂直移动距离 > 水平移动距离
            state.isVerticalGesture = Math.abs(deltaY) > Math.abs(deltaX);
        }

        // 如果检测到是水平手势，不处理垂直回弹
        if (state.gestureDetected && !state.isVerticalGesture) {
            // 水平手势，不干预，让 NativeScrollGesture 处理
            return;
        }

        // 计算速度
        if (deltaTime > 0) {
            state.velocity = (currentY - state.lastY) / deltaTime;
        }
        state.lastY = currentY;
        state.lastTime = currentTime;

        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;

        // 检查是否在边界
        const isAtTop = scrollTop <= 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight;

        // 只有在确认是垂直手势且在边界时，才应用弹性效果
        if (state.isVerticalGesture && ((isAtTop && deltaY > 0) || (isAtBottom && deltaY < 0))) {
            event.preventDefault();
            event.stopPropagation();

            // 应用阻力，限制最大距离
            const resistance = BOUNCE_RESISTANCE;
            let bounceDistance = deltaY * resistance;

            // 限制最大回弹距离
            bounceDistance = Math.max(-MAX_BOUNCE_DISTANCE, Math.min(MAX_BOUNCE_DISTANCE, bounceDistance));

            // 使用 transform 实现弹性效果
            element.style.transform = `translateY(${bounceDistance}px)`;
        } else {
            // 正常滚动，移除 transform
            element.style.transform = '';
        }
    }

    /**
     * 处理触摸结束
     */
    function handleTouchEnd(_event: TouchEvent, element: HTMLElement, state: BounceState) {
        if (!state.isDragging) return;

        state.isDragging = false;

        // 获取当前的 transform 值
        const transform = element.style.transform;
        const match = transform.match(/translateY\(([^)]+)px\)/);
        const currentOffset = match ? parseFloat(match[1]) : 0;

        // 如果有偏移，执行回弹动画
        if (Math.abs(currentOffset) > 0.1) {
            element.style.transition = `transform ${BOUNCE_BACK_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            element.style.transform = 'translateY(0px)';

            // 动画结束后清理
            setTimeout(() => {
                element.style.transition = '';
                element.style.transform = '';
            }, BOUNCE_BACK_DURATION);
        } else {
            // 没有偏移，直接清理
            element.style.transform = '';
        }
    }

    /**
     * 清理所有弹性效果
     */
    function cleanup() {
        bounceElements.forEach((state, element) => {
            if (state.rafId !== null) {
                cancelAnimationFrame(state.rafId);
            }
            element.style.transition = '';
            element.style.transform = '';
        });
        bounceElements.clear();
    }

    return {
        enableBounce,
        disableBounce,
        cleanup,
        isIOS
    };
}
