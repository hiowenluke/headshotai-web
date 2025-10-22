import { ref, watch, Ref } from 'vue';
import { uiState } from '@/state/uiState';

export interface UsePersistentModalOptions {
  /** 附带需要一起持久化的字段 (字段名需已存在于 uiState 或可被动态添加) */
  data?: Record<string, Ref<any>>;
  /** 当弹窗关闭时是否仍然持久化 data 字段。默认 true。 */
  persistDataWhenClosed?: boolean;
  /** 自定义 open 字段名 (默认 show + PascalCase(key)) */
  openFieldName?: string;
}

function pascalCase(s: string) {
  return s.replace(/(^.|[-_].)/g, m => m.replace(/[-_]/, '').toUpperCase());
}

/**
 * 为一个弹窗（或全屏菜单）提供持久化 open 状态与附属数据的通用逻辑。
 * - 自动从 uiState 读取初始值
 * - 变更时写回 uiState (已由全局 deep watch => sessionStorage 持久化)
 * - 可附带多个数据 ref，同步到 uiState 对应字段
 */
export function usePersistentModal(key: string, opts: UsePersistentModalOptions = {}) {
  const field = opts.openFieldName || ('show' + pascalCase(key));
  const open = ref<boolean>((uiState as any)[field] ?? false);

  // 恢复附加数据初始值
  if (opts.data) {
    for (const [k, r] of Object.entries(opts.data)) {
      if (k in uiState && (uiState as any)[k] != null) {
        try { (r as any).value = (uiState as any)[k]; } catch { /* ignore */ }
      }
    }
  }

  // open 状态同步
  watch(open, v => { (uiState as any)[field] = v; });

  // 附带数据同步
  if (opts.data) {
    const persistWhenClosed = opts.persistDataWhenClosed !== false; // default true
    for (const [k, r] of Object.entries(opts.data)) {
      watch(r, v => {
        if (persistWhenClosed || open.value) {
          (uiState as any)[k] = v;
        }
      });
    }
  }

  return open;
}
