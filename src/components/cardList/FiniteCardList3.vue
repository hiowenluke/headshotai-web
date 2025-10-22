<template>
  <div class="finite-card-list-3">
    <div v-if="loading" class="state loading">
      <div class="spinner"></div>
      <p>{{ loadingText }}</p>
    </div>

    <div v-else-if="error" class="state error">
      <SvgIcon name="warning-outline" size="32px" />
      <p>{{ error }}</p>
      <button v-if="showRetry" type="button" @click="$emit('retry')">Try again</button>
    </div>

    <section v-else-if="items.length" class="cards-grid">
      <button v-if="showAddButton" class="card plus-card" :style="cardStyle" type="button" @click="$emit('add')">
        <span class="plus-symbol">+</span>
      </button>

      <article
        v-for="item in items"
        :key="item.url"
        class="card"
        :class="{ selected: selectable && isSelected(item.url), 'has-name': showName }"
        :style="cardStyle"
        @click="handleCardClick(item)"
      >
        <div class="card-image">
          <img :src="item.url" :alt="item.displayName || 'Card image'" />
          <span v-if="selectable" class="checkmark" aria-hidden="true">✓</span>
          <span v-if="cornerLabel" :class="['corner-label', cornerLabelPosition]">
            {{ getCornerLabel(item) }}
          </span>
        </div>
        <div v-if="showName" class="card-name">{{ item.displayName }}</div>
      </article>
    </section>

    <div v-else class="state empty">
      <p>{{ emptyText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';

export interface CardItem {
  url: string;
  displayName?: string;
  cornerLabel?: string;
  [key: string]: any;
}

interface Props {
  items: CardItem[];
  selectedUrls?: string[];
  aspectRatio?: number;          // 卡片宽高比，默认 1 (正方形)
  selectable?: boolean;          // 是否可选中，默认 false
  showAddButton?: boolean;       // 是否显示加号按钮，默认 false
  showName?: boolean;            // 是否在卡片底部显示名称，默认 false
  cornerLabel?: boolean;         // 是否显示角标，默认 false
  cornerLabelPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; // 角标位置
  cornerLabelFormatter?: (item: CardItem) => string; // 角标格式化函数
  loading?: boolean;
  loadingText?: string;
  error?: string | null;
  showRetry?: boolean;
  emptyText?: string;
  instanceKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  selectedUrls: () => [],
  aspectRatio: 1,
  selectable: false,
  showAddButton: false,
  showName: false,
  cornerLabel: false,
  cornerLabelPosition: 'bottom-right',
  cornerLabelFormatter: (item: CardItem) => item.displayName || '',
  loading: false,
  loadingText: 'Loading...',
  error: null,
  showRetry: true,
  emptyText: 'No items yet.',
  instanceKey: 'finite-list-3'
});

const emit = defineEmits<{
  add: [];
  toggle: [url: string];
  retry: [];
}>();

const selectedSet = computed(() => new Set(props.selectedUrls));
const isSelected = (url: string) => selectedSet.value.has(url);

const handleCardClick = (item: CardItem) => {
  if (props.selectable) {
    emit('toggle', item.url);
  }
};

const getCornerLabel = (item: CardItem) => {
  if (!props.cornerLabel) return '';
  return props.cornerLabelFormatter ? props.cornerLabelFormatter(item) : '';
};

const cardStyle = computed(() => ({
  aspectRatio: `${props.aspectRatio}`
}));

// -------- 布局尺寸缓存（减少首次渲染抖动）--------
type LayoutCache = { cardSize: number; ts: number };

const CACHE_VERSION = 'v1';

const cacheKeyForViewport = () => {
  const vw = Math.max(320, Math.round((window.innerWidth || 390)));
  const bucket = Math.floor(vw / 20) * 20;
  return `card_layout_${props.instanceKey}_${CACHE_VERSION}_${bucket}`;
};

const cached = ref<LayoutCache | null>(null);

function readCache() {
  try {
    const key = cacheKeyForViewport();
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as LayoutCache;
    if (!data || !data.cardSize) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data: LayoutCache) {
  try {
    const key = cacheKeyForViewport();
    localStorage.setItem(key, JSON.stringify({ ...data, ts: Date.now() }));
  } catch {
    /* ignore */
  }
}

async function measureAndCache() {
  await nextTick();
  try {
    const cardEl = document.querySelector('.finite-card-list-3 .cards-grid .card:not(.plus-card)') as HTMLElement | null;
    if (!cardEl) return;
    const cardRect = cardEl.getBoundingClientRect();
    const cardSize = Math.round(cardRect.width);
    const next: LayoutCache = { cardSize, ts: Date.now() };
    const prev = cached.value;
    if (!prev || Math.abs(prev.cardSize - next.cardSize) > 1) {
      cached.value = next;
      writeCache(next);
    }
  } catch {
    /* ignore */
  }
}

function handleResize() {
  measureAndCache();
}

onMounted(() => {
  cached.value = readCache();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

watch(
  () => props.items.length,
  (newLen, oldLen) => {
    if (newLen > 0 && oldLen === 0) {
      setTimeout(measureAndCache, 100);
      setTimeout(measureAndCache, 500);
    }
  }
);
</script>

<style scoped>
.finite-card-list-3 {
  position: relative;
  padding: 10px;
  color: #fff;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  align-items: stretch;
  grid-auto-rows: minmax(auto, max-content);
}

.card {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:active {
  transform: scale(0.98);
}

.card-image {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.card:not(.has-name) .card-image {
  aspect-ratio: inherit;
}

.card.has-name .card-image {
  flex: 1;
  min-height: 0;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-name {
  padding: 8px;
  background: rgba(0, 0, 0, 0.6);
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
}

.card.selected {
  border-color: rgba(42, 120, 255, 0.85);
  box-shadow: 0 12px 28px rgba(42, 120, 255, 0.25);
}

.checkmark {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #2a78ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.card.selected .checkmark {
  opacity: 1;
}

.corner-label {
  position: absolute;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  opacity: 0.85;
  color: #fff;
}

.corner-label.top-left {
  top: 10px;
  left: 10px;
}

.corner-label.top-right {
  top: 10px;
  right: 10px;
}

.corner-label.bottom-left {
  bottom: 10px;
  left: 10px;
}

.corner-label.bottom-right {
  bottom: 10px;
  right: 10px;
}

.plus-card {
  flex-direction: row;
  justify-content: center;
  align-items: center;
  text-align: center;
  border: 1px dashed rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
}

.plus-card .plus-symbol {
  position: relative;
  font-size: 60px;
  line-height: 1;
  color: #fff;
}

.plus-card:active {
  opacity: 0.8;
}

.state {
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  opacity: 0.85;
}

.state.loading .spinner {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

.state.error button {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.state.error button:active {
  opacity: 0.8;
}

.state.empty {
  opacity: 0.7;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
