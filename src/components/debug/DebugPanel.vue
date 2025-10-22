<template>
  <div v-if="visible" class="debug-panel">
    <div class="debug-header" @click="toggleVisibility" @touchend="toggleVisibility">
      {{ title }} (tap to hide)
    </div>
    <div class="debug-content" @click.stop>
      <div v-for="(info, index) in displayLogs" :key="index" class="debug-line">
        {{ info }}
      </div>
      <div v-if="logs.length === 0" class="debug-empty">
        No debug info yet... (iPhone test)
      </div>
    </div>
  </div>
  <!-- 当隐藏时显示一个小按钮 -->
  <div v-else class="debug-toggle" @click="toggleVisibility" @touchend="toggleVisibility">
    <div class="debug-toggle-text">DEBUG</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  title?: string;
  maxLogs?: number;
  initialVisible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Debug Info',
  maxLogs: 10,
  initialVisible: true
});

const logs = defineModel<string[]>({ default: () => [] });
const visible = ref(props.initialVisible);

// 显示最近的日志
const displayLogs = computed(() => {
  return logs.value.slice(-props.maxLogs);
});

function toggleVisibility(event?: Event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  visible.value = !visible.value;
  // 调试面板可见性切换
}

// 移除未使用的函数 onTouchStart

// 添加日志的方法
function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  logs.value.push(`${timestamp}: ${message}`);
  // 添加日志到面板
}

// 清空日志
function clearLogs() {
  logs.value.length = 0;
}

// 暴露方法给父组件
defineExpose({
  addLog,
  clearLogs,
  show: () => visible.value = true,
  hide: () => visible.value = false,
  toggle: toggleVisibility
});
</script>

<style scoped>
/* 调试面板样式 */
.debug-panel {
  position: fixed;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  width: 300px;
  max-height: 400px;
  background: rgba(0, 0, 0, 0.9);
  color: #00ff00;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 12px;
  border-radius: 8px;
  z-index: 9999;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  /* 确保只有面板本身接收点击事件 */
  pointer-events: auto;
}

.debug-header {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  text-align: center;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  user-select: none;
}

.debug-header:active {
  background: rgba(255, 255, 255, 0.2);
}

.debug-content {
  padding: 8px;
  max-height: 350px;
  overflow-y: auto;
  /* 防止内容区域的点击事件冒泡 */
  pointer-events: auto;
}

.debug-line {
  margin-bottom: 4px;
  word-break: break-all;
  line-height: 1.2;
}

.debug-empty {
  color: #888;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

/* 隐藏时的切换按钮 */
.debug-toggle {
  position: fixed;
  top: 120px; /* 固定像素值，确保在HomeHeader下方 */
  right: 15px;
  width: 70px;
  height: 70px;
  background: #ff4444;
  color: white;
  border-radius: 50%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(255, 68, 68, 0.6);
  border: 3px solid white;
  /* 添加脉冲动画让它更明显 */
  animation: debugPulse 1.5s infinite;
  user-select: none;
  /* 确保只有按钮本身接收点击事件 */
  pointer-events: auto;
}

.debug-toggle-text {
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1px;
  text-align: center;
}

.debug-toggle:active {
  background: #cc3333;
  transform: scale(0.9);
}

/* 脉冲动画 */
@keyframes debugPulse {
  0%, 100% {
    box-shadow: 0 6px 20px rgba(255, 68, 68, 0.6), 0 0 0 0 rgba(255, 255, 255, 0.8);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 6px 20px rgba(255, 68, 68, 0.8), 0 0 0 10px rgba(255, 255, 255, 0);
    transform: scale(1.05);
  }
}

/* 滚动条样式 */
.debug-content::-webkit-scrollbar {
  width: 4px;
}

.debug-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.debug-content::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 0, 0.3);
  border-radius: 2px;
}
</style>