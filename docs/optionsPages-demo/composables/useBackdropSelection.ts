import { ref, computed, watch } from 'vue';

/**
 * 背景选择管理
 * 处理卡片选择状态
 */
export function useBackdropSelection(initialSelection?: Record<string, string[]>) {
  const selectedMap = ref<Record<string, string[]>>({});
  
  const selectedCount = computed(() => 
    Object.values(selectedMap.value).reduce((sum, arr) => sum + (arr?.length ?? 0), 0)
  );

  /**
   * 克隆选择映射
   */
  function cloneSelection(map?: Record<string, string[]>): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    if (!map) return result;
    Object.entries(map).forEach(([key, value]) => {
      result[key] = Array.isArray(value) ? [...value] : [];
    });
    return result;
  }

  /**
   * 处理卡片切换
   */
  function handleCardToggle({ category, selectedList }: { category: string; selectedList: string[] }) {
    selectedMap.value = {
      ...selectedMap.value,
      [category]: [...selectedList]
    };
  }

  /**
   * 初始化选择
   */
  function initializeSelection(selection?: Record<string, string[]>) {
    selectedMap.value = cloneSelection(selection);
  }

  // 监听初始选择变化
  if (initialSelection !== undefined) {
    watch(() => initialSelection, (map) => {
      selectedMap.value = cloneSelection(map);
    }, { immediate: true, deep: true });
  }

  return {
    selectedMap,
    selectedCount,
    handleCardToggle,
    cloneSelection,
    initializeSelection
  };
}
