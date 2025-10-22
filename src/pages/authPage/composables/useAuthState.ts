// 认证状态管理组合式函数
// 管理认证过程中的状态和清理逻辑

import { ref, onBeforeUnmount } from 'vue';

export function useAuthState() {
  // 认证状态
  const isProcessing = ref(false);
  const authError = ref<string | undefined>();

  // 定时器和监听器引用
  let pollTimer: NodeJS.Timeout | null = null;
  let failTimer: NodeJS.Timeout | null = null;
  let messageListener: ((e: MessageEvent) => void) | null = null;

  // 清理认证相关的定时器和监听器
  function cleanupAuth() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    if (failTimer) {
      clearTimeout(failTimer);
      failTimer = null;
    }
    if (messageListener) {
      window.removeEventListener('message', messageListener);
      messageListener = null;
    }
    isProcessing.value = false;
    authError.value = undefined;
  }

  // 清理所有资源
  function cleanupAll() {
    cleanupAuth();
  }

  // 组件卸载时自动清理
  onBeforeUnmount(() => {
    cleanupAll();
  });

  // 设置定时器
  function setPollTimer(callback: () => void, interval: number) {
    pollTimer = setInterval(callback, interval);
    return pollTimer;
  }

  function setFailTimer(callback: () => void, timeout: number) {
    failTimer = setTimeout(callback, timeout);
    return failTimer;
  }

  // 设置消息监听器
  function setMessageListener(callback: (e: MessageEvent) => void) {
    messageListener = callback;
    window.addEventListener('message', messageListener);
  }

  return {
    // 状态
    isProcessing,
    authError,
    
    // 方法
    cleanupAuth,
    cleanupAll,
    setPollTimer,
    setFailTimer,
    setMessageListener
  };
}