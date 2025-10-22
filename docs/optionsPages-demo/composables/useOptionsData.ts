import { ref } from 'vue';
import { fetchDemoOptionsImages } from '@/services/imageService';

/**
 * 通用选项数据管理
 * 处理数据加载和状态管理
 * @param optionType - 选项类型：'backdrops' | 'hairstyles' | 'outfits' | 'poses'
 * @param initialSelection - 初始选择状态，用于智能排序
 * @param defaultSelectionCount - 默认选择数量（第一次访问时）
 */
export function useOptionsData(
  optionType: string,
  initialSelection?: Record<string, string[]>,
  defaultSelectionCount?: number
) {
  const cardDataMap = ref<Record<string, any[]>>({});
  const noMoreMap = ref<Record<string, boolean>>({});
  const infiniteDisabledMap = ref<Record<string, boolean>>({});
  const loadingFirstPageMap = ref<Record<string, boolean>>({});
  const loadingMoreMap = ref<Record<string, boolean>>({});
  
  // 记录是否是第一次访问（没有历史选择）
  const isFirstVisit = !initialSelection || Object.keys(initialSelection).length === 0;

  /**
   * 智能排序：将已选择的卡片排在前面
   */
  function sortCardsBySelection(cards: any[], category: string): any[] {
    if (!initialSelection || !initialSelection[category]) {
      return cards;
    }

    const selectedUrls = new Set(initialSelection[category]);
    const selected: any[] = [];
    const unselected: any[] = [];

    cards.forEach(card => {
      if (selectedUrls.has(card.url || card)) {
        selected.push(card);
      } else {
        unselected.push(card);
      }
    });

    return [...selected, ...unselected];
  }

  /**
   * 获取默认选择的卡片 URL（第一次访问时）
   */
  function getDefaultSelectedUrls(cards: any[], count: number): string[] {
    if (!count || count <= 0) return [];
    return cards.slice(0, count).map(card => card.url || card);
  }

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

      let cards = result.images;

      // 智能排序：如果不是第一次访问，将已选择的卡片排在前面
      if (!isFirstVisit) {
        cards = sortCardsBySelection(cards, category);
      }

      // 同步设置数据，确保在渲染前完成
      cardDataMap.value[category] = cards;
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

  /**
   * 获取默认选择（第一次访问时使用）
   */
  function getDefaultSelection(): Record<string, string[]> {
    if (!isFirstVisit || !defaultSelectionCount) {
      return {};
    }

    const defaultSelection: Record<string, string[]> = {};
    
    // 为每个已加载的分类生成默认选择
    Object.keys(cardDataMap.value).forEach(category => {
      const cards = cardDataMap.value[category];
      if (cards && cards.length > 0) {
        defaultSelection[category] = getDefaultSelectedUrls(cards, defaultSelectionCount);
      }
    });

    return defaultSelection;
  }

  return {
    cardDataMap,
    noMoreMap,
    infiniteDisabledMap,
    loadingFirstPageMap,
    loadingMoreMap,
    loadCategory,
    getDefaultSelection,
    isFirstVisit
  };
}
