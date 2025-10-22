<template>
  <div class="grouped-card-list">
    <div v-if="loading" class="state loading">
      <div class="spinner"></div>
      <p>{{ loadingText }}</p>
    </div>

    <div v-else-if="error" class="state error">
      <SvgIcon name="warning-outline" size="32px" />
      <p>{{ error }}</p>
      <button v-if="showRetry" type="button" @click="$emit('retry')">Try again</button>
    </div>

    <div v-else-if="groupedItems.length === 0" class="state empty">
      <p>{{ emptyText }}</p>
    </div>

    <div v-else class="groups-container">
      <div v-for="group in groupedItems" :key="group.category" class="group">
        <h3 class="group-title">{{ group.displayName }}</h3>
        <section class="cards-grid">
          <article
            v-for="item in group.items"
            :key="item.url"
            class="card"
            :class="{ selected: selectable && isSelected(item.url), 'folder-style': folderStyle }"
            @click="handleCardClick(item)"
          >
            <div class="card-image" :style="cardStyle">
              <img :src="item.url" :alt="item.displayName || 'Card image'" />
              <span v-if="selectable" class="checkmark" aria-hidden="true">✓</span>
            </div>
            <div v-if="showFileName && item.displayName" class="card-filename" :class="{ 'wrap': wrapFileName }">
              {{ item.displayName }}
            </div>
          </article>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';

export interface CardItem {
  url: string;
  displayName?: string;
  [key: string]: any;
}

export interface GroupedCategory {
  category: string;
  displayName: string;
  items: CardItem[];
}

interface Props {
  items: CardItem[];
  baseUrl: string;              // 图片 URL 根目录，例如 "images/demo/options/backdrops"
  selectedUrls?: string[];
  aspectRatio?: number;         // 卡片宽高比，默认 1 (正方形)
  selectable?: boolean;         // 是否可选中，默认 false
  showFileName?: boolean;       // 是否显示文件名，默认 false
  wrapFileName?: boolean;       // 文件名是否折行，默认 false（单行+淡出效果）
  folderStyle?: boolean;        // 是否显示为文件夹样式（层叠效果），默认 false
  loading?: boolean;
  loadingText?: string;
  error?: string | null;
  showRetry?: boolean;
  emptyText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  selectedUrls: () => [],
  aspectRatio: 1,
  selectable: false,
  showFileName: false,
  wrapFileName: false,
  folderStyle: false,
  loading: false,
  loadingText: 'Loading...',
  error: null,
  showRetry: true,
  emptyText: 'No items yet.',
});

const emit = defineEmits<{
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

const cardStyle = computed(() => ({
  aspectRatio: `${props.aspectRatio}`
}));

/**
 * 从 URL 中提取分类名称
 * 例如: "images/demo/options/backdrops/1@Studio/xxx.webp" -> "1@Studio"
 */
const extractCategory = (url: string): string | null => {
  // 移除 baseUrl 前缀
  const relativePath = url.replace(props.baseUrl, '').replace(/^\/+/, '');
  
  // 提取第一级子目录
  const parts = relativePath.split('/');
  if (parts.length >= 2) {
    return parts[0];
  }
  
  return null;
};

/**
 * 处理分类名称
 * 1. 去掉开头的 "{id}@" 格式（例如 "1@"、"2@"）
 * 2. 将 "-" 替换为空格
 */
const formatCategoryName = (category: string): string => {
  // 去掉开头的 "{id}@" 格式
  const withoutId = category.replace(/^\d+@/, '');
  
  // 将 "-" 替换为空格
  const withSpaces = withoutId.replace(/-/g, ' ');
  
  return withSpaces;
};

/**
 * 从 URL 中提取文件名（不含扩展名）
 * 例如: "images/demo/options/backdrops/1@Studio/modern-office.webp" -> "modern-office"
 */
const extractFileName = (url: string): string => {
  const fileName = url.split('/').pop() || '';
  return fileName.replace(/\.[^.]+$/, '');
};

/**
 * 确保 item 有 displayName
 * 如果没有，则从 URL 中提取文件名
 */
const ensureDisplayName = (item: CardItem): CardItem => {
  if (item.displayName) {
    return item;
  }
  return {
    ...item,
    displayName: extractFileName(item.url)
  };
};

/**
 * 对分类进行分组和排序
 */
const groupedItems = computed<GroupedCategory[]>(() => {
  // console.log('[GroupedCardList] Start processing groups:', {
  //   itemsCount: props.items.length,
  //   baseUrl: props.baseUrl,
  //   items: props.items
  // });

  if (!props.items.length) {
    // console.log('[GroupedCardList] Items empty, returning empty array');
    return [];
  }

  // 1. 提取所有分类名称，并确保每个 item 都有 displayName
  const categoryMap = new Map<string, CardItem[]>();
  
  props.items.forEach(item => {
    const category = extractCategory(item.url);
    // console.log('[GroupedCardList] Extract category:', {
    //   url: item.url,
    //   category
    // });
    
    if (category) {
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      // 确保 item 有 displayName
      const itemWithName = ensureDisplayName(item);
      categoryMap.get(category)!.push(itemWithName);
    }
  });

  // console.log('[GroupedCardList] Category mapping:', {
  //   categoriesCount: categoryMap.size,
  //   categories: Array.from(categoryMap.keys()),
  //   categoryMap: Object.fromEntries(categoryMap)
  // });

  // 2. 获取唯一的分类名称并排序
  const categories = Array.from(categoryMap.keys()).sort();

  // console.log('[GroupedCardList] Sorted categories:', categories);

  // 3. 构建分组数据
  const result = categories.map(category => ({
    category,
    displayName: formatCategoryName(category),
    items: categoryMap.get(category) || []
  }));

  // console.log('[GroupedCardList] Final grouped result:', {
  //   groupsCount: result.length,
  //   groups: result.map(g => ({
  //     category: g.category,
  //     displayName: g.displayName,
  //     itemsCount: g.items.length
  //   })),
  //   fullResult: result
  // });

  return result;
});
</script>

<style scoped>
.grouped-card-list {
  position: relative;
  padding: 10px;
  color: #fff;
  /* 允许触摸滚动 */
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
  overflow-x: hidden;
}

.groups-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-bottom: 40px;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  padding: 0 4px;
  color: #fff;
  letter-spacing: 0.3px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  align-items: start;
  grid-auto-rows: auto;
}

