import { computed } from 'vue';
import { authState } from '@/state/authState';

/**
 * 用户信息管理组合式函数
 * 处理用户头像、姓名、金币等信息的显示和格式化
 */
export function useUserInfoManagement() {
    // 登录状态
    const isLoggedIn = computed(() => authState.isLoggedIn);
    
    // 检查是否应该显示用户信息：已登录 OR localStorage 中有用户信息
    const shouldShowUserInfo = computed(() => {
        if (isLoggedIn.value) return true;
        
        try {
            const userInfo = localStorage.getItem('user_info');
            return !!userInfo;
        } catch {
            return false;
        }
    });
    
    // 获取显示用的用户数据（优先 authState，其次 localStorage）
    const displayUserName = computed(() => {
        if (authState.user?.name) return authState.user.name;
        
        try {
            const userInfo = localStorage.getItem('user_info');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                return parsed.name || 'Account';
            }
        } catch { /* ignore */ }
        return 'Account';
    });
    
    const displayUserPicture = computed(() => {
        if (authState.user?.picture) return authState.user.picture;
        
        try {
            const userInfo = localStorage.getItem('user_info');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                return parsed.picture || '';
            }
        } catch { /* ignore */ }
        return '';
    });
    
    // 头像 URL 处理（解决跨域和缓存问题）
    const processedUserPicture = computed(() => {
        const originalUrl = displayUserPicture.value;
        if (!originalUrl) return '';
        
        // 如果是 Google 头像 URL，确保使用 HTTPS 并添加参数防止缓存问题
        if (originalUrl.includes('googleusercontent.com')) {
            const url = new URL(originalUrl.replace('http://', 'https://'));
            // 添加一些参数来确保图片能正确加载
            url.searchParams.set('sz', '80'); // 设置大小
            url.searchParams.set('c', 'photo'); // 确保是照片
            return url.toString();
        }
        
        // 其他情况直接返回原 URL
        return originalUrl;
    });
    
    // 数字格式化函数：添加千位分隔符
    const formatNumber = (num: number): string => {
        return num.toLocaleString('en-US');
    };
    
    // 获取用户金币数量
    const displayCoinBalance = computed(() => {
        let balance = 0;
        
        if (authState.user?.coin_balance !== undefined) {
            balance = authState.user.coin_balance;
        } else {
            try {
                const userInfo = localStorage.getItem('user_info');
                if (userInfo) {
                    const parsed = JSON.parse(userInfo);
                    balance = parsed.coin_balance || 0;
                }
            } catch { /* ignore */ }
        }
        
        return formatNumber(balance);
    });
    
    // 头像错误处理
    const onAvatarError = (event: Event) => {
        event;
        // 头像加载失败，可以在这里添加重试逻辑或者设置一个默认图片
    };
    
    const onAvatarLoad = () => {
        // 头像加载成功
    };
    
    return {
        // 状态
        isLoggedIn,
        shouldShowUserInfo,
        displayUserName,
        displayUserPicture,
        processedUserPicture,
        displayCoinBalance,
        
        // 方法
        formatNumber,
        onAvatarError,
        onAvatarLoad
    };
}