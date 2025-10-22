<template>
  <div class="card-list">
    <ion-grid>
      <ion-row>
        <!-- 首屏 Skeleton 占位 -->
        <ion-col v-for="n in (loading ? skeletonCount : 0)" v-show="loading" size="6" :key="'sk-'+n" class="card-col">
          <CardInfo :is-loading="true" />
        </ion-col>
        <!-- 实际数据 -->
        <ion-col size="6" v-for="(item, idx) in (!loading ? items : [])" :key="idx" class="card-col">
          <CardInfo 
            :src="item"
            :selected="isSelected(item)"
            :disabled="!clickable"
            @click="() => handleCardClick(item)" />
        </ion-col>
        <!-- 加载更多阶段 Skeleton -->
        <template v-if="showLoadMoreSkeleton">
          <ion-col v-for="n in loadMoreSkeletonCount" :key="'lm-'+n" size="6" class="card-col">
            <CardInfo :is-loading="true" />
          </ion-col>
        </template>
      </ion-row>
    </ion-grid>
    <ion-infinite-scroll v-if="useInfinite" threshold="100px" @ionInfinite="onInfinite" :disabled="disabled">
      <ion-infinite-scroll-content loading-spinner="bubbles" :loading-text="loadingText"></ion-infinite-scroll-content>
    </ion-infinite-scroll>
  <div v-if="showNoMore" class="no-more">{{ noMoreText }}</div>
  </div>
