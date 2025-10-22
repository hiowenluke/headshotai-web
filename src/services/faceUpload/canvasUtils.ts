/**
 * Canvas 操作工具模块
 * 处理图片渲染、裁剪、缩放、转换等操作
 */

import { readOrientationFromFile } from './exifParser';

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export async function renderCanvasWithOrientation(file: File): Promise<HTMLCanvasElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: 'from-image'
      } as ImageBitmapOptions);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        bitmap.close?.();
        throw new Error('Canvas 2D unsupported');
      }
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close?.();
      return canvas;
    } catch (bitmapError) {
      console.warn('[canvasUtils] createImageBitmap orientation fallback', bitmapError);
    }
  }

  const orientation = await readOrientationFromFile(file);
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    return drawImageWithOrientation(img, orientation ?? 1);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function drawImageWithOrientation(
  img: HTMLImageElement,
  orientation: number
): HTMLCanvasElement {
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  if (!width || !height) {
    throw new Error('Invalid image dimensions');
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D unsupported');
  }

  const swapDimensions = orientation >= 5 && orientation <= 8;
  canvas.width = swapDimensions ? height : width;
  canvas.height = swapDimensions ? width : height;

  switch (orientation) {
    case 2: // 水平翻转
      ctx.transform(-1, 0, 0, 1, width, 0);
      break;
    case 3: // 180°
      ctx.transform(-1, 0, 0, -1, width, height);
      break;
    case 4: // 垂直翻转
      ctx.transform(1, 0, 0, -1, 0, height);
      break;
    case 5: // 垂直翻转 + 90°
      ctx.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6: // 90°
      ctx.transform(0, 1, -1, 0, height, 0);
      break;
    case 7: // 水平翻转 + 270°
      ctx.transform(0, -1, -1, 0, height, width);
      break;
    case 8: // 270°
      ctx.transform(0, -1, 1, 0, 0, width);
      break;
    default:
      // orientation === 1 (正常)
      break;
  }

  ctx.drawImage(img, 0, 0);
  return canvas;
}

export function cropCanvasToAspect(
  source: HTMLCanvasElement,
  targetAspect: number
): HTMLCanvasElement {
  const srcWidth = source.width;
  const srcHeight = source.height;
  if (!srcWidth || !srcHeight) {
    throw new Error('Invalid source canvas size');
  }

  const currentAspect = srcWidth / srcHeight;
  let cropX = 0;
  let cropY = 0;
  let cropWidth = srcWidth;
  let cropHeight = srcHeight;

  if (Math.abs(currentAspect - targetAspect) > 0.001) {
    if (currentAspect > targetAspect) {
      cropWidth = Math.round(srcHeight * targetAspect);
      cropX = Math.round((srcWidth - cropWidth) / 2);
    } else {
      cropHeight = Math.round(srcWidth / targetAspect);
      cropY = Math.round((srcHeight - cropHeight) / 2);
    }
  }

  if (cropWidth === srcWidth && cropHeight === srcHeight) {
    return source;
  }

  const canvas = document.createElement('canvas');
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D unsupported');
  }
  ctx.drawImage(source, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return canvas;
}

export function downscaleCanvasIfNeeded(
  source: HTMLCanvasElement,
  targetMinSide: number
): HTMLCanvasElement {
  const minSide = Math.min(source.width, source.height);
  if (minSide <= targetMinSide || !source.width || !source.height) {
    return source;
  }
  const scale = targetMinSide / minSide;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(source.width * scale);
  canvas.height = Math.round(source.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D unsupported');
  }
  ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function canvasToWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('toBlob returned null'));
        }
      },
      'image/webp',
      quality
    );
  });
}

export async function imageToWebpFile(
  img: HTMLImageElement,
  name: string,
  w?: number,
  h?: number
): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = w || img.width;
  canvas.height = h || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unsupported');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      'image/webp',
      0.8
    );
  });
  return new File([blob], name, { type: 'image/webp' });
}
