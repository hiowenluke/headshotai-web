<template>
  <div class="thumb-bar" ref="rootRef">
    <div class="plus-btn plus-sign" @click="onPlus" role="button" aria-label="Add photos"></div>
    <div v-for="(img, idx) in visibleSlots" :key="idx" class="slot"
         :class="slotClass(img)" @click="onSlotClick(img)" role="button" :aria-label="img? 'Select image' : 'Empty slot'">
      <div class="slot-inner">
        <template v-if="img">
          <img :src="img" alt="thumbnail" @error="handleImageError(img)" />
          <span v-if="isSelected(img)" class="sel-mark">✓</span>
        </template>
      </div>
    </div>
    <div class="end-space">
      <!-- viewAllBtn 外层 wrapper 保持原 40px 布局宽度，内部按钮扩大点击热区 -->
      <div class="viewAllWrapper">
        <button class="viewAllBtn" type="button" @click="emit('viewAll')" aria-label="View all thumbnails" ref="viewAllBtnRef">
          <span class="viewAllInner">
            <SvgIcon name="chevrons-right" size="35px" class="icon" />
          </span>
        </button>
      </div>
    </div>
    <input ref="fileInputRef" class="hidden-file-input" type="file" accept="image/*" multiple @change="handleFiles" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';
import { useFaceThumbBarImageValidation } from './composables/useFaceThumbBarImageValidation';
import { useFaceThumbBarCache } from './composables/useFaceThumbBarCache';
import { useFaceThumbBarSelection } from './composables/useFaceThumbBarSelection';
import { useFaceThumbBarSlots } from './composables/useFaceThumbBarSlots';
import { useFaceThumbBarFileUpload } from './composables/useFaceThumbBarFileUpload';

interface Props {
  images: string[];
  selectedList?: string[];
  totalSlots?: number; // total visible thumbnail slots (including first filled); default 4 (1 + 3 placeholders)
}
const props = withDefaults(defineProps<Props>(), {
  images: () => [],
  selectedList: () => [],
  totalSlots: 4,
});
const emit = defineEmits(['plus','filesChange','viewAll','thumbToggle','selectionChange','cachedLoad','imagesFiltered']);

// DOM refs
const rootRef = ref<HTMLElement|null>(null);
const viewAllBtnRef = ref<HTMLButtonElement|null>(null);
const fileInputRef = ref<HTMLInputElement|null>(null);

// 图片验证逻辑
const { filteredImages, handleImageError } = useFaceThumbBarImageValidation(
  () => props.images,
  () => props.selectedList,
  {
    imagesFiltered: (valid) => emit('imagesFiltered', valid),
    selectionChange: (data) => emit('selectionChange', data),
  }
);

// 缓存管理逻辑
const { loadCachedUploads, clearCache } = useFaceThumbBarCache(
  () => props.images,
  () => props.selectedList,
  () => props.totalSlots,
  {
    cachedLoad: (items) => emit('cachedLoad', items),
  }
);

// 选择状态管理逻辑
const { isSelected, onSlotClick } = useFaceThumbBarSelection(
  () => props.images,
  () => props.selectedList,
  {
    thumbToggle: (url) => emit('thumbToggle', url),
    selectionChange: (data) => emit('selectionChange', data),
  }
);

// UI 状态计算逻辑
const { visibleSlots, slotClass } = useFaceThumbBarSlots(
  filteredImages,
  () => props.totalSlots,
  isSelected
);

// 文件上传逻辑
const { onPlus, handleFiles, openFilePicker } = useFaceThumbBarFileUpload(
  fileInputRef,
  {
    plus: () => emit('plus'),
    filesChange: (files) => emit('filesChange', files),
  }
);

// 组件挂载时加载缓存
onMounted(() => {
  loadCachedUploads();
});

