import { ref } from 'vue';
import { fetchDemoOptionsImages } from '@/services/imageService';

/**
 * 选项数据管理（通用版本）
 * 处理数据加载和状态管理
 * @param optionType - 选项类型，对应不同的选项页面
 */
export function useBackdropData(optionType: string) {
  const cardDataMap = ref<Record<string, any[]>>({});
  const noMoreMap = ref<Record<string, boolean>>({});
  const infiniteDisabledMap = ref<Record<string, boolean>>({});
  const loadingFirstPageMap = ref<Record<string, boolean>>({});
  const loadingMoreMap = ref<Record<string, boolean>>({});

  /**
   * 加载分类数据
   */
  async function loadCategory(category: string) {
    // 如果已经加载过，直接返回
    if (cardDataMap.value[category] && cardDataMap.value[category].length > 0) {
      return;
    }

    // 设置加载状态
    loadingFirstPageMap.value[category] = true;

    try {
      // 从服务器获取图片列表
      // 参数说明：
      // - type: 选项类型，对应文件夹结构 public/images/demo/options/{type}/
      //   可选值：'backdrops' | 'hairstyles' | 'outfits' | 'poses'
      //   由调用者（各个选项页面）传入，例如：
      //   - BackdropsPage 传递 'backdrops'
      //   - HairstylesPage 传递 'hairstyles'
      //   - OutfitsPage 传递 'outfits'
      //   - PosesPage 传递 'poses'
      //
      // - category: 具体分类名称，对应文件夹结构 public/images/demo/options/{type}/{category}/
      //   由菜单配置的 name 字段决定，例如：
      //   - 无子菜单：直接使用菜单项的 name，如 'HOT', 'Short', 'Medium'
      //   - 有子菜单：使用 '主菜单name/子菜单name' 格式，如 'Office/Luxury', 'Studio/Dark'
      const result = await fetchDemoOptionsImages({
        type: optionType,
        category: category,
        page: 1,
        perPage: 50
      });

      cardDataMap.value[category] = result.images;
      noMoreMap.value[category] = !result.hasMore;
      infiniteDisabledMap.value[category] = !result.hasMore;
    } catch (error) {
      console.error(`Failed to load ${optionType} category:`, category, error);
      cardDataMap.value[category] = [];
      noMoreMap.value[category] = true;
      infiniteDisabledMap.value[category] = true;
    } finally {
      loadingFirstPageMap.value[category] = false;
    }
  }

  return {
    cardDataMap,
    noMoreMap,
    infiniteDisabledMap,
    loadingFirstPageMap,
    loadingMoreMap,
    loadCategory
  };
}
