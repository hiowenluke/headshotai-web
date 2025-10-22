import axios from 'axios';
import { resolveApiUrl } from '@/utils/api';

export interface PriceResponse {
  prices: Record<string, number>;
  eta_seconds: Record<string, number | null>;
  version: number;
}

let pending: Promise<PriceResponse> | null = null;

export function fetchPrices(force = false): Promise<PriceResponse> {
  if (!force && pending) return pending;
  pending = axios.get<PriceResponse>(resolveApiUrl('/api/prices')).then(r => r.data).finally(() => {
    // 允许下次导航时重新获取（按需求不做长期缓存）
    pending = null;
  });
  return pending;
}
