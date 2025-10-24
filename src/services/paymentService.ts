import axios from 'axios';
import { resolveApiUrl } from '@/utils/api';

// 创建 Stripe Checkout Session 的请求参数
export interface CreateCheckoutSessionRequest {
  price_usd: number;
  coins: number;
  bonus: number;
  success_url?: string;
  cancel_url?: string;
}

// 创建 Stripe Checkout Session 的响应
export interface CreateCheckoutSessionResponse {
  session_id: string;
  checkout_url: string;
}

// 支付状态查询响应
export interface PaymentStatusResponse {
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  session_id: string;
  coins_added?: number;
  new_balance?: number;
}

/**
 * 创建 Stripe Checkout Session
 * @param request 包含价格、金币数量等信息
 * @returns Checkout Session 信息，包含跳转 URL
 */
export async function createCheckoutSession(
  request: CreateCheckoutSessionRequest
): Promise<CreateCheckoutSessionResponse> {
  try {
    console.log('[PaymentService] Creating checkout session:', request);
    
    const response = await axios.post<CreateCheckoutSessionResponse>(
      resolveApiUrl('/api/payment/create-checkout-session'),
      {
        price_usd: request.price_usd,
        coins: request.coins,
        bonus: request.bonus,
        success_url: request.success_url || `${window.location.origin}/payment/success`,
        cancel_url: request.cancel_url || `${window.location.origin}/payment/cancel`
      },
      {
        withCredentials: true // 发送认证 cookie
      }
    );
    
    console.log('[PaymentService] Checkout session created:', response.data);
    return response.data;
  } catch (error) {
    console.error('[PaymentService] Failed to create checkout session:', error);
    throw error;
  }
}

/**
 * 查询支付状态
 * @param sessionId Stripe Session ID
 * @returns 支付状态信息
 */
export async function getPaymentStatus(
  sessionId: string
): Promise<PaymentStatusResponse> {
  try {
    console.log('[PaymentService] Checking payment status for session:', sessionId);
    
    const response = await axios.get<PaymentStatusResponse>(
      resolveApiUrl(`/api/payment/status/${sessionId}`),
      {
        withCredentials: true
      }
    );
    
    console.log('[PaymentService] Payment status:', response.data);
    return response.data;
  } catch (error) {
    console.error('[PaymentService] Failed to get payment status:', error);
    throw error;
  }
}

/**
 * 重定向到 Stripe Checkout 页面
 * @param checkoutUrl Stripe Checkout URL
 */
export function redirectToCheckout(checkoutUrl: string): void {
  console.log('[PaymentService] Redirecting to Stripe Checkout:', checkoutUrl);
  window.location.href = checkoutUrl;
}
