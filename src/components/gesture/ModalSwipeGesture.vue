<template>
    <div class="modal-swipe-gesture" ref="gestureRef">
        <slot />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Props {
    swipeThresholdRatio?: number; // 滑动退出阈值比例，默认0.25（屏幕宽度的1/4）
    velocityThreshold?: number; // 触发退出的滑动速度阈值（像素/毫秒）
    // 方向化（向后兼容）：'vertical' | 'horizontal' | 'V' | 'H'
    modalStyle?: 'vertical' | 'horizontal' | 'V' | 'H' | 'v' | 'h';
    excludeSelector?: string; // 排除的选择器，点击这些元素不触发手势
}

const props = withDefaults(defineProps<Props>(), {
    swipeThresholdRatio: 0.08, // 大幅降低默认阈值，让模态窗口退出更容易触发
    velocityThreshold: 0.15, // 降低速度阈值，让快速滑动更容易触发关闭
    modalStyle: 'horizontal',
    excludeSelector: ''
});
// 规范化方向：返回 'vertical' 或 'horizontal'
const normalize = (style: string | undefined): 'vertical' | 'horizontal' => {
    const v = (style || '').toLowerCase();
    if (v === 'vertical' || v === 'V' || v === 'v') return 'vertical';
    if (v === 'horizontal' || v === 'H' || v === 'h') return 'horizontal';
    return 'horizontal';
};


const emit = defineEmits<{
    swipeStart: [];
    swipeMove: [progress: number]; // 滑动进度 0-1
    swipeEnd: [];
    swipeCancel: [];
    swipeExit: []; // 触发退出
    gestureDirectionLocked: [direction: 'vertical' | 'horizontal' | null]; // 手势方向锁定
}>();

const gestureRef = ref<HTMLElement | null>(null);

// 手势状态
const isSwipeActive = ref(false);
const swipeStartX = ref(0);
const swipeStartY = ref(0);
const swipeStartTime = ref(0);
const currentSwipeX = ref(0);
const currentSwipeY = ref(0);
const gestureDirectionLocked = ref<'vertical' | 'horizontal' | null>(null);

// 设备信息
const screenWidth = ref(0);
const screenHeight = ref(0);

// 更新屏幕尺寸
const updateScreenSize = () => {
    screenWidth.value = window.innerWidth;
    screenHeight.value = window.innerHeight;
};

// 检查是否应该忽略触摸事件
const shouldIgnoreTouch = (target: EventTarget | null): boolean => {
    if (!target) return false;
    
    const element = target as Element;
    
    // 如果有 excludeSelector，检查是否匹配
    if (props.excludeSelector && element.closest(props.excludeSelector) !== null) {
        return true;
    }
    
    // 额外检查：如果触摸的是按钮或其子元素，也忽略
    // 这可以防止点击按钮时的轻微移动被识别为滑动
    if (element.closest('ion-button, button, .base-modal-button, .return-button, .close-button, .down-button-wrapper')) {
        return true;
    }
    
    return false;
};

// 触摸开始
const handleTouchStart = (event: TouchEvent) => {
    if (shouldIgnoreTouch(event.target)) {
        return;
    }

    const touch = event.touches[0];
    swipeStartX.value = touch.clientX;
    swipeStartY.value = touch.clientY;
    swipeStartTime.value = Date.now();
    currentSwipeX.value = 0;
    currentSwipeY.value = 0;
    isSwipeActive.value = false;
    gestureDirectionLocked.value = null; // 重置方向锁定

    emit('swipeStart');
};

