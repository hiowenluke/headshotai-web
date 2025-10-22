/**
 * 用户设置相关的类型定义
 */

/**
 * 新用户初始设置接口返回类型
 */
export interface NewUserSettings {
  options_card_sel_number: {
    '20P': {
      backdrops: number;
      hairstyles: number;
      poses: number;
      outfits: number;
    };
    '40P': {
      backdrops: number;
      hairstyles: number;
      poses: number;
      outfits: number;
    };
    '80P': {
      backdrops: number;
      hairstyles: number;
      poses: number;
      outfits: number;
    };
  };
}

/**
 * Plan 类型
 */
export type PlanType = '20P' | '40P' | '80P';

/**
 * 选项类型
 */
export type OptionType = 'backdrops' | 'hairstyles' | 'poses' | 'outfits';
