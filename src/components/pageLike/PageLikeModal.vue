<template>
    <ion-modal :is-open="isOpen" :class="['page-like-modal', modalClass]" :style="{
        '--modal-z-index': modalZIndex,
        '--modal-content-z-index': modalContentZIndex,
        '--modal-backdrop-z-index': modalBackdropZIndex,
        '--header-z-index': headerZIndex,
        '--toolbar-z-index': toolbarZIndex,
        '--button-z-index': buttonZIndex,
        '--swipe-progress': swipeProgress
    }" @didDismiss="emitClose" @didPresent="handleDidPresent" :backdrop-dismiss="false" :enter-animation="enterAnimation"
        :leave-animation="leaveAnimation">
        <div class="modal-touch-wrapper" :style="{
            transform: isSwipeInProgress ? (isVerticalMode ? `translateY(${Math.min(swipeProgress * 15, 100)}%)` : `translateX(${Math.min(swipeProgress * 15, 100)}%)`) : ''
        }">
            <!-- 垂直模式和 X 模式 -->
            <ModalSwipeGesture 
                v-if="isVerticalMode || isXMode"
                :swipe-threshold-ratio="isXMode ? 999 : swipeThresholdRatio"
                :velocity-threshold="isXMode ? 999999 : VELOCITY_THRESHOLD"
                :modal-style="(isVerticalMode || isXMode) ? 'vertical' : 'horizontal'"
                :exclude-selector="vModeExcludeSelector"
                @swipe-start="handleSwipeStartWrapper"
                @swipe-move="handleSwipeMoveWrapper"
                @swipe-end="handleSwipeEndWrapper"
                @swipe-cancel="handleSwipeCancelWrapper"
                @swipe-exit="handleSwipeExitWrapper"
                @gesture-direction-locked="handleGestureDirectionLockedWrapper">
                <ion-page class="v-mode-page">
                    <ModalHeader 
                        ref="modalHeaderRef"
                        :show-main-menu="showMainMenu"
                        :show-sub-menu="showSubMenu"
                        :menus="menus"
                        :active-index="activeIndex"
                        :has-sub-menus="hasSubMenus"
                        :current-sub-menus="currentSubMenus"
                        :active-sub-index="activeSubIndex"
                        :transparent-blur="props.transparentBlurHeader"
                        @select="(i) => $emit('select', i)"
                        @select-sub="(i) => $emit('select-sub', i)"
                        @scroll-to-top="() => $emit('scroll-to-top')">
                        <template #back-button>
                            <DownButton v-if="!isXMode" @click="emitClose" />
                            <CloseButton v-else @click="emitClose" />
                        </template>
                        <template #title>
                            <IconTabsTitle v-if="computedTitleType === 'icon-tabs'"
                                                :title="finalTitle"
                                                :tabs="managedTabs || []"
                                :currentTab="currentTab"
                                @tabChange="switchTab" />
                            
                            <TextTabsTitle v-else-if="computedTitleType === 'text-tabs'"
                                v-model="TextTabsTitleValue"
                                :tabs="managedTabs"
                                :hotDismissed="hotDismissed"
                                @hot-clicked="$emit('hot-clicked')" />
                            
                            <SimpleTitle v-else-if="computedTitleType === 'simple'"
                                :title="finalTitle" />
                        </template>
                        <template #toolbar-end>
                            <slot name="toolbar-end" />
                        </template>
                    </ModalHeader>
                    <ion-content class="plm-content v-mode-content" :scroll-y="!props.disableContentScroll" fullscreen>
                        <TabSwipeGesture 
                            v-if="managedTabs && managedTabs.length"
                            :tabs="managedTabs"
                            :current-tab="currentTab"
                            :enable-swipe="enableTabSwipe"
                            :swipe-threshold="TAB_SWIPE_THRESHOLD"
                            :swipe-max-time="TAB_SWIPE_MAX_TIME"
                            :gesture-disabled="isGestureDisabled"
                            @tab-change="switchTab"
                            @swipe-start="handleTabSwipeStart"
                            @swipe-move="handleTabSwipeMove"
                            @swipe-end="handleTabSwipeEnd">
                            <template v-for="t in managedTabs" :key="t.key" #[t.key]>
                                <div class="plm-tab-panel v-mode-tab-panel tab-slide-panel">
                                    <slot :name="t.key" />
                                </div>
                            </template>
                        </TabSwipeGesture>
                        <div v-else class="plm-single v-mode-single">
                            <slot />
                        </div>
                    </ion-content>
                    
                    <div v-if="$slots['bottom-area']"
                         class="plm-bottom-area"
                         ref="bottomAreaRef">
                        <slot name="bottom-area" />
                    </div>
                </ion-page>
            </ModalSwipeGesture>

            <!-- 水平模式 -->
            <ModalSwipeGesture 
                v-else
                :swipe-threshold-ratio="swipeThresholdRatio"
                :velocity-threshold="VELOCITY_THRESHOLD"
                :modal-style="isVerticalMode ? 'v' : 'h'"
                :exclude-selector="hModeExcludeSelector"
                @swipe-start="handleSwipeStart"
                @swipe-move="handleSwipeMove"
                @swipe-end="handleSwipeEnd"
                @swipe-cancel="handleSwipeCancel"
                @swipe-exit="performSwipeExit">
                <ion-page>
                    <ModalHeader 
                        ref="modalHeaderRef"
                        :transparent-blur="props.transparentBlurHeader">
                        <template #back-button>
                            <ReturnButton @click="emitClose" />
                        </template>
                        <template #title>
                            <IconTabsTitle v-if="computedTitleType === 'icon-tabs'"
                                :title="finalTitle"
                                :tabs="managedTabs || []"
                                :currentTab="currentTab"
                                @tabChange="switchTab" />
                            
                            <TextTabsTitle v-else-if="computedTitleType === 'text-tabs'"
                                v-model="TextTabsTitleValue"
                                :tabs="managedTabs"
                                :hotDismissed="hotDismissed"
                                @hot-clicked="$emit('hot-clicked')" />
                            
                            <SimpleTitle v-else-if="computedTitleType === 'simple'"
                                :title="finalTitle" />
                        </template>
                        <template #toolbar-end>
                            <slot name="toolbar-end" />
                        </template>
                    </ModalHeader>
                    <ion-content class="plm-content" :scroll-y="!props.disableContentScroll">
                        <div class="plm-tab-wrapper" v-if="managedTabs && managedTabs.length">
                            <div v-for="t in managedTabs" :key="t.key" v-show="currentTab === t.key" class="plm-tab-panel">
                                <slot :name="t.key" />
                            </div>
                        </div>
                        <div v-else class="plm-single">
                            <slot />
                        </div>
                    </ion-content>
                </ion-page>
            </ModalSwipeGesture>
        </div>
    </ion-modal>
