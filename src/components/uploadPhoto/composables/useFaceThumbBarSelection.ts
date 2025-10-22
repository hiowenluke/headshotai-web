/**
 * FaceThumbBar 选择状态管理逻辑
 * 负责处理图片的选中/取消选中
 */
import { computed, watch } from 'vue';

export interface SelectionEmits {
  thumbToggle: (url: string) => void;
  selectionChange: (data: { selected: string[]; count: number }) => void;
}

export function useFaceThumbBarSelection(
  images: () => string[],
  selectedList: () => string[],
  emit: SelectionEmits
) {
  const selectedSet = computed(() => new Set(selectedList()));

  /**
   * 检查图片是否被选中
   */
  const isSelected = (img: string) => {
    return selectedSet.value.has(img);
  };

  /**
   * 处理图片点击，切换选中状态
   */
  const onSlotClick = (img: string | null) => {
    if (!img) return; // placeholder

    const list = selectedList().slice();
    const idx = list.indexOf(img);

    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(img);
    }

    emit.thumbToggle(img);
    emit.selectionChange({ selected: list, count: list.length });
  };

  /**
   * 当图片列表变化时，过滤掉不存在的选中项
   */
  watch(images, (arr: string[]) => {
    const currentSelectedList = selectedList();
    if (!currentSelectedList.length) return;

    const set = new Set(arr);
    const filtered = currentSelectedList.filter(i => set.has(i));

    if (filtered.length !== currentSelectedList.length) {
      emit.selectionChange({ selected: filtered, count: filtered.length });
    }
  });

  return {
    selectedSet,
    isSelected,
    onSlotClick,
  };
}
