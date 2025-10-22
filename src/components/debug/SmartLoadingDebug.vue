<template>
  <div v-if="showDebug" class="smart-loading-debug">
    <div class="debug-header">
      <h3>Smart Loading Debug</h3>
      <button @click="toggleDebug" class="close-btn">×</button>
    </div>
    
    <div class="debug-content">
      <!-- 网络状态 -->
      <div class="debug-section">
        <h4>Network Status</h4>
        <div class="status-item">
          <span>Speed Detected:</span>
          <span :class="config.networkSpeedDetected ? 'status-yes' : 'status-no'">
            {{ config.networkSpeedDetected ? 'Yes' : 'No' }}
          </span>
        </div>
        <div class="status-item">
          <span>Network Type:</span>
          <span :class="config.isSlowNetwork ? 'status-slow' : 'status-fast'">
            {{ config.networkSpeedDetected ? (config.isSlowNetwork ? 'Slow' : 'Fast') : 'Unknown' }}
          </span>
        </div>
        <div class="status-item">
          <span>Detection Time:</span>
          <span>{{ detectionTime }}ms</span>
        </div>
      </div>
      
      <!-- 加载配置 -->
      <div class="debug-section">
        <h4>Loading Config</h4>
        <div class="status-item">
          <span>Cards Per Screen:</span>
          <span>{{ config.cardsPerScreen }}</span>
        </div>
        <div class="status-item">
          <span>Speed Threshold:</span>
          <span>{{ config.networkSpeedThreshold }}ms</span>
        </div>
        <div class="status-item">
          <span>Slow Network Screens:</span>
          <span>{{ config.slowNetwork.screensPerLoad }}</span>
        </div>
        <div class="status-item">
          <span>Fast Network Screens:</span>
          <span>{{ config.fastNetwork.screensPerLoad }}</span>
        </div>
      </div>
      
      <!-- 菜单状态 -->
      <div class="debug-section">
        <h4>Menu Status</h4>
        <div class="status-item">
          <span>Current Category:</span>
          <span>{{ menuState.currentMenuCategory }}</span>
        </div>
        <div class="status-item">
          <span>Is First Menu:</span>
          <span :class="menuState.isFirstMenu ? 'status-yes' : 'status-no'">
            {{ menuState.isFirstMenu ? 'Yes' : 'No' }}
          </span>
        </div>
        <div class="status-item">
          <span>Switched Menus:</span>
          <span>{{ Array.from(menuState.switchedMenus).join(', ') }}</span>
        </div>
      </div>
      
      <!-- 控制按钮 -->
      <div class="debug-section">
        <h4>Controls</h4>
        <button @click="resetNetworkDetection" class="debug-btn">
          Reset Network Detection
        </button>
        <button @click="simulateSlowNetwork" class="debug-btn">
          Simulate Slow Network
        </button>
        <button @click="simulateFastNetwork" class="debug-btn">
          Simulate Fast Network
        </button>
      </div>
      
      <!-- 事件日志 -->
      <div class="debug-section">
        <h4>Event Log</h4>
        <div class="event-log">
          <div v-for="(event, index) in eventLog" :key="index" class="log-entry">
            <span class="log-time">{{ event.time }}</span>
            <span class="log-type">{{ event.type }}</span>
            <span class="log-message">{{ event.message }}</span>
          </div>
        </div>
        <button @click="clearLog" class="debug-btn">Clear Log</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { getSmartLoadingConfig } from '@/utils/smartLoading';

const showDebug = ref(false);
const smartLoading = getSmartLoadingConfig();
const config = computed(() => smartLoading.config);
const menuState = computed(() => smartLoading.menuSwitchState);

const eventLog = ref<Array<{ time: string; type: string; message: string }>>([]);
const detectionTime = ref(0);

// 添加日志条目
const addLogEntry = (type: string, message: string) => {
  const time = new Date().toLocaleTimeString();
  eventLog.value.unshift({ time, type, message });
  
  // 限制日志条目数量
  if (eventLog.value.length > 50) {
    eventLog.value = eventLog.value.slice(0, 50);
  }
};

