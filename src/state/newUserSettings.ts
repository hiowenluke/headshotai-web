/**
 * 新用户设置状态管理
 * 用于存储从服务器获取的新用户初始设置
 */

import { reactive, readonly } from 'vue';
import { fetchNewUserSettings } from '@/services/userSettingsService';
import type { NewUserSettings, PlanType } from '@/types/userSettings';

interface NewUserSettingsState {
  settings: NewUserSettings | null;
  isLoaded: boolean;
  isLoading: boolean;
}

const state = reactive<NewUserSettingsState>({
  settings: null,
  isLoaded: false,
  isLoading: false
});

/**
 * 加载新用户设置
 * 从服务端获取配置
 */
export async function loadNewUserSettings(): Promise<void> {
  if (state.isLoaded || state.isLoading) {
    return;
  }

  state.isLoading = true;

  try {
    const settings = await fetchNewUserSettings();
    state.settings = settings;
    state.isLoaded = true;
  } catch (error) {
    console.error('Failed to load new user settings from server:', error);
    // 不设置 isLoaded = true，允许后续重试
  } finally {
    state.isLoading = false;
  }
}

/**
 * 获取指定 plan 的选项卡片选择数量
 * 
 * @param plan - 计划类型
 * @returns 该计划的选项卡片选择数量配置
 * @throws 如果设置未加载或配置不存在，会抛出错误
 */
export function getOptionsCardSelNumber(plan: PlanType) {
  if (!state.settings) {
    throw new Error('New user settings not loaded. Please ensure the server is running and the user is logged in.');
  }

  const planConfig = state.settings.options_card_sel_number[plan];
  if (!planConfig) {
    throw new Error(`Configuration for plan "${plan}" not found in user settings.`);
  }

  return planConfig;
}

/**
 * 导出只读状态
 */
export const newUserSettingsState = readonly(state);
