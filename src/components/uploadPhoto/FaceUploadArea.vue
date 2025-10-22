<template>
  <div class="upload-block" :class="{ 'no-demos': !hasDemos }" ref="rootRef">
    <div class="plus-sign" @click="onPlus">+</div>
    <div class="hint" v-if="hint">{{ hint }}</div>
    <div class="demo-row" v-if="hasDemos">
        <div
            v-for="(d,i) in demos4"
            :key="i"
            class="demo-thumb"
            :class="{ selected: selectedList.includes(d) }"
            @click="handleDemoClick(d)"
        >
            <div class="thumb-inner"><img :src="d" /></div>
            <span class="demo-badge">DEMO</span>
            <span v-if="selectedList.includes(d)" class="sel-mark">✓</span>
        </div>
    </div>
    
    <!-- 简化的文件输入元素 -->
    <input 
      ref="fileInputRef"
      type="file" 
      accept="image/*" 
      multiple 
      style="display: none"
      @change="handleFiles"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthRequiredAction } from '@/composables/useAuthRequiredAction';

interface Props {
  hint: string;
  demos: string[];
  selectedList: string[];
}
const props = withDefaults(defineProps<Props>(), {
  hint: '',
  demos: () => [],
  selectedList: () => [],
});
const emit = defineEmits(['plus', 'filesChange', 'demoToggle', 'demoUse']);

const rootRef = ref<HTMLElement|null>(null);
const fileInputRef = ref<HTMLInputElement|null>(null);
defineExpose({
  rootEl: rootRef,
  openFilePicker: () => ensureUploadAuth()
});

const demos4 = computed(() => props.demos.slice(0,4));
const hasDemos = computed(() => demos4.value.length > 0);

const { ensureAuth: ensureUploadAuth } = useAuthRequiredAction('upload-photos', () => {
  const input = fileInputRef.value;
  if (input) {
    input.click();
  }
}, { message: 'Please sign in before uploading.' });

function onPlus(){
  emit('plus');
}

function handleFiles(e: Event){
  const input = e.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  
  const files = Array.from(input.files);
  emit('filesChange', files);
  input.value = '';
}

function handleDemoClick(demo: string) {
  // 点击demo图片时，只切换选中状态，不更新预览图
  emit('demoToggle', demo);
}
</script>
<style scoped>
.upload-block { width:100%; background:transparent; border:none; border-radius:0; padding:0; text-align:center; position:relative; margin-bottom: 10px;}
.upload-block .plus-sign { position:relative; width: 100%; text-align: center; cursor: pointer;}
.upload-block .hint { position:relative; width: 100%; text-align: center;}
.upload-block .demo-row { position:relative; width: 100%;}
.plus-sign { font-size:71px; line-height:0.7; color:#fff; font-weight:300; padding-bottom:8px;}
.hint { font-size:var(--fs-normal-text); font-weight:500; letter-spacing:0.5px; color:#e5e7ea; }
.demo-row { display:flex; justify-content:center; gap:12px; padding:15px;}
.demo-thumb { position:relative; width:60px; aspect-ratio:1/1; border-radius:10px; overflow:visible; background:transparent; box-shadow:none; cursor:pointer; }
.demo-thumb:active .thumb-inner { transform:scale(.95); }
.demo-thumb .thumb-inner { transition:box-shadow .2s, transform .18s ease; }
.demo-thumb.selected .thumb-inner { box-shadow:none; }
.demo-thumb .sel-mark { position:absolute; top:4px; right:4px; width:20px; height:20px; border-radius:10px; background:#2a78ff; color:#fff; font-size:14px; display:flex; align-items:center; justify-content:center; font-weight:700; box-shadow:0 2px 4px rgba(0,0,0,0.4); }
.thumb-inner { width:100%; height:100%; border-radius:10px; overflow:hidden; background:#222; box-shadow:0 0 0 1px #979797; }
.thumb-inner img { width:100%; height:100%; object-fit:cover; display:block; }
.demo-badge { position:absolute; bottom:0; left:50%; transform:translate(-50%,50%);  color:#FFED80; font-size:12px; font-weight:700; height:19px; padding:0 12px; line-height:1; display:flex; align-items:center; justify-content:center; border-radius:6px; letter-spacing:0.55px; box-sizing:border-box; overflow:visible; }
.demo-badge::before { content:""; position:absolute; inset:0; background:#5F3900; border:1px solid #FFED80; border-radius:6px; transform:scaleX(0.8); transform-origin:center; z-index:-1; }

/* 没有 demo 时的样式调整 */
.upload-block.no-demos {
  width:100%;
  /* padding-top: 20px;
  padding-bottom: 20px; 减少底部内边距 */
}

/* for test only */
/* .plus-sign {background: red;}
.hint {background: blue;}
.demo-row {background: yellow;} */

/* 移除PC支持代码 - 只支持移动端 */
</style>
