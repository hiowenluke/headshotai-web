<template>
  <div v-if="retryButtonList.length" class="prefetch-hints">
    <div class="hint-title">
      <template v-if="!debugForce || skippedList.length">
        Some images failed to prefetch.
      </template>
      <template v-else>
        (DEBUG) Forced manual reload button:
      </template>
    </div>
    <div class="hint-chips">
      <button
        v-for="c in retryButtonList"
        :key="c"
        class="hint-chip"
        @click="$emit('reload', c)">
        Reload
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'RetryButton',
  props: {
    debugForce: { type: Boolean, default: false },
    skippedList: { type: Array as () => string[], default: () => [] },
    menus: { type: Array as () => string[], required: true },
    activeIndex: { type: Number, required: true },
  },
  emits: ['reload'],
  setup(props) {
    // Derive the list to show: if debug is forced and there is no real skipped list, show the current active category as placeholder.
    const retryButtonList = computed(() => {
      if (props.debugForce) {
        if (props.skippedList.length) return props.skippedList;
        return [props.menus[props.activeIndex]];
      }
      return props.skippedList;
    });
    return { retryButtonList };
  },
});
</script>

<style scoped>
.prefetch-hints { padding:12px 12px 32px 12px; text-align:center; }
.hint-title { font-size:16px; color:#98a2b3; margin-bottom:6px; }
.hint-chips { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; }
/* Enlarge button size ~30% */
.hint-chip { 
  background:rgba(53,61,70,0.55); 
  color:#fff; 
  border:1px solid rgba(126,139,153,0.75); 
  padding:8px 16px; 
  border-radius:999px; 
  font-size:17px; 
  cursor:pointer; 
  transition:background .25s, border-color .25s; 
}
.hint-chip:hover { background:rgba(70,78,88,0.75); border-color:rgba(160,175,190,0.9); }
</style>