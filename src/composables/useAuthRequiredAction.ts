import { authState } from '@/state/authState';
import router from '@/router';
import { onBeforeUnmount, onMounted, watch, nextTick } from 'vue';

interface PendingActionPayload {
  id: string;
  ts: number;
  message?: string;
}

const STORAGE_KEY = 'auth:pendingAction:data';

function readPending(): PendingActionPayload | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.id === 'string') {
      return {
        id: parsed.id,
        ts: Number(parsed.ts) || Date.now(),
        message: typeof parsed.message === 'string' ? parsed.message : undefined
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writePending(id: string, message?: string) {
  try {
    const payload: PendingActionPayload = {
      id,
      ts: Date.now(),
      ...(message ? { message } : {})
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

function clearPending() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function storeReturnPath() {
  try {
    const currentRoute = router.currentRoute?.value;
    const path = currentRoute?.fullPath || window.location.pathname || '/home';
    localStorage.setItem('auth:returnPath', path);
  } catch {
    /* ignore */
  }
}

export function useAuthRequiredAction(actionId: string, perform: () => void, options?: { message?: string }) {
  let disposed = false;
  const message = options?.message;

  const runAction = () => {
    if (disposed) return;
    clearPending();
    nextTick(() => {
      if (!disposed) {
        try {
          perform();
        } catch (err) {
          console.error('[AuthRequiredAction] perform action failed', err);
        }
      }
    });
  };

  const attemptResume = () => {
    if (disposed || !authState.isLoggedIn) return;
    const pending = readPending();
    if (!pending || pending.id !== actionId) return;
    setTimeout(runAction, 60);
  };

  const ensureAuth = () => {
    if (authState.isLoggedIn) {
      clearPending();
      perform();
      return;
    }
    writePending(actionId, message);
    storeReturnPath();
    try {
      window.dispatchEvent(new CustomEvent('open-auth', { detail: { from: actionId, message } }));
    } catch {
      window.dispatchEvent(new Event('open-auth'));
    }
  };

  watch(
    () => authState.isLoggedIn,
    (loggedIn) => {
      if (loggedIn) {
        attemptResume();
      }
    }
  );

  onMounted(() => {
    attemptResume();
  });

  onBeforeUnmount(() => {
    disposed = true;
  });

  return { ensureAuth };
}
