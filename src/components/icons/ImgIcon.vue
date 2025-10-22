<template>
  <span
    :class="['img-icon', className, originalColorClass]"
    :style="iconStyle"
    role="img"
    :aria-label="alt || name"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getIconPath, type IconColor } from './iconUtils';

interface Props {
  name: string;
  color?: IconColor | 'original';
  size?: string;
  className?: string;
  alt?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: '#ffffff',
  size: '24px',
  className: '',
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

const originalColorClass = computed(() => (useOriginalColors.value ? 'img-icon--original' : ''));
</script>

<style scoped>
.img-icon {
  display: inline-block;
  vertical-align: middle;
}

.img-icon--original {
  background-color: transparent;
}
</style>