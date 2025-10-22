<template>
  <!-- 顶部主导航条（水平可滚动 + 手势左右切换）
       说明：
       1. 使用 ion-toolbar 以继承 Ionic 的平台适配与安全区处理。
       2. .menu-scroll 为横向滚动容器（隐藏原生滚动条，支持触摸滑动）。
       3. 支持“点击当前激活项”触发 scroll-to-top 事件，用于页面快速回到顶部。
       4. 支持横向拖拽手势切换（>40px 位移触发翻页），与垂直滚动方向分离（方向锁）。
  -->
  <ion-toolbar class="nav-bar">
    <div
      class="menu-scroll"
      :class="{ 'android-mode': isAndroid }"
      :style="menuScrollStyle"
      ref="menuScroll"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div class="menu-inner" :class="{ 'android-mode': isAndroid }" :style="menuInnerStyle">
        <MainItem
          v-for="(m, i) in menus"
          :key="i"
          :text="m"
          :is-active="i === activeIndex"
          :has-sub-menu="hasSubMenus?.[i] || false"
          :index="i"
          @click="select"
        />
      </div>
    </div>
  </ion-toolbar>
</template>

<script setup lang="ts">
import { IonToolbar } from '@ionic/vue';
import { ref, watch, computed } from 'vue';
import MainItem from './MainItem.vue';

// 组件属性: 菜单名称数组 + 当前激活索引 + 可选的“有子菜单”标志数组
const props = defineProps<{ 
  menus: string[]; 
  activeIndex: number;
  hasSubMenus?: boolean[]; // 标识每个菜单是否有子菜单（用于 UI 显示图标/标记）
}>();

// 组件事件: select(切换菜单) / scroll-to-top(点击当前激活菜单触发滚动到顶部)
const emit = defineEmits<{ 
  (e:'select', index:number):void;
  (e:'scroll-to-top'):void;
}>();

// 横向滚动容器引用
const menuScroll = ref<HTMLElement|null>(null);

// Android 检测
const isAndroid = computed(() => {
  return /android/i.test(navigator.userAgent.toLowerCase());
});

// Inline critical layout to avoid first-paint vertical stacking before CSS loads
const innerGap = computed(() => (isAndroid.value ? '7px' : '10px'));
const menuInnerStyle = computed(() => ({
  display: 'flex',
  gap: innerGap.value,
  alignItems: 'center',
  flexWrap: 'nowrap'
} as const));
const menuScrollStyle = computed(() => ({
  display: 'flex',
  gap: innerGap.value,
  alignItems: 'center',
  height: '44px',
  overflowX: 'auto',
  overflowY: 'hidden'
} as const));

// 选择菜单项：点击已激活项 => 触发滚动顶部；否则触发切换事件
function select(i: number){ 
  if (i === props.activeIndex) {
    emit('scroll-to-top');
  } else {
    emit('select', i); 
  }
  ensureVisible(i); 
}

// 确保第 i 个菜单项可见：若超出当前可视窗口则平滑滚动
function ensureVisible(i:number){
  try {
    const el = menuScroll.value; if(!el) return;
    const items = el.querySelectorAll('.menu-item');
    const item = items[i] as HTMLElement | undefined; if(!item) return;
    const itemLeft = item.offsetLeft; 
    const itemRight = itemLeft + item.offsetWidth;
    const viewLeft = el.scrollLeft; 
    const viewRight = viewLeft + el.clientWidth;
    if (itemLeft < viewLeft || itemRight > viewRight) {
      const revealPx = 24; // 轻微展示后续空间
      let left = Math.max(0, itemLeft - 12);
      left = Math.min(left, Math.max(0, itemRight - el.clientWidth + revealPx));
      el.scrollTo({ left, behavior: 'smooth' });
    }
  } catch {/* 忽略运行时异常 */}
}

// 当外部 activeIndex 改变时，保持其在可视区域内
watch(() => props.activeIndex, (i)=> ensureVisible(i));

// -----------------------------
// 触摸手势：横向拖拽切换菜单
// -----------------------------
const touchStartX = ref<number|null>(null);
const touchStartY = ref<number|null>(null);
const gestureLock = ref<'idle'|'horizontal'|'vertical'>('idle');
const dragDx = ref(0);

function onTouchStart(ev:TouchEvent){
  touchStartX.value = ev.touches[0].clientX;
  touchStartY.value = ev.touches[0].clientY;
  dragDx.value = 0; 
  gestureLock.value='idle';
}

function onTouchMove(ev:TouchEvent){
  if(touchStartX.value==null||touchStartY.value==null) return;
  const cx = ev.touches[0].clientX; 
  const cy = ev.touches[0].clientY;
  const dx = cx - touchStartX.value; 
  const dy = cy - touchStartY.value;
  if(gestureLock.value==='idle'){
    const absDx=Math.abs(dx), absDy=Math.abs(dy);
    if(Math.max(absDx,absDy)>10) {
      gestureLock.value = absDx>absDy ? 'horizontal' : 'vertical';
    }
  }
  if(gestureLock.value==='horizontal') { 
    ev.preventDefault(); // 阻止页面/父容器滚动，获得顺滑横向手势
    dragDx.value = dx; 
  }
}

function onTouchEnd(){
  if(touchStartX.value==null) return;
  const dx = dragDx.value; 
  const threshold = 40; // 触发切换的位移阈值
  if(gestureLock.value==='horizontal'){
    if(dx < -threshold && props.activeIndex < props.menus.length-1) {
      emit('select', props.activeIndex+1);
    } else if(dx > threshold && props.activeIndex > 0) {
      emit('select', props.activeIndex-1);
    }
  }
  touchStartX.value = touchStartY.value = null; 
  dragDx.value=0; 
  gestureLock.value='idle';
}
</script>

<style scoped>
/* 样式说明：
   1. 去除 ion-toolbar 默认背景 / 阴影，做纯透明悬浮导航条。
   2. .menu-scroll 使用隐藏滚动条。
   3. 小屏下 (<=420px) 缩小左右 padding 与增大间距以适配触摸命中区域。 */

ion-toolbar.nav-bar {
  --background: transparent;
  background: transparent !important;
  --border-width: 0;
  --border-color: transparent;
  border: none !important;
  box-shadow: none !important;
  --box-shadow: none !important;
  --padding-top: 1px;
  --padding-bottom: 1px;
  --min-height: 27px;
  padding: 0;
  margin-top: 0;
}

ion-toolbar.nav-bar::before,
ion-toolbar.nav-bar::after {
  display: none !important;
}

.menu-scroll { 
  display: flex;
  gap: 8px;
  padding: 0 12px 8px;
  overflow-x: auto;
  scrollbar-width: none;
  height: 44px; /* 指定高度，防止切换菜单项时，菜单栏上下抖动 */
}
.menu-scroll::-webkit-scrollbar { display: none; }
.menu-inner { display: flex; gap: 8px; align-items: center; }

/* Android 模式下缩小间距 2px */
.menu-scroll.android-mode { 
  gap: 6px;
}
.menu-inner.android-mode { 
  gap: 6px;
}

/* 移除响应式代码 - 只支持移动端，直接应用移动端样式 */
.menu-scroll { 
  padding-left: 8px; 
  padding-right: 8px; 
}
.menu-inner { 
  gap: 10px; 
}

/* Android 模式下的间距调整 */
.menu-inner.android-mode { 
  gap: 7px;
}


/* .menu-scroll{
  background: blue !important;
} */
</style>
