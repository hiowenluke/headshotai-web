/**
 * FaceThumbBar UI 状态计算逻辑
 * 负责计算可见插槽、样式类等
 */
import { computed, type Ref } from 'vue';

export function useFaceThumbBarSlots(
  filteredImages: Ref<string[]>,
  totalSlots: () => number,
  isSelected: (img: string) => boolean
) {
  /**
   * 计算可见的插槽（包含图片或占位符）
   */
  const visibleSlots = computed<(string | null)[]>(() => {
    const imgs = filteredImages.value.slice(0, totalSlots());
    const placeholders = Array.from(
      { length: Math.max(totalSlots() - imgs.length, 0) },
      () => null as string | null
    );
    return [...imgs, ...placeholders];
  });

  /**
   * 计算插槽的样式类
   */
  const slotClass = (img: string | null) => {
    return {
      filled: !!img,
      placeholder: !img,
      selected: !!img && isSelected(img),
    };
  };

  return {
    visibleSlots,
    slotClass,
  };
}