// 暴露给父组件的方法
defineExpose({
  rootEl: rootRef,
  viewAllBtn: viewAllBtnRef,
  loadCachedUploads,
  clearRecentFacesCache: clearCache,
  openFilePicker,
});
</script>
<style scoped>
/* 调整：按需求将第一个缩略图与左屏幕边距离减少 10%。
  之前 gutter = plus-size 保证加号中心居中；现在 gutter = plus-size * 0.9。
  这会保持缩略图整体左移 10%；若需再次让加号严格居中，可后续同步缩放 plus-size。 */
/* 缩小加号 10% (78 -> 70)，固定 gutter≈原先 78*0.9=70 保持缩略图水平位置不变 */
.thumb-bar { --thumb-size:84px; /* +5% more */ --thumb-radius:14px; --gap:7px; --plus-size:70px; --gutter:70px; display:flex; align-items:center; gap:var(--gap); position:relative; font-family:inherit; padding-left:var(--gutter); padding-top:12px;  padding-bottom:12px; }
.plus-btn { position:absolute; left:2px; /* 右移 2px */ top:15px; width:var(--plus-size); height:var(--plus-size); display:block; cursor:pointer; user-select:none; box-sizing:border-box; z-index:1000; }
.plus-btn::before, .plus-btn::after { content:''; position:absolute; left:50%; top:50%; background:#fff; transform:translate(-50%, -50%); border-radius:1px; }
/* 横条 */
.plus-btn::before { width:40%; height:3px; }
/* 竖条 */
.plus-btn::after { width:3px; height:40%; }
.slot { width:var(--thumb-size); height:var(--thumb-size); border-radius:var(--thumb-radius); position:relative; cursor:pointer; }
.slot-inner { width:100%; height:100%; border-radius:var(--thumb-radius); overflow:hidden; background:transparent; display:flex; align-items:center; justify-content:center; position:relative; }
.slot.placeholder .slot-inner { box-shadow:0 0 0 1px #525252 inset; }
.slot.filled .slot-inner { box-shadow:0 0 0 1px #979797; transition:box-shadow .18s ease, transform .18s ease; }
.slot-inner img { width:100%; height:100%; object-fit:cover; display:block; }
.sel-mark { position:absolute; top:6px; right:6px; width:20px; height:20px; border-radius:10px; background:#2a78ff; color:#fff; font-size:13px; display:flex; align-items:center; justify-content:center; font-weight:700; box-shadow:0 2px 4px rgba(0,0,0,0.4); }
.viewAllWrapper { width:40px; height:var(--thumb-size); position:relative; display:flex; align-items:center; justify-content:center; }
.viewAllBtn { position:absolute; left:50%; top:0; transform:translateX(-50%); background:transparent; border:none; padding:0; width:72px; height:var(--thumb-size); display:flex; align-items:center; justify-content:center; cursor:pointer; box-sizing:border-box; z-index:2000; }
.viewAllInner { width:40px; height:100%; background:transparent; display:flex; align-items:center; justify-content:center; border-radius:8px; }
.viewAllBtn .icon { color:#fff; position:relative; left:-4px; }
.viewAllBtn:focus-visible { outline:2px solid #fff; outline-offset:2px; }
.viewAllBtn:hover .viewAllInner { opacity:0.85; }
.viewAllBtn:active .viewAllInner { opacity:0.7; }
.end-space { flex:1 1 auto; display:flex; align-items:center; justify-content:center; position:relative; padding-right:calc(var(--gap)); padding-left:calc(var(--gap)); }
.hidden-file-input { position:absolute; width:1px; height:1px; opacity:0; pointer-events:none; }
/* 移除响应式代码 - 只支持移动端，直接应用移动端样式 */
.thumb-bar { 
  --thumb-size:69px; 
  --thumb-radius:12px; 
  --gap:5px; 
  --plus-size:64px; 
  --gutter:64px; 
} 
.sel-mark { 
  width:18px; 
  height:18px; 
  font-size:12px; 
} 
.viewAllWrapper { 
  width:36px; 
} 
.viewAllBtn { 
  width:64px; 
} 
.viewAllInner { 
  width:36px; 
} 
.viewAllBtn .icon { 
  width:32px; 
  height:32px; 
} 
.plus-btn { 
  font-size:calc(var(--plus-size)*0.7); 
}
</style>