</template>

<script setup lang="ts">
import './css/PageLikeModal.css'

import { IonModal, IonPage, IonContent } from '@ionic/vue';
import { ref } from 'vue';
import IconTabsTitle from '@/components/modalTitle/IconTabsTitle.vue';
import TextTabsTitle from '@/components/modalTitle/TextTabsTitle.vue';
import SimpleTitle from '@/components/modalTitle/SimpleTitle.vue';
import ModalHeader from '@/components/header/ModalHeader.vue';
import ReturnButton from '@/components/backButton/ReturnButton.vue';
import DownButton from '@/components/backButton/DownButton.vue';
import CloseButton from '@/components/backButton/CloseButton.vue';
import ModalSwipeGesture from '@/components/gesture/ModalSwipeGesture.vue';
import TabSwipeGesture from '@/components/gesture/TabSwipeGesture.vue';
import { useViewportHeight } from '@/composables/useViewportHeight';

// 导入组合式函数
import { useModalState } from './composables/useModalState';
import { useModalMode } from './composables/useModalMode';
import { useTabManagement } from './composables/useTabManagement';
import { useModalGestures } from './composables/useModalGestures';
import { useModalAnimation } from './composables/useModalAnimation';

import type { TabItem } from '@/types/generator';

const props = withDefaults(defineProps<{
    isOpen: boolean;
    modalTitle?: string;
    pageTitle?: string;
    tabs?: TabItem[];
    modelValue?: string;
    swipeThresholdRatio?: number;
    modalStyle?: 'vertical' | 'horizontal' | 'V' | 'H' | 'v' | 'h' | 'x';
    titleType?: 'icon-tabs' | 'text-tabs' | 'simple' | 'auto';
    hotDismissed?: boolean;
    enableTabSwipe?: boolean;
    disableContentScroll?: boolean; // 禁用内容滚动和弹性动画，适用于固定布局的页面
    modalType?: string;
    enableTabPersistence?: boolean;
    // 菜单相关 props
    showMainMenu?: boolean;
    showSubMenu?: boolean;
    menus?: string[];
    activeIndex?: number;
    hasSubMenus?: boolean[];
    currentSubMenus?: any[];
    activeSubIndex?: number;
    transparentBlurHeader?: boolean; // Header 是否使用半透明毛玻璃效果
}>(), {
    swipeThresholdRatio: 0.08,
    enableTabPersistence: true,
    showMainMenu: false,
    showSubMenu: false,
    activeIndex: 0,
    activeSubIndex: 0,
    transparentBlurHeader: false
});

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'update:modelValue', v: string): void;
    (e: 'right'): void;
    (e: 'hot-clicked'): void;
    (e: 'select', index: number): void;
    (e: 'select-sub', index: number): void;
    (e: 'scroll-to-top'): void;
}>();

