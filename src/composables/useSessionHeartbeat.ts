/**
 * useSessionHeartbeat
 * 定期调用 /api/auth/session 以触发服务器端滑动续期，保持长会话。
 * 方案 A: 仅前端心跳 + 后端配置长 SESSION_MIN_SECONDS / SLIDING。
 *
 * 特性:
 * 1. 仅在页面可见 (document.visibilityState === 'visible') 时运行，后台不打扰。
 * 2. 首次调用立即触发一次检查 + 续期。
 * 3. 通过 window 触发事件：
 *    - auth:heartbeat(detail = 响应 JSON)
 *    - auth:expired (检测到已失效，仅首次触发)
 *    - auth:reauth-start (预留，当前未使用)
 * 4. 防止重复安装 (HMR 或多次 import) — 使用 window.__SESSION_HEARTBEAT_INSTALLED 标记。
 */
import { resolveApiUrl } from '@/utils/api';

export interface SessionHeartbeatOptions {
  /** 心跳间隔 (毫秒) - 默认 10 分钟 */
  intervalMs?: number;
  /** 请求超时 (毫秒) - 默认 10s */
  timeoutMs?: number;
  /** 是否在失效时自动派发 open-auth 事件提示登录 (默认 true) */
  autoOpenAuth?: boolean;
}

interface WindowWithFlag extends Window {
  __SESSION_HEARTBEAT_INSTALLED?: boolean;
  __SESSION_HEARTBEAT_LAST_EXPIRED_EMIT?: number;
}

function fetchWithTimeout(url: string, opts: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(resolveApiUrl(url), { ...opts, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

export function useSessionHeartbeat(options: SessionHeartbeatOptions = {}) {
  const {
    intervalMs = 10 * 60 * 1000, // 10 分钟
    timeoutMs = 10 * 1000,
    autoOpenAuth = true
  } = options;

  const w = window as WindowWithFlag;
  if (w.__SESSION_HEARTBEAT_INSTALLED) {
    // 已安装，直接返回一个手动触发函数 (幂等)
    return () => {
      window.dispatchEvent(new CustomEvent('__sessionHeartbeatForce')); // 触发已有监听器
    };
  }
  w.__SESSION_HEARTBEAT_INSTALLED = true;

  let timer: number | null = null;
  let lastRun = 0;
  let expiredEmitted = false;

  async function runHeartbeat(force = false) {
    const now = Date.now();
    if (!force && now - lastRun < 2000) return; // 最小 2 秒间隔防抖
    lastRun = now;
    try {
      const res = await fetchWithTimeout('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      }, timeoutMs);
      let json: any = null;
      try {
        json = await res.json();
      } catch (e) {
        // ignore JSON parse errors
      }
      window.dispatchEvent(new CustomEvent('auth:heartbeat', { detail: json }));
      if (!json || json.authenticated === false) {
        if (!expiredEmitted) {
          expiredEmitted = true;
          window.dispatchEvent(new Event('auth:expired'));
          if (autoOpenAuth) {
            // 延迟 300ms 等待可能的 UI 响应
            setTimeout(() => window.dispatchEvent(new Event('open-auth')), 300);
          }
        }
      } else {
        // 只要一次成功就重置过期标志
        expiredEmitted = false;
      }
    } catch (e) {
      // 网络失败：不立即判定过期，仅派发心跳事件 (detail=null) 供上层统计
      window.dispatchEvent(new CustomEvent('auth:heartbeat', { detail: null }));
    }
  }

  function clearTimer() {
    if (timer != null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function startInterval() {
    clearTimer();
    runHeartbeat(true); // 可见后立即执行
    timer = window.setInterval(() => runHeartbeat(), intervalMs);
  }

  function handleVisibility() {
    if (document.visibilityState === 'visible') {
      startInterval();
    } else {
      clearTimer();
    }
  }

  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('__sessionHeartbeatForce', () => runHeartbeat(true));

  // 初始挂载
  if (document.visibilityState === 'visible') {
    startInterval();
  }

  // 返回一个手动刷新函数
  return () => runHeartbeat(true);
}

export default useSessionHeartbeat;
