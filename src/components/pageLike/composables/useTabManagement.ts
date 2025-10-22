// Tab 管理组合式函数
// 处理 Tab 切换、持久化和状态管理

import { ref, computed, watch } from 'vue';
import type { TabItem } from '@/types/generator';

export function useTabManagement(props: any, emit: any) {
  // Tab 状态
  const internalTab = ref<string>('');
  const visitedTabs = ref<Set<string>>(new Set());

  // 计算属性
  const tabs = computed(() => props.tabs || []);
  const currentTab = computed(() => props.modelValue || internalTab.value);
  
  // 计算最终的标题
  const finalTitle = computed(() => props.pageTitle || props.modalTitle || '');

  // Title 类型计算
  const computedTitleType = computed(() => {
    if (props.titleType && props.titleType !== 'auto') {
      return props.titleType;
    }
    
    if (!props.tabs || props.tabs.length === 0) {
      return 'simple';
    }
    
    const hasIconTabs = props.tabs.some((t: TabItem) => !!t.icon);
    return hasIconTabs ? 'icon-tabs' : 'text-tabs';
  });

  // 为 TextTabsTitle 创建双向绑定的计算属性
  const TextTabsTitleValue = computed({
    get: () => currentTab.value,
    set: (value) => {
      internalTab.value = value;
      visitedTabs.value.add(value);
      emit('update:modelValue', value);
      
      // 持久化存储
      if (props.enableTabPersistence && props.modalType) {
        try {
          const storageKey = `modal_tab_state_${props.modalType}`;
          localStorage.setItem(storageKey, value);
        } catch (error) {
          console.warn(`[${props.modalType}] Failed to save tab state:`, error);
        }
      }
    }
  });

  // 初始化第一个 Tab
  function initFirstTab() {
    if (!tabs.value.length) return;
    
    const availableTabKeys = tabs.value.map((t: TabItem) => t.key);
    let targetTab = '';

    // 检查是否需要重置到特定 Tab
    let shouldResetTo1P = false;
    if (props.modalType === 'GeneratorModal') {
      try {
        const resetFlag = localStorage.getItem('generator_reset_to_1p');
        if (resetFlag === '1') {
          shouldResetTo1P = true;
          localStorage.removeItem('generator_reset_to_1p');
        }
      } catch (error) {
        console.warn(`[${props.modalType}] Failed to check reset flag:`, error);
      }
    }
    
    if (shouldResetTo1P && availableTabKeys.includes('1P')) {
      targetTab = '1P';
    } else if (props.enableTabPersistence && props.modalType) {
      // 从 localStorage 读取
      try {
        const storageKey = `modal_tab_state_${props.modalType}`;
        const saved = localStorage.getItem(storageKey);
        
        if (saved && availableTabKeys.includes(saved)) {
          targetTab = saved;
        } else {
          targetTab = availableTabKeys[0] || '';
        }
      } catch (error) {
        targetTab = availableTabKeys[0] || '';
      }
    } else {
      targetTab = availableTabKeys[0] || '';
    }
    
    // 更新状态
    if (props.enableTabPersistence && props.modalType) {
      if (targetTab !== currentTab.value) {
        internalTab.value = targetTab;
        visitedTabs.value.add(targetTab);
        emit('update:modelValue', targetTab);
      } else {
        visitedTabs.value.add(targetTab);
      }
      
      // 确保 localStorage 状态最新
      try {
        const storageKey = `modal_tab_state_${props.modalType}`;
        localStorage.setItem(storageKey, targetTab);
      } catch (error) {
        // 忽略错误
      }
      
      // 触发 resize 事件
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    } else {
      if (!currentTab.value || !availableTabKeys.includes(currentTab.value)) {
        internalTab.value = targetTab;
        visitedTabs.value.add(targetTab);
        emit('update:modelValue', targetTab);
      } else {
        visitedTabs.value.add(currentTab.value);
      }
    }
  }

  // 切换 Tab
  function switchTab(key: string) {
    internalTab.value = key;
    visitedTabs.value.add(key);
    emit('update:modelValue', key);
    
    // 持久化存储
    if (props.enableTabPersistence && props.modalType) {
      try {
        const storageKey = `modal_tab_state_${props.modalType}`;
        localStorage.setItem(storageKey, key);
      } catch (error) {
        console.warn(`[${props.modalType}] Failed to save tab state:`, error);
      }
    }
    
    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('tab-changed', {
      detail: {
        modalType: props.modalType,
        activeTab: key
      }
    }));
  }

  // 监听 currentTab 变化
  watch(() => currentTab.value, (newTab) => {
    if (newTab && !visitedTabs.value.has(newTab)) {
      visitedTabs.value.add(newTab);
    }
  }, { immediate: true });

  return {
    // 状态
    internalTab,
    visitedTabs,
    
    // 计算属性
    tabs,
    currentTab,
    finalTitle,
    computedTitleType,
    TextTabsTitleValue,
    
    // 方法
    initFirstTab,
    switchTab
  };
}