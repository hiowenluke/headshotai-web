// 认证错误处理组合式函数
// 处理各种认证错误的映射和显示

export function useAuthError() {
  // 错误消息映射
  function mapError(reason?: string): string {
    if (!reason) return 'Login failed. Please retry.';
    
    const errorMap: Record<string, string> = {
      popup_blocked: 'Popup was blocked. Please allow popups and try again.',
      google_auth_not_configured: 'Server not configured for Google Sign-In.',
      missing_code_or_state: 'Response missing code or state. Please retry.',
      invalid_state: 'Session expired. Please sign in again.',
      token_exchange_failed: 'Token exchange failed. Please retry.',
      missing_id_token: 'Missing id_token. Please retry.',
      invalid_id_token: 'Invalid id_token.',
      id_token_verify_failed: 'ID token verification failed. Please try again.',
      missing_sub: 'Missing subject in ID token.',
      forbidden_domain: 'This account domain is not allowed.',
      email_not_allowed: 'Email address not allowed.',
      email_not_verified: 'Email address not verified.'
    };
    
    const key = reason.split(':')[0];
    return errorMap[key] || ('Login failed: ' + key);
  }

  // 常用错误消息
  const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    TIMEOUT: 'Login timed out. Please retry.',
    POPUP_BLOCKED: 'Popup was blocked. Please allow popups and try again.',
    SESSION_REFRESH_FAILED: 'Login successful but session refresh failed. Please try again.',
    MISSING_URL: 'Unable to start Google sign-in: missing URL',
    UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.'
  } as const;

  return {
    mapError,
    ERROR_MESSAGES
  };
}