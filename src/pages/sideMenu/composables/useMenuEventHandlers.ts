import { EVENT_MAP, type AppPage } from '../data/menuData';

/**
 * 菜单事件处理管理组合式函数
 * 处理菜单项点击、导航等事件
 */
export function useMenuEventHandlers(
    selectedIndex: any,
    showDemo: any,
    closeInternal: () => void,
    isLoggedIn: any
) {
    
    // 处理菜单项点击
    const handleItemClick = (p: AppPage, idx: number) => {
        // 邮件链接直接跳转
        if (p.url.startsWith('mailto:')) { 
            window.location.href = p.url; 
            closeInternal(); 
            return; 
        }
        
        // 调试功能
        if (p.title === 'Debug') { 
            try { 
                window.dispatchEvent(new Event('open-debug-modal')); 
            } catch { 
                /* ignore */ 
            } 
            closeInternal(); 
            return; 
        }
        
        // PageLikeModal 演示
        if (p.title === 'PageLikeModal Demo') { 
            showDemo.value = true; 
            selectedIndex.value = idx;
            setTimeout(() => closeInternal(), 60);
            return; 
        }
        
        // 各个独立页面事件分发
        const eventMap = EVENT_MAP;
        
        if (eventMap[p.title]) {
            try { 
                window.dispatchEvent(new Event(eventMap[p.title])); 
            } catch { 
                /* ignore */ 
            }
            selectedIndex.value = idx;
            setTimeout(() => closeInternal(), 60);
            return;
        }
        
        // 认证相关处理
        if (p.url === '/auth') {
            if (isLoggedIn.value) {
                // 打开用户中心页面（新方式）
                try { 
                    window.dispatchEvent(new Event('open-user-center')); 
                } catch { 
                    /* ignore */ 
                }
                selectedIndex.value = idx;
                setTimeout(() => closeInternal(), 60);
                return;
            }
            
            try { 
                window.dispatchEvent(new Event('open-auth')); 
            } catch { 
                /* ignore */ 
            }
            selectedIndex.value = idx;
            setTimeout(() => closeInternal(), 60); // 打开登录后自动关闭菜单
            return;
        }
    };
    
    // 处理购买金币
    const handleBuyCoins = () => {
        // 打开购买金币页面
        try { 
            window.dispatchEvent(new Event('open-buy-coins')); 
        } catch { 
            /* ignore */ 
        }
        setTimeout(() => closeInternal(), 60);
    };
    
    // 处理用户信息点击
    const handleUserInfoClick = () => {
        if (isLoggedIn.value) {
            // 打开用户中心页面
            try { 
                window.dispatchEvent(new Event('open-user-center')); 
            } catch { 
                /* ignore */ 
            }
            selectedIndex.value = 0;
            setTimeout(() => closeInternal(), 60);
            return;
        }
        
        // 未登录则打开登录页面
        try { 
            window.dispatchEvent(new Event('open-auth')); 
        } catch { 
            /* ignore */ 
        }
        selectedIndex.value = 0;
        setTimeout(() => closeInternal(), 60);
    };
    
    return {
        // 事件处理方法
        handleItemClick,
        handleBuyCoins,
        handleUserInfoClick
    };
}