// 模板引用
const modalHeaderRef = ref<InstanceType<typeof ModalHeader> | null>(null);

// 使用组合式函数
const modalState = useModalState(props, emit);
const modalMode = useModalMode(props);
const tabManagement = useTabManagement(props, emit);
const modalGestures = useModalGestures(props, modalState, tabManagement);
const modalAnimation = useModalAnimation(modalMode, modalState);

// 初始化视口高度
useViewportHeight();

// 解构需要的状态和方法
const {
    swipeProgress,
    isSwipeInProgress,
    isGestureDisabled,
    modalZIndex,
    modalContentZIndex,
    modalBackdropZIndex,
    headerZIndex,
    toolbarZIndex,
    buttonZIndex,
    modalClass,
    emitClose
} = modalState;

const {
    isVerticalMode,
    isXMode,
    vModeExcludeSelector,
    hModeExcludeSelector
} = modalMode;

// 手势事件包装器（X 模式下禁用）
const handleSwipeStartWrapper = () => {
    if (!isXMode.value) handleSwipeStart();
};

const handleSwipeMoveWrapper = (progress: number) => {
    if (!isXMode.value) handleSwipeMove(progress);
};

const handleSwipeEndWrapper = () => {
    if (!isXMode.value) handleSwipeEnd();
};

const handleSwipeCancelWrapper = () => {
    if (!isXMode.value) handleSwipeCancel();
};

const handleSwipeExitWrapper = () => {
    if (!isXMode.value) performSwipeExit();
};

const handleGestureDirectionLockedWrapper = (direction: 'vertical' | 'horizontal' | null) => {
    if (!isXMode.value) handleGestureDirectionLocked(direction);
};

const {
    tabs: managedTabs,
    currentTab,
    finalTitle,
    computedTitleType,
    TextTabsTitleValue,
    switchTab,
    initFirstTab
} = tabManagement;

const {
    VELOCITY_THRESHOLD,
    TAB_SWIPE_THRESHOLD,
    TAB_SWIPE_MAX_TIME,
    bottomAreaRef,
    handleSwipeStart,
    handleSwipeMove,
    handleSwipeEnd,
    handleSwipeCancel,
    handleGestureDirectionLocked,
    handleTabSwipeStart,
    handleTabSwipeMove,
    handleTabSwipeEnd,
    performSwipeExit
} = modalGestures;

const {
    handleDidPresent,
    enterAnimation,
    leaveAnimation
} = modalAnimation;

// 监听 isOpen 变化来初始化 Tab
import { watch, onMounted } from 'vue';

watch(() => props.isOpen, (v) => {
    if (v) {
        initFirstTab();
    }
});

onMounted(() => {
    if (props.isOpen) {
        initFirstTab();
    }
});
</script>

<style>
/* 
 * 全局样式：为所有使用 PageLikeModal 的页面提供默认样式
 * 使用高特异性选择器确保样式生效，但允许组件内的 scoped 样式覆盖
 */

/* modal-page 默认样式 */
.page-like-modal ion-content .modal-page,
.page-like-modal .plm-single .modal-page,
.page-like-modal .plm-tab-panel .modal-page {
    color: #fff;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
    padding: 0 20px;
}
</style>
