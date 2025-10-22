<template>
  <span
    :class="['svg-icon', className, originalColorClass]"
    :style="iconStyle"
    role="img"
    :aria-label="name"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getIconPath, type IconColor } from './iconUtils';

interface Props {
  name: string;
  size?: string;
  className?: string;
  /**
   * 图标颜色。传入 'original' 可使用原始 SVG 颜色。
   */
  color?: IconColor | 'original';
}

const props = withDefaults(defineProps<Props>(), {
  size: '24px',
  className: '',
  color: 'white'
});

const iconSrc = computed(() => getIconPath(props.name));

const useOriginalColors = computed(() => props.color === 'original');

const resolvedColor = computed(() => {
  if (!props.color || props.color === 'original') {
    return undefined;
  }
  if (props.color === 'currentColor') {
    return 'currentColor';
  }
  return props.color;
});

const maskValue = computed(() => `url(${iconSrc.value}) center / contain no-repeat`);

const iconStyle = computed(() => {
  const baseStyle: Record<string, string> = {
    width: props.size,
    height: props.size,
    display: 'inline-block'
  };

  if (useOriginalColors.value) {
    return {
      ...baseStyle,
      backgroundImage: `url(${iconSrc.value})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'contain'
    };
  }

  const color = resolvedColor.value || '#ffffff';

  return {
    ...baseStyle,
    backgroundColor: color,
    WebkitMask: maskValue.value,
    mask: maskValue.value
  };
});

const originalColorClass = computed(() => (useOriginalColors.value ? 'svg-icon--original' : ''));
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  vertical-align: middle;
  color: inherit;
}

.svg-icon--original {
  background-color: transparent;
}
</style>