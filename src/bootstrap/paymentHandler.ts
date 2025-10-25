
import { forceRemoveSkeleton } from '@/utils/skeletonControl';

// 处理支付回调（Stripe 重定向回来的情况）
export function handlePaymentCallback() {
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  
  // 检查是否是支付成功回调
  if (path === '/payment/success') {
    console.log('[PaymentHandler] Detected payment success callback');
    
    // 确保骨架屏被移除
    forceRemoveSkeleton();
    /*
      如果将来添加了其他外部服务的回调（类似 Stripe），比如：
        · 第三方支付回调（PayPal、Apple Pay 等）
        · 社交分享回调
        · 深度链接（Deep Link）处理
      那时可以参考 paymentHandler.ts 的模式，创建类似的处理模块。
    */
    
    // 打开支付成功弹窗
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-payment-success', {
        detail: {
          sessionId: searchParams.get('session_id')
        }
      }));
    }, 100);
    
    // 重定向到主页，但保留查询参数
    window.history.replaceState({}, '', `/home${window.location.search}`);
    return true;
  }
  
  // 检查是否是支付取消回调
  if (path === '/payment/cancel') {
    console.log('[PaymentHandler] Detected payment cancel callback');
    
    // 确保骨架屏被移除
    forceRemoveSkeleton();
    
    // 打开支付取消弹窗
    setTimeout(() => {
      window.dispatchEvent(new Event('open-payment-cancel'));
    }, 100);
    
    // 重定向到主页
    window.history.replaceState({}, '', '/home');
    return true;
  }
  
  return false;
}