// 触摸移动
const handleTouchMove = (event: TouchEvent) => {
    if (shouldIgnoreTouch(event.target)) {
        return;
    }

    const touch = event.touches[0];
    const deltaX = touch.clientX - swipeStartX.value;
    const deltaY = touch.clientY - swipeStartY.value;

    currentSwipeX.value = deltaX;
    currentSwipeY.value = deltaY;

    // 如果还没有锁定方向，根据移动距离判断手势方向
    // 增加阈值到 20px，避免轻微移动（如点击按钮时的手指抖动）被识别为滑动
    const DIRECTION_LOCK_THRESHOLD = 20;
    if (!gestureDirectionLocked.value && (Math.abs(deltaX) > DIRECTION_LOCK_THRESHOLD || Math.abs(deltaY) > DIRECTION_LOCK_THRESHOLD)) {
        const isVertical = Math.abs(deltaY) > Math.abs(deltaX);
        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
        
    if (isVertical && normalize(props.modalStyle) === 'vertical' && deltaY > 0) {
            // 主模态框垂直向下滑动
            gestureDirectionLocked.value = 'vertical';
            emit('gestureDirectionLocked', 'vertical');
    } else if (isHorizontal && normalize(props.modalStyle) === 'horizontal' && deltaX > 0) {
            // 子模态框水平向右滑动
            gestureDirectionLocked.value = 'horizontal';
            emit('gestureDirectionLocked', 'horizontal');
        }
    }

    // 判断是否为有效的滑动手势
    const isValidSwipe = normalize(props.modalStyle) === 'vertical' 
        ? gestureDirectionLocked.value === 'vertical' && deltaY > 5   // 主模态框：已锁定垂直方向且向下滑动
        : gestureDirectionLocked.value === 'horizontal' && deltaX > 5; // 子模态框：已锁定水平方向且向右滑动

    if (isValidSwipe && !isSwipeActive.value) {
        isSwipeActive.value = true;
        // 阻止默认滚动行为
        event.preventDefault();
    }

    if (isSwipeActive.value) {
        event.preventDefault();
        
        // 计算滑动进度 - 移除上限限制，允许超过阈值继续拖动
    const threshold = normalize(props.modalStyle) === 'vertical' 
            ? screenHeight.value * props.swipeThresholdRatio
            : screenWidth.value * props.swipeThresholdRatio;
        
    const distance = normalize(props.modalStyle) === 'vertical' ? deltaY : deltaX;
        // 只限制下限为0，不限制上限，允许无限向下拖动
        const progress = Math.max(distance / threshold, 0);
        
        emit('swipeMove', progress);
    }
};

// 触摸结束
const handleTouchEnd = (event: TouchEvent) => {
    if (shouldIgnoreTouch(event.target)) {
        // 即使忽略触摸，也要重置方向锁定状态
        resetGestureState();
        return;
    }

    if (!isSwipeActive.value) {
        // 重置方向锁定
        resetGestureState();
        emit('swipeEnd');
        return;
    }

    const deltaTime = Date.now() - swipeStartTime.value;
    const distance = normalize(props.modalStyle) === 'vertical' ? currentSwipeY.value : currentSwipeX.value;
    const velocity = Math.abs(distance) / deltaTime;

    // 计算是否应该触发退出
    const threshold = normalize(props.modalStyle) === 'vertical' 
        ? screenHeight.value * props.swipeThresholdRatio
        : screenWidth.value * props.swipeThresholdRatio;

    const shouldExit = Math.abs(distance) >= threshold || velocity >= props.velocityThreshold;

    if (shouldExit) {
        emit('swipeExit');
    } else {
        emit('swipeCancel');
    }

    // 重置状态
    resetGestureState();
    emit('swipeEnd');
};

// 重置手势状态的辅助函数
const resetGestureState = () => {
    isSwipeActive.value = false;
    gestureDirectionLocked.value = null;
    emit('gestureDirectionLocked', null);
};

// 触摸取消
const handleTouchCancel = () => {
    if (isSwipeActive.value) {
        emit('swipeCancel');
    }
    
    resetGestureState();
    emit('swipeEnd');
};

onMounted(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    window.addEventListener('orientationchange', updateScreenSize);

    const element = gestureRef.value;
    if (element) {
        element.addEventListener('touchstart', handleTouchStart, { passive: false });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd, { passive: false });
        element.addEventListener('touchcancel', handleTouchCancel, { passive: false });
    }
});

onUnmounted(() => {
    window.removeEventListener('resize', updateScreenSize);
    window.removeEventListener('orientationchange', updateScreenSize);

    const element = gestureRef.value;
    if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
        element.removeEventListener('touchcancel', handleTouchCancel);
    }
});
</script>

<style scoped>
.modal-swipe-gesture {
    width: 100%;
    height: 100%;
    /* 允许触摸事件 */
    touch-action: none;
    user-select: none;
}
</style>
