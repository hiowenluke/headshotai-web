// 复选框状态管理组合式函数
import { ref, watch } from 'vue';

interface CardInfo {
  title: string;
  counter: string | number;
  coverUrl: string;
  popup: string;
  arguments: Record<string, any>;
}

export function useCheckboxState(instanceKey: string, cardsInfos: any) {
  const checkboxStates = ref<Record<string, boolean>>({});

  const hasCheckbox = (card: CardInfo) => Boolean(card.arguments?.checkboxLabel);
  
  const getCheckboxIdentifier = (card: CardInfo) => {
    const identifier = card.arguments?.optionKey || card.title;
    return String(identifier);
  };
  
  const checkboxStorageKey = (card: CardInfo) => 
    `OptionsCardsArea:${instanceKey}:checkbox:${getCheckboxIdentifier(card)}`;
  
  const readCheckboxValue = (card: CardInfo) => {
    try {
      const raw = localStorage.getItem(checkboxStorageKey(card));
      return raw === 'true';
    } catch {
      return false;
    }
  };
  
  const writeCheckboxValue = (card: CardInfo, val: boolean) => {
    try { 
      localStorage.setItem(checkboxStorageKey(card), String(val)); 
    } catch { /* ignore */ }
  };

  const initializeCheckboxStates = () => {
    const states: Record<string, boolean> = {};
    cardsInfos.value.forEach((card: CardInfo) => {
      if (hasCheckbox(card)) {
        states[getCheckboxIdentifier(card)] = readCheckboxValue(card);
      }
    });
    checkboxStates.value = states;
  };

  const isCheckboxChecked = (card: CardInfo) => {
    const id = getCheckboxIdentifier(card);
    if (!(id in checkboxStates.value)) {
      checkboxStates.value = { ...checkboxStates.value, [id]: readCheckboxValue(card) };
    }
    return checkboxStates.value[id] ?? false;
  };

  const toggleCheckbox = (card: CardInfo, checked: boolean) => {
    const id = getCheckboxIdentifier(card);
    checkboxStates.value = { ...checkboxStates.value, [id]: checked };
    writeCheckboxValue(card, checked);
  };

  const getCheckboxLabel = (card: CardInfo) => (card.arguments?.checkboxLabel as string) || '';
  
  const getCheckboxId = (card: CardInfo) => {
    const raw = `${instanceKey}-${getCheckboxIdentifier(card)}`;
    return raw.replace(/[^a-zA-Z0-9_-]/g, '-');
  };

  const getCheckboxValue = (title: string) => {
    const card = cardsInfos.value.find((item: CardInfo) => item.title === title);
    if (!card || !hasCheckbox(card)) return false;
    return isCheckboxChecked(card);
  };

  // 监听cardsInfos变化
  watch(() => cardsInfos.value, () => {
    initializeCheckboxStates();
  }, { deep: true, immediate: true });

  return {
    checkboxStates,
    hasCheckbox,
    getCheckboxIdentifier,
    isCheckboxChecked,
    toggleCheckbox,
    getCheckboxLabel,
    getCheckboxId,
    getCheckboxValue,
    initializeCheckboxStates
  };
}