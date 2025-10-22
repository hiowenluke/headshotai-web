/**
 * 用户设置服务
 * 处理用户相关的设置和配置
 */

import type { NewUserSettings } from '@/types/userSettings';
import { apiFetch } from '@/utils/api';

/**
 * 获取新用户初始设置
 * 
 * @throws 如果 API 调用失败，会抛出错误
 * @returns Promise<NewUserSettings>
 */
export async function fetchNewUserSettings(): Promise<NewUserSettings> {
  const res = await apiFetch('/api/new_user');
  if (!res.ok) {
    throw new Error(`Failed to fetch new user settings: ${res.status}`);
  }
  const data = await res.json();
  return data;
}
