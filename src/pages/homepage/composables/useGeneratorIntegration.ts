// 主页生成器集成组合式函数
// 处理生成器页面的打开、关闭和预览图片管理

import { ref } from 'vue';
import { usePersistentModal } from '@/composables/usePersistentModal';
import { uiState } from '@/state/uiState';

export function useGeneratorIntegration() {
  // 预览图片状态
  const previewImage = ref<string | null>(null);
  
  // 生成器页面状态（使用持久化模态框）
  const showGenerator = usePersistentModal('generator', { data: { previewImage } });

  // 打开生成器页面
  const openGenerator = (img?: string) => {
    previewImage.value = img || null;
    
    // 标记这次是从主页卡片进入，应该重置到 1P tab
    if (typeof window !== 'undefined') {
      localStorage.setItem('generator_reset_to_1p', '1');
    }
    
    showGenerator.value = true;
  };

  // 关闭生成器页面
  const closeGenerator = () => {
    showGenerator.value = false;
    
    // 清理可能残留的重置标记
    if (typeof window !== 'undefined') {
      localStorage.removeItem('generator_reset_to_1p');
    }
  };

  // 使用 Demo 图片（暂时保留，可能用于其他功能）
  const useDemo = (d: string) => {
    previewImage.value = d;
  };

  // 初始化预览图片状态
  function initializePreviewImage() {
    if (showGenerator.value && uiState.previewImage) {
      previewImage.value = uiState.previewImage;
    }
  }

  // 设置预览图片状态监听
  function setupPreviewImageWatcher() {
    // 这个监听器会在组件中设置
    return (v: string | null) => {
      uiState.previewImage = v;
    };
  }

  return {
    // 状态
    previewImage,
    showGenerator,

    // 方法
    openGenerator,
    closeGenerator,
    useDemo,
    initializePreviewImage,
    setupPreviewImageWatcher
  };
}