// 主页偏好设置管理组合式函数
// 处理用户偏好的加载、保存、应用和 Demo 头像管理

import { ref, reactive } from 'vue';
import { fetchDemoFaces } from '@/services/imageService';
import { loadDemoFacesCache, saveDemoFacesCache } from '@/components/uploadPhoto/utils/demoFacesCache';

export function usePreferencesManagement() {
  // 偏好设置相关常量
  const PREF_KEY = 'user_prefs_v1';
  const DEMO_FACE_COUNT = 4;

  // 默认偏好设置
  const defaultPrefs = { 
    gender: 'Female', 
    ethnicity: 'White', 
    age: 'Middle', 
    bodySize: 'M' 
  };

  // 当前偏好设置
  const currentPrefs = reactive({ ...defaultPrefs });

  // Demo 头像状态
  const demoFaces = ref<string[]>([]);

  // 图片预加载函数
  function preloadImages(urls: string[]) {
    urls.forEach(src => {
      try {
        const img = new Image();
        img.src = src;
      } catch {
        // 忽略预加载错误
      }
    });
  }

  // 加载缓存的 Demo 头像
  function loadCachedDemoFaces() {
  const cached = loadDemoFacesCache();
    if (cached.length) {
      demoFaces.value = cached;
      preloadImages(demoFaces.value);
    }
  }

  // 更新 Demo 头像
  async function updateDemoFaces() {
    const gender = currentPrefs.gender || 'Female';
    const ethnicity = currentPrefs.ethnicity || 'White';
    const faces = await fetchDemoFaces(gender, ethnicity, DEMO_FACE_COUNT);
    demoFaces.value = faces;
    preloadImages(faces);
    saveDemoFacesCache(faces);
  }

  // 加载保存的偏好设置
  function loadSavedPreferences() {
    try {
      const saved = localStorage.getItem(PREF_KEY);
      if (saved) {
        Object.assign(currentPrefs, JSON.parse(saved));
      }
    } catch {
      // 忽略偏好设置加载错误
    }
  }

  // 处理偏好设置应用
  const onPrefApplied = async (
    prefs: any, 
    resetAllForPrefs: () => Promise<void>,
    closePreferences: () => void
  ) => {
    Object.assign(currentPrefs, prefs);
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    
    // 关闭偏好设置弹窗
    closePreferences();
    
    // 触发数据重新加载，等待卡片列表加载完成
    await resetAllForPrefs();
  };

  // 设置偏好设置变更事件监听
  function setupPreferencesListener(
    resetAllForPrefs: () => Promise<void>,
    updateDemoFaces?: () => Promise<void>
  ) {
    const handlePrefsApplied = (e: any) => {
      const detail = e?.detail || {};
      Object.assign(currentPrefs, detail);
      
      const differs = Object.keys(defaultPrefs).some(
        k => (detail as any)[k] !== (defaultPrefs as any)[k]
      );
      
      if (differs) {
        resetAllForPrefs();
      } else if (updateDemoFaces) {
        // 只有在提供了 updateDemoFaces 函数时才调用（生成器页面需要，主页不需要）
        updateDemoFaces();
      }
    };

    window.addEventListener('prefs-applied', handlePrefsApplied);
    
    // 返回清理函数
    return () => {
      window.removeEventListener('prefs-applied', handlePrefsApplied);
    };
  }

  return {
    // 状态
    currentPrefs,
    demoFaces,
    defaultPrefs,

    // 方法
    loadCachedDemoFaces,
    updateDemoFaces,
    loadSavedPreferences,
    onPrefApplied,
    setupPreferencesListener,
    preloadImages
  };
}