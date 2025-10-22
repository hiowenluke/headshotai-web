export interface UploadTaskResult {
  success: boolean;
  url?: string;
  file: File;
  error?: any;
}

export interface UploadProgressEvent {
  index: number;
  total: number;
  file: File;
  status: 'preparing' | 'uploading' | 'success' | 'error' | 'canceled';
  retry: number;
  url?: string;
  error?: any;
}

export interface UploadOptions {
  endpoint?: string;
  maxRetries?: number;
  signal?: AbortSignal;
  onProgress?: (e: UploadProgressEvent) => void;
  minDisplayTime?: number;
  userId?: string;
  category?: string;
  /** 图像裁剪目标宽高比，默认 1（人脸上传=1，Backdrop/Outfit/Pose/Hairstyle 建议 4/5） */
  aspectRatio?: number;
}

export const DEFAULT_ENDPOINT = '/api/upload';
export const DEFAULT_CATEGORY = 'faces';
