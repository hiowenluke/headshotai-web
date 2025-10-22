import { reactive } from 'vue';
import { apiFetch } from '@/utils/api';

export interface AuthUser {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  provider: string;
  is_new_user?: boolean;
  coin_balance?: number;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: AuthUser | null;
  checking: boolean;
  lastError: string | null;
  recentFaces: string[];
}

export const authState = reactive<AuthState>({
  isLoggedIn: false,
  user: null,
  checking: false,
  lastError: null,
  recentFaces: [],
});

export async function refreshSession(): Promise<void> {
  try {
    authState.checking = true;
  const res = await apiFetch('/api/auth/session', { credentials: 'include' });
    if (!res.ok) { 
      authState.isLoggedIn = false; 
      authState.user = null;
      authState.recentFaces = [];
      return; 
    }
    const data = await res.json();
    if (data.authenticated) {
      authState.isLoggedIn = true;
      authState.user = data.user;
      authState.recentFaces = Array.isArray(data.recent_faces) ? data.recent_faces : [];
      // 保存用户信息到 localStorage
      try {
        localStorage.setItem('user_info', JSON.stringify(data.user));
      } catch { /* ignore */ }
      
      // 登录后加载新用户设置
      try {
        const { loadNewUserSettings } = await import('@/state/newUserSettings');
        await loadNewUserSettings();
      } catch (e) {
        console.warn('Failed to load new user settings:', e);
      }
    } else {
      authState.isLoggedIn = false;
      authState.user = null;
      authState.recentFaces = [];
      // 清除 localStorage
      try {
        localStorage.removeItem('user_info');
      } catch { /* ignore */ }
    }
  } catch (e:any) {
    authState.lastError = e?.message || String(e);
  } finally {
    authState.checking = false;
  }
}

export async function logout(): Promise<void> {
  try {
  await apiFetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch {/* ignore */}
  // 清除 localStorage
  try {
    localStorage.removeItem('user_info');
  } catch { /* ignore */ }
  
  // 清理认证相关的 localStorage 项
  try {
    localStorage.removeItem('auth:justLoggedIn');
    localStorage.removeItem('auth:returnPath');
    localStorage.removeItem('auth:isFullPageAuth');
    localStorage.removeItem('auth:safariAuth');
  } catch { /* ignore */ }
  
  await refreshSession();
}