// 事件监听器
const handleNetworkSpeedDetected = (event: any) => {
  const { isSlowNetwork, loadTime, category } = event.detail;
  detectionTime.value = loadTime;
  addLogEntry('NETWORK', `Speed detected: ${isSlowNetwork ? 'SLOW' : 'FAST'} (${loadTime}ms) for ${category}`);
};

const handleMenuSwitched = (event: any) => {
  const { category, isFirst } = event.detail;
  addLogEntry('MENU', `Switched to ${category} (first: ${isFirst})`);
};

const handleAutoLoadOtherMenus = (event: any) => {
  const { excludeCategory } = event.detail;
  addLogEntry('LOAD', `Auto-loading other menus (excluding: ${excludeCategory})`);
};

// 控制函数
const toggleDebug = () => {
  showDebug.value = !showDebug.value;
};

const resetNetworkDetection = () => {
  smartLoading.resetNetworkDetection();
  detectionTime.value = 0;
  addLogEntry('CONTROL', 'Network detection reset');
};

const simulateSlowNetwork = () => {
  smartLoading.updateConfig({
    networkSpeedDetected: true,
    isSlowNetwork: true
  });
  addLogEntry('CONTROL', 'Simulated slow network');
};

const simulateFastNetwork = () => {
  smartLoading.updateConfig({
    networkSpeedDetected: true,
    isSlowNetwork: false
  });
  addLogEntry('CONTROL', 'Simulated fast network');
};

const clearLog = () => {
  eventLog.value = [];
};

onMounted(() => {
  // 监听全局事件
  window.addEventListener('smart-loading-debug-toggle', toggleDebug);
  window.addEventListener('network-speed-detected', handleNetworkSpeedDetected);
  window.addEventListener('menu-switched', handleMenuSwitched);
  window.addEventListener('auto-load-other-menus', handleAutoLoadOtherMenus);
  
  addLogEntry('SYSTEM', 'Smart Loading Debug initialized');
});

onBeforeUnmount(() => {
  window.removeEventListener('smart-loading-debug-toggle', toggleDebug);
  window.removeEventListener('network-speed-detected', handleNetworkSpeedDetected);
  window.removeEventListener('menu-switched', handleMenuSwitched);
  window.removeEventListener('auto-load-other-menus', handleAutoLoadOtherMenus);
});

// 暴露给全局
defineExpose({
  toggleDebug
});
</script>

<style scoped>
.smart-loading-debug {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 350px;
  max-height: 80vh;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  z-index: 10000;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.debug-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.debug-content {
  max-height: calc(80vh - 50px);
  overflow-y: auto;
  padding: 15px;
}

.debug-section {
  margin-bottom: 20px;
}

.debug-section h4 {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #4CAF50;
  border-bottom: 1px solid rgba(76, 175, 80, 0.3);
  padding-bottom: 5px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  padding: 2px 0;
}

.status-yes {
  color: #4CAF50;
  font-weight: bold;
}

.status-no {
  color: #f44336;
  font-weight: bold;
}

.status-slow {
  color: #ff9800;
  font-weight: bold;
}

.status-fast {
  color: #4CAF50;
  font-weight: bold;
}

.debug-btn {
  background: #2196F3;
  color: white;
  border: none;
  padding: 5px 10px;
  margin: 2px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
}

.debug-btn:hover {
  background: #1976D2;
}

.event-log {
  max-height: 200px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 5px;
  margin-bottom: 10px;
}

.log-entry {
  display: flex;
  gap: 8px;
  margin-bottom: 2px;
  font-size: 10px;
}

.log-time {
  color: #9E9E9E;
  min-width: 60px;
}

.log-type {
  color: #2196F3;
  min-width: 50px;
  font-weight: bold;
}

.log-message {
  color: white;
  flex: 1;
}
</style>