import { reactive, watch } from 'vue';

export interface UIState {
  route: string;
  showGenerator: boolean;
  previewImage: string | null;
  showSideMenu: boolean; // 侧边菜单是否打开
  // 其余弹窗持久化
  showDebug?: boolean;
  showMenuPage?: boolean;
  menuPageKey?: string;
  menuPageTitle?: string;
  // 上传照片页面
  showFaceUploaded?: boolean;
  // 背景选择页面
  showBackdropsPage?: boolean;
  // 注意：showAuth 不再持久化，登录页应该是临时状态
}

const DEFAULT_STATE: UIState = {
  route: '/home',
  showGenerator: false,
  previewImage: null,
  showSideMenu: false,
  showDebug: false,
  showMenuPage: false,
  menuPageKey: '',
  menuPageTitle: '',
  showFaceUploaded: false,
  showBackdropsPage: false,
};

export const uiState = reactive<UIState>({ ...DEFAULT_STATE });

const KEY = 'ui_state_v1';

export function loadUIState() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.assign(uiState, parsed);
    }
  } catch { /* ignore */ }
}

export function persistUIState() {
  try {
    const toSave: UIState = { ...uiState, route: window.location.pathname + window.location.search };
    sessionStorage.setItem(KEY, JSON.stringify(toSave));
  } catch { /* ignore */ }
}

let initialized = false;
export function initUIStatePersistence() {
  if (initialized) return;
  initialized = true;
  // Deep watch with micro-task batching
  watch(uiState, () => { persistUIState(); }, { deep: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') persistUIState();
  });
  window.addEventListener('pagehide', persistUIState as any);
  window.addEventListener('beforeunload', persistUIState);
}
