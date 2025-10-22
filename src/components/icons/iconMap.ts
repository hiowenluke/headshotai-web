// 图标名称映射，用于从ionicons和lucide图标名称转换为本地SVG文件名
export const iconMap = {
  // Ionicons 图标映射
  logoGoogle: 'logo-google',
  logoFacebook: 'logo-facebook',
  checkboxOutline: 'checkbox-outline',
  squareOutline: 'square-outline',
  timeOutline: 'time-outline',
  checkmarkOutline: 'checkmark-outline',
  flashOutline: 'flash-outline',
  closeOutline: 'close-outline',
  chevronForwardOutline: 'chevron-forward-outline',
  chevronBackOutline: 'chevron-back-outline',
  chevronDownOutline: 'chevron-down-outline',
  mailOutline: 'mail-outline',
  shieldCheckmarkOutline: 'shield-checkmark-outline',
  documentTextOutline: 'document-text-outline',
  heartOutline: 'heart-outline',
  menuOutline: 'menu-outline',
  flashOffOutline: 'flash-off-outline',
  
  // Lucide 图标映射
  User: 'user',
  Heart: 'heart',
  CircleDollarSign: 'circle-dollar-sign',
  Receipt: 'receipt',
  Cookie: 'cookie',
  ChevronsRight: 'chevrons-right'
} as const;

export type IconName = keyof typeof iconMap;