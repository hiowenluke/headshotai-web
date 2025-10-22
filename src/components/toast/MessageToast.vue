<template>
  <teleport to="body">
    <transition-group name="toast-fade" tag="div" class="toast-container" :style="containerStyle">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast"
        :class="t.type"
        :style="t.style"
      >
        <span class="msg">{{ t.message }}</span>
      </div>
    </transition-group>
  </teleport>
</template>
<script setup lang="ts">
import { reactive, ref, computed } from 'vue';

interface ToastItem { 
  id: number; 
  message: string; 
  type: 'info'|'success'|'error'|'warning'; 
  ttl: number; 
  style?: Record<string,string>;
}
const toasts = reactive<ToastItem[]>([]);
let seed = 1;
// 位置模式: top 或 bottom
const positionMode = ref<'top'|'bottom'>('top');
// 与对应边缘的偏移距离 (字符串, 例如 '20vh' / '40px')
const offset = ref('20vh');

const containerStyle = computed(() => {
  return positionMode.value === 'top'
    ? { top: offset.value }
    : { bottom: offset.value };
});

function add(message: string, type: ToastItem['type']='info', ttl=3000) {
  const id = seed++;
  // 根据当前位置决定进入/离场方向
  const enterTranslate = positionMode.value === 'top' ? '-24px' : '24px';
  const leaveTranslate = positionMode.value === 'top' ? '-110%' : '110%';
  const item: ToastItem = {
    id, message, type, ttl,
    style: {
      '--enter-translate': enterTranslate,
      '--leave-translate': leaveTranslate
    }
  };
  toasts.push(item);
  setTimeout(() => {
    const idx = toasts.findIndex(t=>t.id===id);
    if (idx>=0) toasts.splice(idx,1);
  }, ttl);
}

// Global event listener
window.addEventListener('app:toast', (e: any) => {
  const detail = e?.detail || {};
  if (!detail.message) return;
  // 兼容旧: bottomDistance -> 设置 bottom 模式
  if (detail.bottomDistance !== undefined && detail.bottomDistance !== null) {
    positionMode.value = 'bottom';
    if (typeof detail.bottomDistance === 'number') offset.value = detail.bottomDistance + 'px';
    else if (typeof detail.bottomDistance === 'string' && detail.bottomDistance.trim()) offset.value = detail.bottomDistance.trim();
  }
  // 新: topDistance 指定 top 模式
  if (detail.topDistance !== undefined && detail.topDistance !== null) {
    positionMode.value = 'top';
    if (typeof detail.topDistance === 'number') offset.value = detail.topDistance + 'px';
    else if (typeof detail.topDistance === 'string' && detail.topDistance.trim()) offset.value = detail.topDistance.trim();
  }
  // 通用: y / yPosition / verticalPosition: 'top' | 'bottom'
  const yKey = detail.y ?? detail.yPosition ?? detail.verticalPosition;
  if (yKey === 'top' || yKey === 'bottom') {
    positionMode.value = yKey;
    // 若还提供 offset / distance 则更新
    if (detail.offset != null) {
      if (typeof detail.offset === 'number') offset.value = detail.offset + 'px';
      else if (typeof detail.offset === 'string' && detail.offset.trim()) offset.value = detail.offset.trim();
    } else if (detail.distance != null) {
      if (typeof detail.distance === 'number') offset.value = detail.distance + 'px';
      else if (typeof detail.distance === 'string' && detail.distance.trim()) offset.value = detail.distance.trim();
    }
  }
  add(detail.message, detail.type||'info', detail.ttl!=null ? detail.ttl : 3000);
});
</script>
<style scoped>
.toast-container {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20000 !important;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 80%;
  max-width: 880px; /* 大屏限制 */
  pointer-events: none;
}
.toast {
  width: 100%;
  font-size: 16px; 
  padding: 16px 20px; 
  /* 圆角减少 10%: 18px -> 16px */
  border-radius: 16px;
  /* 默认背景（success） */
  background: rgba(20,110,60,0.9);
  color: #fff;
  line-height: 1.5;
  font-weight: 600;
  text-align: center;
  /* 添加 1px 白色边框（轻微半透明以融入背景） */
  border: 1px solid rgba(255,255,255,0.9);
  box-shadow:
    0 30px 140px -6px rgba(0,0,0,0.97),
    0 18px 80px -6px rgba(0,0,0,0.88),
    0 6px 30px -2px rgba(0,0,0,0.80),
    0 0 0 1px rgba(255, 255, 255, 0.38),
    0 0 0 0.5px rgba(255,255,255,0.14) inset;
  position: relative;
  overflow: hidden;
  pointer-events: auto;
}

/* 不同类型的背景色 */
.toast.error {
  background: rgba(177, 56, 45, 0.92);
}

.toast.warning {
  background: rgba(175, 102, 0, 0.92);
}

.toast.info {
  background: rgba(252, 249, 202, 0.92);
  color: #000;
}

/* 细微色调区分不同类型：采用半透明渐变覆盖，不破坏毛玻璃效果 */
.toast.success::before,
.toast.error::before,
.toast.info::before,
.toast.warning::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: overlay;
  opacity: .65;
}
.toast.success::before { background: linear-gradient(135deg, rgba(34,175,96,0.22), rgba(22,132,66,0.16)); }
.toast.error::before { background: linear-gradient(135deg, rgba(219,68,55,0.22), rgba(174,35,39,0.16)); }
.toast.info::before { background: linear-gradient(135deg, rgba(70,125,205,0.22), rgba(44,84,145,0.16)); }
.toast.warning::before { background: linear-gradient(135deg, rgba(255,149,0,0.28), rgba(255,120,0,0.20)); }
.toast .msg { position: relative; z-index: 1; }

.toast-fade-enter-active,
.toast-fade-leave-active { transition: all .34s cubic-bezier(.4,.14,.3,1); }
.toast-fade-enter-from { opacity:0; transform: translateY(var(--enter-translate,24px)); }
/* 离场：根据位置向上或向下滑出 (由每个 toast 的 CSS 变量控制) */
.toast-fade-leave-to { opacity:0; transform: translateY(var(--leave-translate,110%)); }

/* 移动端样式 */
.toast-container { 
  width: 88%; 
}
</style>
