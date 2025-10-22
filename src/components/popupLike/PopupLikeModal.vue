<template>
    <teleport to="body">
        <transition name="modal" appear>
            <div 
                v-if="open" 
                class="popup-modal-backdrop"
                :class="{ 'backdrop-blur': backdropBlur }"
                :style="{ '--backdrop-opacity': backdropOpacity }"
                @click="onBackdropClick"
            >
                <!-- 移除动画，直接显示在正确位置 -->
                <div 
                    v-if="open"
                    class="popup-modal-container"
                    :style="{ transform: `translateY(${verticalOffset}px)` }"
                    @click.stop
                >
                        <!-- 卡片内容插槽 -->
                        <div class="popup-card" :class="{ 'card-solid': backdropBlur }">
                            <slot></slot>
                        </div>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<script setup lang="ts">
// 弹窗组件属性定义
const props = defineProps<{ 
    open: boolean;                // 是否打开弹窗
    backdropBlur?: boolean;       // 是否使用背景毛玻璃模式
    backdropOpacity?: number;     // 背景遮罩透明度 (0-1)，默认根据模式自动设置
    verticalOffset?: number;      // 垂直居中向下偏移量（px），默认为 0
    backdropDismiss?: boolean;    // 是否允许点击背景关闭，默认为 true
}>();

// 组件事件定义
const emit = defineEmits<{ (e: 'close'): void }>();

// 计算背景透明度，根据模式设置默认值
const backdropOpacity = props.backdropOpacity ?? (props.backdropBlur ? 0.75 : 0.5);

// 计算垂直偏移量，默认为 0
const verticalOffset = props.verticalOffset ?? 0;

// 处理背景点击事件
const onBackdropClick = () => {
    // 只有在允许背景点击关闭时才触发关闭事件
    if (props.backdropDismiss !== false) {
        emit('close');
    }
};
</script>

<style scoped>
/* 背景遮罩样式 - 默认模式 */
.popup-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    /* 使用动态视口高度，更适合移动端 */
    height: 100dvh;
    z-index: 99999;
    /* 使用 CSS 变量设置透明度，默认值为 0.7 */
    background: rgba(0, 0, 0, var(--backdrop-opacity, 0.7));
    display: flex;
    align-items: center;
    justify-content: center;
    /* 添加安全区域内边距 */
    padding: env(safe-area-inset-top, 20px) env(safe-area-inset-right, 20px) env(safe-area-inset-bottom, 20px) env(safe-area-inset-left, 20px);
    box-sizing: border-box;
}

/* 背景遮罩样式 - 毛玻璃模式 */
.popup-modal-backdrop.backdrop-blur {
    /* 毛玻璃模式也使用 CSS 变量设置透明度，默认值为 0.55 */
    background: rgba(0, 0, 0, var(--backdrop-opacity, 0.55));
    backdrop-filter: blur(12px) saturate(120%);
    -ms-backdrop-filter: blur(12px) saturate(120%);
}

.popup-modal-container {
    position: relative;
}

/* Vue transition 动画 */
.modal-enter-active, .modal-leave-active {
    transition: opacity 0.3s ease-out;
}

.modal-enter-from, .modal-leave-to {
    opacity: 0;
}

/* 移除内容动画，直接显示 */

/* 弹窗卡片样式 - 默认模式（毛玻璃卡片） */
.popup-card {
    position: relative;
    width: 95vw;
    max-height: min(86vh, 86dvh);
    background: rgba(68, 70, 79, 0.75);
    backdrop-filter: blur(18px) saturate(140%);
    box-shadow: 
      0 2px 12px -2px rgba(0,0,0,0.55),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    border-radius: 28px;
    padding: 30px 34px;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* 确保在小屏幕上也能正确居中 */
    margin: auto;
}

/* 弹窗卡片样式 - 实心模式（背景毛玻璃时使用） */
.popup-card.card-solid {
    background: rgba(68, 70, 79, 0.75);
    backdrop-filter: none;
    box-shadow: 
      0 2px 12px -2px rgba(0,0,0,0.55),
      0 0 0 1px rgba(255, 255, 255, 0.1);
}

/* 检测 backdrop-filter 支持，如果不支持则使用降级样式 */
@supports not (backdrop-filter: blur(1px)) {
    .popup-modal-backdrop.backdrop-blur {
        /* 降级时增加透明度以补偿缺失的模糊效果 */
        background: rgba(0, 0, 0, min(var(--backdrop-opacity, 0.75) + 0.1, 0.9));
    }
}

/* 移除响应式代码 - 只支持移动端，直接应用移动端样式 */
.popup-modal-backdrop {
    padding: env(safe-area-inset-top, 10px) env(safe-area-inset-right, 10px) env(safe-area-inset-bottom, 10px) env(safe-area-inset-left, 10px);
}

.popup-card {
    width: 95vw;
    padding: 24px 22px;
}
</style>