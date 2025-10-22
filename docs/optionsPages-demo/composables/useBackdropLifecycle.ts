import { watch, onMounted, type Ref } from 'vue';
import type { FlatMenuItem } from '@/pages/homepage/menuData';

/**
 * 背景页面生命周期管理
 * 处理数据加载时机
 */
export function useBackdropLifecycle(
  isOpen: Ref<boolean>,
  currentFlatIndex: Ref<number>,
  flatMenus: FlatMenuItem[],
  loadCategory: (category: string) => Promise<void>
) {
  /**
   * 初始化：加载第一个分类的数据
   */
  onMounted(() => {
    if (flatMenus.length > 0) {
      const firstCategory = flatMenus[0].category;
      loadCategory(firstCategory);
    }
  });

  /**
   * 监听 isOpen 变化，打开时加载数据
   */
  watch(() => isOpen.value, async (open) => {
    if (open) {
      if (flatMenus.length > 0) {
        const currentCategory = flatMenus[currentFlatIndex.value]?.category;
        if (currentCategory) {
          await loadCategory(currentCategory);
        }
      }
    }
  }, { immediate: true });

  /**
   * 监听 currentFlatIndex 变化，切换菜单时加载对应的数据
   */
  watch(currentFlatIndex, (newIndex) => {
    if (isOpen.value && flatMenus.length > 0 && flatMenus[newIndex]) {
      const category = flatMenus[newIndex].category;
      loadCategory(category);
    }
  });
}
