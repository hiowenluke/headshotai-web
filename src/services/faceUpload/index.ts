/**
 * 人脸上传服务
 * 
 * 提供人脸照片上传的完整功能，包括：
 * - 图片预处理（方向校正、裁剪、缩放）
 * - EXIF 信息解析
 * - 文件上传（支持重试和进度报告）
 */

// 导出类型
export type {
  UploadTaskResult,
  UploadProgressEvent,
  UploadOptions
} from './types';

export { DEFAULT_ENDPOINT, DEFAULT_CATEGORY } from './types';

// 导出主要功能
export { preprocess } from './imagePreprocessor';
export type { PreprocessOptions } from './imagePreprocessor';
export { uploadFilesSequential } from './uploader';

// 导出工具函数（如果需要单独使用）
export { readOrientationFromFile, extractOrientationFromArrayBuffer } from './exifParser';
export {
  loadImage,
  renderCanvasWithOrientation,
  drawImageWithOrientation,
  cropCanvasToAspect,
  downscaleCanvasIfNeeded,
  canvasToWebp,
  imageToWebpFile
} from './canvasUtils';
