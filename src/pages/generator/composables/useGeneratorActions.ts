import { computed, type Ref } from 'vue';
import { useAuthRequiredAction } from '@/composables/useAuthRequiredAction';
import type { PlanKey } from './useGeneratorPlans';

export function useGeneratorActions(
  selectedPlan: Ref<string>,
  hasSelectedFaces: Ref<boolean>,
  currentUploadDemos: Ref<string[]>,
  generator1PRef: Ref<any>,
  generator20PRef: Ref<any>
) {
  // 显示提示消息
  const showToast = (message: string, type: 'info' | 'warning' = 'warning') => {
    window.dispatchEvent(
      new CustomEvent('app:toast', {
        detail: {
          message,
          type,
          ttl: 3000,
          y: 'top',
          offset: '20vh'
        }
      })
    );
  };

  // 实际执行生成的函数
  const performGenerate = () => {
    const currentTab = selectedPlan.value;

    // 根据当前激活的标签页调用对应组件的生成方法
    if (currentTab === '1P' && generator1PRef.value) {
      generator1PRef.value.handleGenerate?.();
    }

    if (currentTab === '20P' && generator20PRef.value) {
      generator20PRef.value.handleGenerate?.();
    }

    // TODO: 后续添加 40P 和 80P 的处理逻辑
  };

  // 使用 useAuthRequiredAction 确保登录后执行生成
  const { ensureAuth: ensureGenerateAuth } = useAuthRequiredAction(
    'generate-photos',
    performGenerate,
    { message: 'Please sign in to generate photos' }
  );

  // 处理生成按钮点击事件
  const handleGenerate = () => {
    // 检查是否有选中的 faces
    if (!hasSelectedFaces.value) {
      const hasDemos = currentUploadDemos.value.length > 0;
      const message = hasDemos
        ? 'Please upload your face photos or tap a demo face first'
        : 'Please upload your face photos first';
      showToast(message);
      return;
    }

    // 确保用户已登录，如果未登录则跳转到登录页
    ensureGenerateAuth();
  };

  // 处理最近任务按钮点击
  const handleRecentTasks = () => {
    try {
      window.dispatchEvent(new CustomEvent('recent-tasks'));
    } catch {
      /* ignore */
    }
  };

  return {
    handleGenerate,
    handleRecentTasks,
    showToast
  };
}