</template>
<script setup lang="ts">
import { IonGrid, IonRow, IonCol, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/vue';
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import CardInfo from './CardInfo.vue';

const props = withDefaults(defineProps<{ 
  items: string[];
  useInfinite?: boolean;
  disabled?: boolean;
  noMore?: boolean;
  loading?: boolean; // 首屏加载 skeleton
  loadingMore?: boolean; // 加载更多阶段 skeleton
  loadingText?: string;
  noMoreText?: string;
  selectable?: boolean;
  clickable?: boolean;
  selectedItems?: string[];
  instanceKey?: string; // 实例唯一标识，用于区分不同页面的布局缓存
}>(), {
  useInfinite: true,
  disabled: false,
  noMore: false,
  loading: false,
  loadingMore: false,
  loadingText: 'Loading more...',
  noMoreText: 'No more content',
  selectable: false,
  clickable: true,
  selectedItems: () => [],
  instanceKey: 'home' // 默认为 home，保持向后兼容
});

// 自适应首屏 skeleton 数量（2 列布局）
const skeletonCount = ref(6); // 动态
const loadMoreSkeletonCount = 2; // 分页追加时展示 2 个占位（1 行）
const showLoadMoreSkeleton = computed(()=> !props.loading && props.loadingMore && !props.noMore && props.items.length>0);
// 仅在已有数据且完成所有加载后再显示 no more，避免首屏就出现
const showNoMore = computed(()=> !props.loading && !props.loadingMore && props.noMore && props.items.length > 0);

function recalcSkeleton() {
  try {
    const vw = window.innerWidth || 390;
    const vh = window.innerHeight || 800;
    // 估算单列实际宽度（两列 + 每列左右 padding 8px）
    const colHorizontalPadding = 16; // 8 + 8
    const cardWidth = Math.max(80, (vw / 2) - colHorizontalPadding);
    const cardHeight = cardWidth * (5/4); // aspect-ratio 4/5 => height = width * 5/4
    const rowVerticalPadding = 16; // 上下合计（ion-col padding）
    const rowHeight = cardHeight + rowVerticalPadding;
    // 可用高度（减去大致 header / nav 区域 120px，按需调优）
    const available = Math.max(200, vh - 120);
    const rows = Math.min(10, Math.max(2, Math.ceil(available * 0.9 / rowHeight)));
    skeletonCount.value = rows * 2; // 两列
  } catch {
    skeletonCount.value = 6;
  }
}

// -------- 布局尺寸缓存（减少首次渲染抖动）--------
type LayoutCache = { cardHeight: number; ts: number };

const CACHE_VERSION = 'v1';
const cacheKeyForViewport = () => {
  const vw = Math.max(320, Math.round((window.innerWidth || 390)));
  // 以 20px 作为桶粒度，避免细微差异导致缓存失效
  const bucket = Math.floor(vw / 20) * 20;
  // 使用 instanceKey 区分不同页面的缓存
  return `card_layout_${props.instanceKey}_${CACHE_VERSION}_${bucket}`;
};

const cached = ref<LayoutCache | null>(null);

function readCache() {
  try {
    const key = cacheKeyForViewport();
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as LayoutCache;
  if (!data || !data.cardHeight) return null;
    return data;
  } catch { return null; }
}

function writeCache(data: LayoutCache) {
  try {
    const key = cacheKeyForViewport();
    localStorage.setItem(key, JSON.stringify({ ...data, ts: Date.now() }));
  } catch { /* ignore */ }
}

async function measureAndCache() {
  await nextTick();
  try {
    const colEl = document.querySelector('.card-list ion-col.card-col') as HTMLElement | null;
  if (!colEl) return;
    const colRect = colEl.getBoundingClientRect();
    // 估算左右 padding（ion-col 样式中为 8px 左右）
    const computedStyle = window.getComputedStyle(colEl);
    const pl = parseFloat(computedStyle.paddingLeft || '8');
    const pr = parseFloat(computedStyle.paddingRight || '8');
    const colPadding = (isFinite(pl) ? pl : 8) + (isFinite(pr) ? pr : 8);
    const cardWidth = Math.max(80, colRect.width - colPadding);
    const cardHeight = Math.round(cardWidth * (5/4));
  const next: LayoutCache = { cardHeight, ts: Date.now() };
    // 若与缓存不同，则更新缓存
    const prev = cached.value;
  if (!prev || Math.abs(prev.cardHeight - next.cardHeight) > 1) {
      cached.value = next;
      writeCache(next);
    }
  } catch { /* ignore */ }
}

onMounted(() => {
  // 先读取缓存并应用，减少首次渲染高度跳变
  cached.value = readCache();
  // 若有缓存，用其高度推导更准确的 skeleton 行数
  if (cached.value?.cardHeight) {
    try {
      const vh = window.innerHeight || 800;
      const rowVerticalPadding = 16;
      const rowHeight = cached.value.cardHeight + rowVerticalPadding;
      const available = Math.max(200, vh - 120);
      const rows = Math.min(10, Math.max(2, Math.ceil(available * 0.9 / rowHeight)));
      skeletonCount.value = rows * 2;
    } catch { recalcSkeleton(); }
  } else {
    recalcSkeleton();
  }
  window.addEventListener('resize', recalcSkeleton);
  // 初次测量与缓存
  measureAndCache();
  // 在首次图片加载后或列表渲染更多后再次测量（简单延迟）
  setTimeout(measureAndCache, 200);
  setTimeout(measureAndCache, 800);
});
onBeforeUnmount(()=> window.removeEventListener('resize', recalcSkeleton));

const emit = defineEmits<{ (e:'load-more', ev:any):void; (e:'open', item:string):void; (e:'toggle', item:string):void }>();

function onInfinite(ev:any){ emit('load-more', ev); }

const selectedSet = computed(() => new Set(props.selectedItems));

function isSelected(item: string): boolean {
  return props.selectable && selectedSet.value.has(item);
}

function handleCardClick(item: string) {
  if (!props.clickable) return;
  if (props.selectable) {
    emit('toggle', item);
  } else {
    emit('open', item);
  }
}
</script>
<style scoped>
/* 卡片列表样式 */
.card-list { 
  width: 100%; 
  padding-bottom: 20px; /* 确保列表底部有适当间距 */
}

/* 卡片列布局 */
ion-col.card-col { 
  padding: 8px; 
}

/* 无更多内容提示 */
.no-more { 
  text-align: center; 
  padding: 16px 16px 60px 16px; /* 增加底部间距，确保文字在屏幕底部可见 */
  color: #9aa3b2;
  font-size: 14px;
}
</style>
