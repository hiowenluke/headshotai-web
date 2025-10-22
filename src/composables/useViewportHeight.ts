import { ref, onMounted, onUnmounted } from 'vue';

// 全局视口高度管理
let viewportManagerInitialized = false;
const viewportHeight = ref(0);

// 设置移动端视口高度 CSS 变量
const setViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    viewportHeight.value = window.innerHeight;
};

// 初始化视口高度管理（全局只需要初始化一次）
const initViewportManager = () => {
    if (viewportManagerInitialized) return;
    
    setViewportHeight();
    
    const handleResize = () => {
        setViewportHeight();
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    viewportManagerInitialized = true;
    
    // 返回清理函数
    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        viewportManagerInitialized = false;
    };
};

// 组合式函数，用于在组件中使用视口高度管理
export const useViewportHeight = () => {
    onMounted(() => {
        initViewportManager();
    });
    
    onUnmounted(() => {
        // 注意：我们不在这里清理全局监听器，因为其他组件可能还在使用
        // 实际的清理应该在应用卸载时进行
    });
    
    return {
        viewportHeight: viewportHeight.value,
        setViewportHeight
    };
};

// 手动清理（用于应用卸载时）
export const cleanupViewportManager = () => {
    if (viewportManagerInitialized) {
        const handleResize = () => {
            setViewportHeight();
        };
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        viewportManagerInitialized = false;
    }
};
