/**
 * 骨架屏控制工具
 * 提供统一的骨架屏移除功能
 */

/**
 * 强制移除骨架屏
 * 用于确保骨架屏在应用启动或特殊场景下被正确移除
 */
export function forceRemoveSkeleton(): void {
  try {
    // 标记应用已挂载，阻止骨架屏显示
    (window as any).__appMounted = true;
    
    // 调用骨架屏的隐藏函数
    (window as any).__hideAppShell?.();
    
    // 强制移除骨架屏 DOM 元素
    const shell = document.getElementById('app-shell');
    if (shell && shell.parentElement) {
      console.log('[SkeletonControl] Removing skeleton screen');
      shell.parentElement.removeChild(shell);
    }
    
    // 清理 dynamic-content 容器（可能包含骨架屏或 PreferencesPopup）
    const dynamicContent = document.getElementById('dynamic-content');
    if (dynamicContent && dynamicContent.innerHTML.trim()) {
      // 只清理包含 app-shell 的内容
      const hasShell = dynamicContent.querySelector('#app-shell');
      if (hasShell) {
        console.log('[SkeletonControl] Cleaning dynamic-content');
        dynamicContent.innerHTML = '';
      }
    }
  } catch (error) {
    console.warn('[SkeletonControl] Failed to remove skeleton:', error);
  }
}

/**
 * 确保骨架屏被移除（安全版本）
 * 不会抛出异常，适合在各种场景下调用
 */
export function ensureSkeletonRemoved(): void {
  try {
    forceRemoveSkeleton();
  } catch {
    // 静默失败
  }
}
