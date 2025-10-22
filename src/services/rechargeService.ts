import axios from 'axios';
import { resolveApiUrl } from '@/utils/api';

export interface RechargeRule { usd: number; coins: number; bonus: number }
export interface RechargeResponse { rules: RechargeRule[]; currency: string; coin_symbol: string; version: number }

let pending: Promise<RechargeResponse> | null = null;

export function fetchRechargeRules(force = false): Promise<RechargeResponse> {
  if (!force && pending) return pending;
  pending = axios.get<RechargeResponse>(resolveApiUrl('/api/recharge_rules')).then(r => r.data).finally(() => { pending = null; });
  return pending;
}
