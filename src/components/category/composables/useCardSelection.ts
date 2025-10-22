/**
 * 卡片选择管理
 * 处理卡片的选中状态
 */

import { ref, watch } from 'vue';

export function useCardSelection(
  initialSelectedMap: Record<string, string[]>,
  emit: any
) {
  const selectedUrlsMap = ref<Record<string, string[]>>({});

  function getSelectedList(category: string): string[] {
    return selectedUrlsMap.value[category] || [];
  }

  function ensureCategorySelection(category: string) {
    if (!selectedUrlsMap.value[category]) {
      selectedUrlsMap.value = {
        ...selectedUrlsMap.value,
        [category]: []
      };
    }
  }

  function onCardToggle(category: string, url: string) {
    ensureCategorySelection(category);
    const current = selectedUrlsMap.value[category] || [];
    const exists = current.includes(url);
    const nextList = exists ? current.filter((v) => v !== url) : [...current, url];
    selectedUrlsMap.value = {
      ...selectedUrlsMap.value,
      [category]: nextList
    };
    emit('card-toggle', { category, url, selected: !exists, selectedList: nextList });
    emit('selection-change', { category, selectedList: nextList });
  }

  function getSelectedMap() {
    return { ...selectedUrlsMap.value };
  }

  // 监听初始选中状态
  watch(
    () => initialSelectedMap,
    (map) => {
      const clone: Record<string, string[]> = {};
      if (map) {
        Object.entries(map).forEach(([key, value]) => {
          clone[key] = Array.isArray(value) ? [...value] : [];
        });
      }
      selectedUrlsMap.value = clone;
    },
    { immediate: true, deep: true }
  );

  return {
    selectedUrlsMap,
    getSelectedList,
    onCardToggle,
    getSelectedMap
  };
}
