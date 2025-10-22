/**
 * 图片预处理模块
 * 处理图片的方向、裁剪、缩放和格式转换
 */

import {
  renderCanvasWithOrientation,
  cropCanvasToAspect,
  downscaleCanvasIfNeeded,
  canvasToWebp,
  loadImage,
  imageToWebpFile
} from './canvasUtils';

const DEFAULT_MIN_SIDE = 1232;
const DEFAULT_ASPECT = 1; // 默认 1:1，可由调用者覆盖
const DEFAULT_WEBP_QUALITY = 0.8;

export interface PreprocessOptions {
  /** 目标宽高比，默认 1（正方形）。示例：人脸=1，Backdrop/Outfit/Pose/Hairstyle=4/5 */
  aspectRatio?: number;
  /** 最小边尺寸，默认 1232 */
  targetMinSide?: number;
  /** WebP 质量系数，默认 0.8 */
  quality?: number;
}

export function ensureWebpExtension(name: string): string {
  if (/\.webp$/i.test(name)) return name;
  const base = name.includes('.') ? name.replace(/\.[^.]+$/, '') : name;
  return `${base}.webp`;
}

export async function preprocess(file: File, opts: PreprocessOptions = {}): Promise<File> {
  const aspect = opts.aspectRatio ?? DEFAULT_ASPECT;
  const targetMin = opts.targetMinSide ?? DEFAULT_MIN_SIDE;
  const quality = opts.quality ?? DEFAULT_WEBP_QUALITY;
  try {
    const orientedCanvas = await renderCanvasWithOrientation(file);
    const croppedCanvas = cropCanvasToAspect(orientedCanvas, aspect);
    const finalCanvas = downscaleCanvasIfNeeded(croppedCanvas, targetMin);
    const blob = await canvasToWebp(finalCanvas, quality);
    return new File([blob], ensureWebpExtension(file.name), { type: 'image/webp' });
  } catch (err) {
    console.error('[imagePreprocessor] preprocess failed, using legacy fallback', err);
    try {
      return await legacyPreprocess(file, targetMin);
    } catch (legacyErr) {
      console.error('[imagePreprocessor] legacy preprocess failed', legacyErr);
      return file;
    }
  }
}

async function legacyPreprocess(file: File, targetMin: number): Promise<File> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(fr.error);
    fr.onload = () => resolve(fr.result as string);
    fr.readAsDataURL(file);
  });
  const img = await loadImage(dataUrl);
  const { width, height } = img;
  const minSide = Math.min(width, height);
  if (minSide <= targetMin) {
    return await imageToWebpFile(img, ensureWebpExtension(file.name));
  }
  const scale = targetMin / minSide;
  const outW = Math.round(width * scale);
  const outH = Math.round(height * scale);
  return await imageToWebpFile(img, ensureWebpExtension(file.name), outW, outH);
}
