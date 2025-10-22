<template>
  <div 
    class="option-card" 
    :style="{ 
      width: cardSize.cardWidth + 'px', 
      height: cardSize.cardHeight + 'px' 
    }"
    @click="handleClick"
  >
    <div class="card-cover">
      <img :src="coverUrl" alt="" />
    </div>
    <div 
      class="card-footer" 
      :class="{ 'expanded': cardSize.hasEnoughHeight, 'with-checkbox': hasCheckbox }"
    >
      <div v-if="hasCheckbox" class="checkbox-title" @click.stop>
        <slot name="checkbox-title" />
      </div>
      <div class="footer-row">
        <div 
          class="card-title"
          :class="{ 'large-text': cardSize.hasEnoughHeight }"
        >{{ title }}</div>
        <div 
          class="card-counter"
          :class="{ 'large-text': cardSize.hasEnoughHeight }"
          v-html="formattedCounter"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';

interface CardSize {
  cardWidth: number;
  cardHeight: number;
  hasEnoughHeight?: boolean;
}

interface Props {
  cardSize: CardSize;
  title: string;
  counter: string | number;
  coverUrl: string;
  popup: string;
  arguments: Record<string, any>;
}

interface ExtraProps {
  clickable?: boolean;
}
const props = defineProps<Props & ExtraProps>();

const emit = defineEmits<{
  openPopup: [popup: string, args: Record<string, any>];
}>();

const slots = useSlots();
const hasCheckbox = computed(() => !!slots['checkbox-title']);

// 格式化计数器显示
const formattedCounter = computed(() => {
  const counterStr = String(props.counter);
  
  // 如果包含分数，分子白色，分母淡黄色
  if (counterStr.includes('/')) {
    const [numerator, denominator] = counterStr.split('/');
    return `<span style="color: #fff">${numerator}</span><span style="color: #FFE082">/${denominator}</span>`;
  }
  
  // 整数直接显示白色
  return `<span style="color: #fff">${counterStr}</span>`;
});

const handleClick = () => {
  emit('openPopup', props.popup, props.arguments);
};
</script>

<style scoped>
.option-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  /* 移除 hover/active 的 transform/box-shadow 动画，只保留基础样式 */
}
.option-card[unclickable],
.option-card.unclickable {
  cursor: default;
  pointer-events: none;
}

.card-cover {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-footer {
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 40px;
  padding: 7px 7px 10px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 50%, transparent 100%);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-end;
  box-sizing: border-box;
  transition: height 0.2s ease, padding 0.2s ease;
}

.card-footer.expanded {
  height: 50px;
  padding: 12px;
}

.card-footer.with-checkbox {
  height: 128px; /* 原来64px，增加一倍 */
}
.card-footer.expanded.with-checkbox {
  height: 156px; /* 原来78px，增加一倍 */
}

.footer-row {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 17px;
  font-weight: bold;
  color: #fff;
  text-align: left;
  flex: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  transition: font-size 0.2s ease;
}

.card-title.large-text {
  font-size: 19px;
}

.card-counter {
  font-size: 17px;
  font-weight: bold;
  text-align: right;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  transition: font-size 0.2s ease;
}

.card-counter.large-text {
  font-size: 19px;
}
</style>
