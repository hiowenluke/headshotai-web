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
   * 注意：不要过滤选中项！
   * FaceThumbBar 只显示前4张图片，但用户可能在 FaceUploadedPage 中选中了更多图片
   * 我们不应该过滤掉不在当前显示列表中的选中项
   */
  // watch 已移除，不再自动过滤选中项

  return {
    selectedSet,
    isSelected,
    onSlotClick,
  };
}
