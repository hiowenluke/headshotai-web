/**
 * Z-Index 层级管理系统
 * 
 * 设计原则：
 * 1. 简单易懂的层级定义
 * 2. 自动避免层级冲突
 * 3. 易于维护和扩展
 */

// 基础层级定义
export const Z_INDEX_LAYERS = {
  // 基础内容层
  BASE: 1,                    // 主页基础内容
  
  // 模态框层级系统
  MODAL_BASE: 1000,           // 模态框起始层级
  MODAL_STEP: 100,            // 每层模态框的层级递增
  
  // 模态框内部相对层级
  MODAL_BACKDROP: 1,          // 背景遮罩
  MODAL_CONTENT: 10,          // 内容区域
  MODAL_HEADER: 20,           // 顶栏
  
  // 全局覆盖层（始终在最顶层）
  TOAST: 9000,                // 消息提示
  LOADING: 9100,              // 加载提示
  DIALOG: 9200,               // 对话框
  
  // 系统层级
  DEBUG: 9900,                // 调试组件
  SYSTEM: 9999                // 系统级组件
} as const;

/**
 * 模态框层级跟踪
 */
class ModalStackManager {
  private stack: Array<{ id: string; baseZIndex: number }> = [];
  
  /**
   * 打开新模态框，返回其基础 z-index
   */
  pushModal(id: string): number {
    const baseZIndex = Z_INDEX_LAYERS.MODAL_BASE + (this.stack.length * Z_INDEX_LAYERS.MODAL_STEP);
    this.stack.push({ id, baseZIndex });
    

    
    return baseZIndex;
  }
  
  /**
   * 关闭模态框
   */
  popModal(id: string): void {
    const index = this.stack.findIndex(item => item.id === id);
    if (index !== -1) {
      this.stack.splice(index, 1);
      

    }
  }
  
  /**
   * 获取当前模态框的基础 z-index
   */
  getCurrentModalZIndex(id: string): number {
    const item = this.stack.find(item => item.id === id);
    return item ? item.baseZIndex : Z_INDEX_LAYERS.MODAL_BASE;
  }
  
  /**
   * 获取栈顶模态框的 z-index（用于全局组件）
   */
  getTopModalZIndex(): number {
    return this.stack.length > 0 
      ? this.stack[this.stack.length - 1].baseZIndex + Z_INDEX_LAYERS.MODAL_STEP
      : Z_INDEX_LAYERS.MODAL_BASE;
  }
  
  /**
   * 清空栈（应急重置）
   */
  clear(): void {
    this.stack = [];

  }
}

// 全局单例
export const modalStackManager = new ModalStackManager();

/**
 * 工具函数：获取模态框内元素的 z-index
 */
export function getModalElementZIndex(modalId: string, element: keyof typeof Z_INDEX_LAYERS): number {
  const baseZIndex = modalStackManager.getCurrentModalZIndex(modalId);
  
  switch (element) {
    case 'MODAL_BACKDROP':
      return baseZIndex + Z_INDEX_LAYERS.MODAL_BACKDROP;
    case 'MODAL_CONTENT':
      return baseZIndex + Z_INDEX_LAYERS.MODAL_CONTENT;
    case 'MODAL_HEADER':
      return baseZIndex + Z_INDEX_LAYERS.MODAL_HEADER;
    default:
      return baseZIndex + Z_INDEX_LAYERS.MODAL_CONTENT;
  }
}

/**
 * 工具函数：获取全局组件的 z-index
 */
export function getGlobalZIndex(component: 'TOAST' | 'LOADING' | 'DIALOG'): number {
  // 全局组件始终在所有模态框之上
  const topModalZIndex = modalStackManager.getTopModalZIndex();
  const globalBase = Math.max(topModalZIndex + 1000, Z_INDEX_LAYERS[component]);
  

  
  return globalBase;
}

/**
 * CSS 变量设置工具
 */
export function setCSSZIndex(element: HTMLElement, zIndex: number): void {
  element.style.zIndex = zIndex.toString();
}

/**
 * 生成 CSS 变量名
 */
export function generateZIndexVar(prefix: string): string {
  return `--z-${prefix}`;
}
