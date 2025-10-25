// 模态框状态管理组合式函数
// 处理模态框的基础状态、层级管理和生命周期

import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { modalStackManager, getModalElementZIndex } from '@/utils/zIndexManager';
import { ensureSkeletonRemoved } from '@/utils/skeletonControl';

export function useModalState(props: any, emit: any) {
  // 生成唯一的模态框ID
  const modalId = ref(`modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  // 防止重复关闭
  const isClosing = ref(false);
  
  // 模态框滑动状态
  const swipeProgress = ref(0);
  const isSwipeInProgress = ref(false);
  const isGestureDisabled = ref(false);
  const isExiting = ref(false);

  // 模态框层级计算
  const modalZIndex = computed(() => getModalElementZIndex(modalId.value, 'MODAL_BASE'));
  const modalContentZIndex = computed(() => modalZIndex.value + 1);
  const modalBackdropZIndex = computed(() => modalZIndex.value - 1);
  const headerZIndex = computed(() => modalZIndex.value + 10);
  const toolbarZIndex = computed(() => modalZIndex.value + 11);
  const buttonZIndex = computed(() => modalZIndex.value + 12);

  // 模态框 CSS 类
  const modalClass = computed(() => {
    const classes = [];
    if (props.isOpen) classes.push('modal-active');
    if (props.disableContentScroll) classes.push('disable-content-scroll');
    if (isSwipeInProgress.value) classes.push('swiping');
    if (isExiting.value) classes.push('exiting');
    return classes.join(' ');
  });

  // 关闭模态框
  function emitClose() {
    if (isClosing.value) return;
    
    isClosing.value = true;
    
    try {
      emit('close');
    } catch (error) {
      console.error('[PageLikeModal] Error emitting close:', error);
    }
    
    // 缩短重置时间到 300ms，避免需要多次点击
    setTimeout(() => {
      isClosing.value = false;
    }, 300);
  }

  // 监听 isOpen 状态变化
  watch(() => props.isOpen, (v) => {
    if (v) {
      modalStackManager.pushModal(modalId.value);
      isClosing.value = false;
      
      // 确保骨架屏被移除（当任何弹窗打开时）
      ensureSkeletonRemoved();
    } else {
      modalStackManager.popModal(modalId.value);
      isClosing.value = false;
    }
  });

  onMounted(() => {
    if (props.isOpen) {
      modalStackManager.pushModal(modalId.value);
    }
  });

  onUnmounted(() => {
    modalStackManager.popModal(modalId.value);
  });

  return {
    // 状态
    modalId,
    isClosing,
    swipeProgress,
    isSwipeInProgress,
    isGestureDisabled,
    isExiting,
    
    // 计算属性
    modalZIndex,
    modalContentZIndex,
    modalBackdropZIndex,
    headerZIndex,
    toolbarZIndex,
    buttonZIndex,
    modalClass,
    
    // 方法
    emitClose,
    
    // 状态设置方法
    setSwipeProgress: (progress: number) => { swipeProgress.value = progress; },
    setSwipeInProgress: (inProgress: boolean) => { isSwipeInProgress.value = inProgress; },
    setGestureDisabled: (disabled: boolean) => { isGestureDisabled.value = disabled; },
    setExiting: (exiting: boolean) => { isExiting.value = exiting; }
  };
}