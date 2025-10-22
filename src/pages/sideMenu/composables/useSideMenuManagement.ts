import { watch } from 'vue';
import { useUserInfoManagement } from './useUserInfoManagement';
import { useMenuDataManagement } from './useMenuDataManagement';
import { useMenuAnimationGestures } from './useMenuAnimationGestures';
import { useMenuEventHandlers } from './useMenuEventHandlers';

/**
 * 侧边菜单主管理组合式函数
 * 整合所有子功能模块
 */
export function useSideMenuManagement(
    props: { open: boolean },
    emit: (event: 'close') => void
) {
    // 用户信息管理
    const userInfoManagement = useUserInfoManagement();

    // 菜单数据管理
    const menuDataManagement = useMenuDataManagement();

    // 动画和手势管理（现在包含弹性滚动）
    const animationGesturesManagement = useMenuAnimationGestures(emit);

    // 事件处理管理
    const eventHandlersManagement = useMenuEventHandlers(
        menuDataManagement.selectedIndex,
        menuDataManagement.showDemo,
        animationGesturesManagement.closeInternal,
        userInfoManagement.isLoggedIn
    );

    // 监听外部 open 属性变化
    watch(() => props.open, (v) => {
        if (v) {
            menuDataManagement.refreshSelected();
            animationGesturesManagement.openInternal();
        } else {
            animationGesturesManagement.closeInternal();
        }
    }, { immediate: true });

    return {
        // 用户信息相关
        ...userInfoManagement,

        // 菜单数据相关
        ...menuDataManagement,

        // 动画和手势相关（包含弹性滚动）
        ...animationGesturesManagement,

        // 事件处理相关
        ...eventHandlersManagement
    };
}