// OptionsCardsArea 主要业务逻辑组合式函数
import { computed, onMounted } from 'vue';
import { useContainerSize } from './useContainerSize';
import { useCheckboxState } from './useCheckboxState';
import { useCardLayout } from './useCardLayout';
import { useObservers } from './useObservers';
import { useEventListeners } from './useEventListeners';

interface CardInfo {
  title: string;
  counter: string | number;
  coverUrl: string;
  popup: string;
  arguments: Record<string, any>;
}

export function useOptionsCardsArea(props: any, emit: any, adaptiveContentRef: any) {
  // 生成实例键
  const resolvedInstanceKey = computed(() => 
    props.instanceKey || `options-cards-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );

  // 使用各个功能模块
  const containerSize = useContainerSize(resolvedInstanceKey.value);
  const checkboxState = useCheckboxState(resolvedInstanceKey.value, computed(() => props.cardsInfos));
  const cardLayout = useCardLayout(containerSize.containerWidth, containerSize.containerHeight);
  const observers = useObservers();

  // 事件监听器（需要在组件内部初始化，因为需要adaptiveContentRef）
  useEventListeners(
    containerSize.updateContainerSize,
    containerSize.updateContainerSizeDelayed,
    adaptiveContentRef
  );

  // 事件处理函数
  const handleOpenPopup = (popup: string, args: Record<string, any>) => {
    emit('openPopup', popup, args);
  };

  const handleToggleCheckbox = (card: CardInfo, checked: boolean) => {
    checkboxState.toggleCheckbox(card, checked);
    emit('checkboxChange', { card, checked });
  };

  // 组件初始化
  onMounted(async () => {
    // 初始化容器尺寸
    await containerSize.initializeSize(adaptiveContentRef);
    
    // 初始化观察器
    setTimeout(() => {
      observers.initializeObservers(
        adaptiveContentRef,
        containerSize.updateContainerSize,
        containerSize.updateContainerSizeDelayed
      );
    }, 100);
    
    // 检查稳定性并显示
    containerSize.checkStabilityAndShow(adaptiveContentRef);
  });

  return {
    // 状态
    resolvedInstanceKey,
    visible: containerSize.visible,
    cardSize: cardLayout.cardSize,
    
    // 复选框相关
    hasCheckbox: checkboxState.hasCheckbox,
    isCheckboxChecked: checkboxState.isCheckboxChecked,
    getCheckboxLabel: checkboxState.getCheckboxLabel,
    getCheckboxId: checkboxState.getCheckboxId,
    getCheckboxValue: checkboxState.getCheckboxValue,
    
    // 事件处理
    handleOpenPopup,
    handleToggleCheckbox
  };
}