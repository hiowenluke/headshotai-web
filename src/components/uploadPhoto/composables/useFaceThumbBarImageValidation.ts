/**
 * FaceThumbBar 图片验证逻辑
 * 负责验证图片是否存在，过滤无效图片
 */
import { ref, watch } from 'vue';

export interface ImageValidationEmits {
  imagesFiltered: (validImages: string[]) => void;
  selectionChange: (data: { selected: string[]; count: number }) => void;
}

export function useFaceThumbBarImageValidation(
  images: () => string[],
  selectedList: () => string[],
  emit: ImageValidationEmits
) {
  // 存储已验证存在的图片 URL
  const validatedImages = ref<Set<string>>(new Set());
  // 存储已验证不存在的图片 URL
  const invalidImages = ref<Set<string>>(new Set());
  // 过滤后的有效图片列表
  const filteredImages = ref<string[]>([]);

  /**
   * 检查单个图片是否存在
   */
  const checkImageExists = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // 如果已经验证过，直接返回结果
      if (validatedImages.value.has(url)) {
        resolve(true);
        return;
      }
      if (invalidImages.value.has(url)) {
        resolve(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        validatedImages.value.add(url);
        resolve(true);
      };
      img.onerror = () => {
        invalidImages.value.add(url);
        console.warn('[FaceThumbBar] Image not found:', url);
        resolve(false);
      };
      // 设置超时，避免长时间等待
      setTimeout(() => {
        if (!validatedImages.value.has(url) && !invalidImages.value.has(url)) {
          invalidImages.value.add(url);
          resolve(false);
        }
      }, 5000);
      img.src = url;
    });
  };

  /**
   * 验证图片列表，过滤掉不存在的图片
   */
  const validateImages = async (imageList: string[]) => {
    const results = await Promise.all(
      imageList.map(async (url) => {
        const exists = await checkImageExists(url);
        return exists ? url : null;
      })
    );

    const valid = results.filter((url): url is string => url !== null);

    // 如果有图片被过滤掉，通知父组件
    if (valid.length !== imageList.length) {
      const removed = imageList.filter(url => !valid.includes(url));
      console.log('[FaceThumbBar] Removed invalid images:', removed);

      // 通知父组件更新图片列表（移除无效图片）
      emit.imagesFiltered(valid);

      // 同时更新选中列表，移除无效图片
      const validSelectedList = selectedList().filter(url => valid.includes(url));
      if (validSelectedList.length !== selectedList().length) {
        emit.selectionChange({ selected: validSelectedList, count: validSelectedList.length });
      }
    }

    filteredImages.value = valid;
  };

  /**
   * 处理图片加载错误
   */
  const handleImageError = (url: string) => {
    console.warn('[FaceThumbBar] Image load error:', url);
    invalidImages.value.add(url);

    // 从过滤后的列表中移除
    const newFiltered = filteredImages.value.filter(img => img !== url);
    if (newFiltered.length !== filteredImages.value.length) {
      filteredImages.value = newFiltered;

      // 通知父组件
      emit.imagesFiltered(newFiltered);

      // 同时更新选中列表
      const validSelectedList = selectedList().filter(img => img !== url);
      if (validSelectedList.length !== selectedList().length) {
        emit.selectionChange({ selected: validSelectedList, count: validSelectedList.length });
      }
    }
  };

  // 监听 images 变化，自动验证
  watch(images, (newImages) => {
    if (newImages.length > 0) {
      validateImages(newImages);
    } else {
      filteredImages.value = [];
    }
  }, { immediate: true });

  return {
    filteredImages,
    validatedImages,
    invalidImages,
    checkImageExists,
    validateImages,
    handleImageError,
  };
}
