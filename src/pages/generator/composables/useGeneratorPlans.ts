import { ref, computed } from 'vue';

export type PlanKey = '1P' | '20P' | '40P' | '80P';

interface Plan {
  value: string;
  label: string;
  hot?: boolean;
}

export function useGeneratorPlans() {
  // 生成计划配置
  const plans: Plan[] = [
    { value: '1P', label: '1P' },
    { value: '20P', label: '20P' },
    { value: '40P', label: '40P' },
    { value: '80P', label: '80P', hot: true }
  ];

  // 当前选中的计划
  const selectedPlan = ref('1P');

  // 将计划转换为标签页格式
  const tabsFromPlans = computed(() =>
    plans.map(plan => ({
      key: plan.value,
      label: plan.label,
      hot: plan.hot
    }))
  );

  const currentPlanKey = computed<PlanKey>(() => selectedPlan.value as PlanKey);

  // 处理标签页切换
  const handleTabChange = (tabKey: string) => {
    selectedPlan.value = tabKey;
  };

  // 热门标签状态管理
  const hotDismissed = ref(false);
  try {
    hotDismissed.value = localStorage.getItem('hotDismissed80P') === '1';
  } catch {
    /* ignore */
  }

  const handleHotClicked = () => {
    hotDismissed.value = true;
    try {
      localStorage.setItem('hotDismissed80P', '1');
    } catch {
      /* ignore */
    }
  };

  return {
    plans,
    selectedPlan,
    tabsFromPlans,
    currentPlanKey,
    handleTabChange,
    hotDismissed,
    handleHotClicked
  };
}
