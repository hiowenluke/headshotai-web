/**
 * 图标工具函数
 * 提供统一的图标路径处理和颜色过滤器生成
 */

/**
 * 根据图标名称生成完整的SVG路径
 * @param iconName 图标名称（不含路径和扩展名）
 * @returns 完整的图标路径
 */
export const getIconPath = (iconName: string): string => {
  return `/images/icons/${iconName}.svg`;
};

/**
 * 将十六进制颜色转换为RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * 动态生成任意颜色的CSS filter（近似算法）
 */
const generateColorFilter = (targetColor: string): string => {
  const rgb = hexToRgb(targetColor);
  if (!rgb) return 'brightness(0) invert(1)'; // 默认白色

  // 简化的颜色转换算法
  const { r, g, b } = rgb;

  // 计算亮度
  const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

  // 计算色相（简化版）
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
  }
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  // 计算饱和度
  const saturation = max === 0 ? 0 : delta / max;

  // 生成filter
  const invert = brightness > 0.5 ? 0 : 100;
  const brightnessFilter = Math.round(brightness * 100);
  const saturateFilter = Math.round(saturation * 200 + 100);
  const hueRotate = hue;

  return `invert(${invert}%) brightness(${brightnessFilter}%) saturate(${saturateFilter}%) hue-rotate(${hueRotate}deg)`;
};

/**
 * 根据颜色生成CSS filter
 * @param color 目标颜色（十六进制或颜色名称）
 * @returns CSS filter 字符串
 */
export const getColorFilter = (color: string = '#ffffff'): string => {
  const normalizedColor = color.toLowerCase();

  // 处理常见的颜色名称
  if (normalizedColor === 'white' || normalizedColor === '#ffffff' || normalizedColor === '#fff') {
    return 'brightness(0) invert(1)'; // 白色
  }

  if (normalizedColor === 'black' || normalizedColor === '#000000' || normalizedColor === '#000') {
    return 'brightness(0)'; // 黑色
  }

  // 动态生成任意十六进制颜色的 filter
  if (normalizedColor.match(/^#[0-9a-f]{6}$/)) {
    return generateColorFilter(normalizedColor);
  }

  // 默认白色
  return 'brightness(0) invert(1)';
};

/**
 * 图标颜色类型定义
 * 支持任意十六进制颜色值或颜色名称
 */
export type IconColor = string;

/**
 * 图标配置接口
 */
export interface IconConfig {
  name: string;
  color?: IconColor;
  size?: string;
  className?: string;
}

/**
 * 生成图标的完整配置
 * @param config 图标配置
 * @returns 包含路径、样式等的完整配置
 */
export const createIconConfig = (config: IconConfig) => {
  return {
    src: getIconPath(config.name),
    style: {
      filter: getColorFilter(config.color),
      width: config.size || '24px',
      height: config.size || '24px',
    },
    class: config.className || '',
  };
};