.card {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: visible;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: auto;
}

.card:active {
  transform: scale(0.98);
}

/* 文件夹样式：移除边框，调整背景 */
.card.folder-style {
  border: none;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

/* 文件夹样式：缩小图片区域，为层叠效果预留空间 */
.card.folder-style .card-image {
  position: relative;
  width: calc(100% - 7px);
  height: calc(100% - 7px);
  z-index: 3;
  overflow: visible !important;
}

/* 文件夹样式：图片本身在最上层，恢复圆角和边框 */
.card.folder-style .card-image img {
  position: relative;
  z-index: 3;
  border-radius: 12px;
  border: 1px solid rgb(71, 71, 71);
}

/* 文件夹样式：层叠效果 - 两层背景在右下方 */
.card.folder-style .card-image::before,
.card.folder-style .card-image::after {
  content: '';
  position: absolute;
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  border-radius: 12px;
}

.card.folder-style .card-image::before {
  top: 6px;
  left: 6px;
  /* background: rgb(122, 122, 122); */
  opacity: 1;
  z-index: 2;
  border-right: 1px solid rgb(141, 141, 141);
  border-bottom: 1px solid rgb(141, 141, 141);
}

.card.folder-style .card-image::after {
  top: 9px;
  left: 9px;
  /* background: rgb(142, 142, 142); */
  opacity: 1;
  z-index: 1;
  border-right: 1px solid rgb(141, 141, 141);
  border-bottom: 1px solid rgb(141, 141, 141);
}

/* 文件夹样式：文件名区域无背景，与图片对齐，下移 5px */
.card.folder-style .card-filename {
  background: transparent;
  width: 100%;
  margin-top: 3px;
}

.card.selected {
  border-color: rgba(42, 120, 255, 0.85);
  box-shadow: 0 12px 28px rgba(42, 120, 255, 0.25);
}

.card-filename {
  padding: 8px 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  background: rgba(0, 0, 0, 0.2);
  text-align: center;
  line-height: 1.3;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-height: 32px;
  position: relative;
  /* 默认单行显示，溢出隐藏 */
  white-space: nowrap;
  overflow: hidden;
}

/* 单行模式：右侧固定显示淡出遮罩 */
.card-filename:not(.wrap)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 24px;
  background: linear-gradient(to right, transparent, rgba(37, 38, 43, 0.9));
  pointer-events: none;
}

/* folder 模式下：移除淡出遮罩 */
.card.folder-style .card-filename:not(.wrap)::after {
  display: none;
}

/* 折行模式 */
.card-filename.wrap {
  white-space: normal;
  word-break: break-word;
  overflow: visible;
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
  z-index: 10;
}

.card.selected .checkmark {
  opacity: 1;
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
