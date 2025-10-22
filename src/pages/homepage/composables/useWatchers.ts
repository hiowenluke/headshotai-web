import { watch, type Ref } from 'vue';

/**
 * 监听器管理
 * 设置各种响应式数据的监听器
 */
export function useWatchers(
  currentFlatIndex: Ref<number>,
  previewImage: Ref<any>,
  showGenerator: Ref<boolean>,
  syncMenuStates: (newFlatIndex: number) => void,
  setupPreviewImageWatcher: () => (newVal: any) => void,
  ensureDemoFacesLoaded: () => Promise<void>
) {
  /**
   * 设置所有监听器
   */
  function setupAllWatchers() {
    // 监听当前扁平索引变化，同步菜单状态
    watch(currentFlatIndex, (newIndex) => syncMenuStates(newIndex));

    // 监听预览图片变化
    watch(previewImage, setupPreviewImageWatcher());

    // 监听生成器打开状态，按需加载 demo faces
    watch(showGenerator, (open) => {
      if (open) {
        void ensureDemoFacesLoaded();
      }
    });
  }

  return {
    setupAllWatchers
  };
}
