/**
 * 文件上传模块
 * 处理文件的顺序上传，包括重试和进度报告
 */

import { DEFAULT_UPLOAD_MIN_DISPLAY_MS } from '@/constants/upload';
import { preprocess } from './imagePreprocessor';
import type { UploadTaskResult, UploadOptions } from './types';
import { DEFAULT_ENDPOINT, DEFAULT_CATEGORY } from './types';
import { resolveApiUrl } from '@/utils/api';

export async function uploadFilesSequential(
  files: File[],
  opts: UploadOptions = {}
): Promise<UploadTaskResult[]> {
  const endpoint = opts.endpoint || DEFAULT_ENDPOINT;
  const maxRetries = opts.maxRetries ?? 2;
  const minDisplayTime = opts.minDisplayTime ?? DEFAULT_UPLOAD_MIN_DISPLAY_MS;
  const userId = (opts.userId ?? '').trim();
  const category = (opts.category ?? DEFAULT_CATEGORY).trim() || DEFAULT_CATEGORY;

  if (!userId) {
    throw new Error('Missing authenticated user for upload');
  }

  const out: UploadTaskResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (opts.signal?.aborted) {
      out.push({ success: false, file, error: 'canceled' });
      break;
    }

    // 记录当前图片开始处理的时间
    const startTime = Date.now();

    opts.onProgress?.({ index: i, total: files.length, file, status: 'preparing', retry: 0 });

    let processed: File = file;
    try {
      // 将可选的裁剪宽高比透传给预处理（默认 1:1 由预处理内部处理）
      processed = await preprocess(file, { aspectRatio: opts.aspectRatio });
    } catch (e) {
      /* ignore preprocess errors; continue with original */
    }

    let attempt = 0;
    let success = false;
    let lastErr: any;
    let url: string | undefined;

    while (attempt <= maxRetries && !success) {
      if (opts.signal?.aborted) {
        lastErr = 'canceled';
        break;
      }

      opts.onProgress?.({
        index: i,
        total: files.length,
        file,
        status: 'uploading',
        retry: attempt
      });

      try {
        const body = new FormData();
        body.append('file', processed, processed.name || file.name);
        body.append('user', userId);
        body.append('category', category);

  const resp = await fetch(resolveApiUrl(endpoint), { method: 'POST', body, signal: opts.signal });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);

        const js = await resp.json();
        if (!js.success) throw new Error(js.error || 'upload failed');

        success = true;
        url = js.url;
        opts.onProgress?.({
          index: i,
          total: files.length,
          file,
          status: 'success',
          retry: attempt,
          url
        });
      } catch (e: any) {
        lastErr = e;
        attempt++;
        if (attempt > maxRetries) {
          opts.onProgress?.({
            index: i,
            total: files.length,
            file,
            status: opts.signal?.aborted ? 'canceled' : 'error',
            retry: attempt - 1,
            error: e
          });
        }
      }
    }

    // 计算已经过去的时间
    const elapsedTime = Date.now() - startTime;

    // 如果还没有达到最小展示时间，等待剩余时间
    if (elapsedTime < minDisplayTime && !opts.signal?.aborted) {
      const remainingTime = minDisplayTime - elapsedTime;
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    out.push({ success, url, file, error: success ? undefined : lastErr });
  }

  return out;
}
