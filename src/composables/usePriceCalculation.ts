import { ref, computed } from 'vue';
import { fetchPrices } from '@/services/priceService';

// 价格和ETA管理的组合式函数
export const usePriceCalculation = () => {
    const priceMap = ref<Record<string, number>>({});
    const etaMap = ref<Record<string, number | null>>({});
    
    // 选中数量状态（由各个 tab 组件报告）
    const selectedCounts = ref<Record<string, number>>({
        '1P': 1,
        '20P': 1,
        '40P': 1,
        '80P': 1,
        'DIY': 1
    });
    
    // 计算当前选中的数量
    const getCurrentSelectedCount = (selectedPlan: string) => {
        const value = selectedCounts.value[selectedPlan];
        return value === undefined ? 1 : value;
    };
    
    // 计算价格相关的计算属性工厂函数
    const createPriceComputed = (selectedPlan: string) => {
        const currentSelectedCount = computed(() => getCurrentSelectedCount(selectedPlan));
        
        const generateLabel = computed(() => {
            const base = `Generate ${selectedPlan}`;
            const count = currentSelectedCount.value;
            return count > 1 ? `${base} x${count}` : base;
        });
        
        const priceBase = computed(() => priceMap.value[selectedPlan] || 0);
        const totalPrice = computed(() => priceBase.value * currentSelectedCount.value);
        const priceString = computed(() => totalPrice.value);
        
        const etaSeconds = computed(() => {
            const base = etaMap.value[selectedPlan];
            if (!base) return 0;
            return base * currentSelectedCount.value;
        });
        
        const pricePillClass = computed(() => {
            const digits = String(priceString.value).length;
            return { 'w-wide': digits >= 3 };
        });
        
        const formattedEta = computed(() => {
            const secs = etaSeconds.value;
            if (secs >= 60) return (secs / 60) + ' minutes';
            return secs + ' seconds';
        });
        
        return {
            currentSelectedCount,
            generateLabel,
            priceString,
            formattedEta,
            pricePillClass
        };
    };
    
    // 处理选中数量变化
    const handleSelectedCountChange = (plan: string, count: number) => {
        selectedCounts.value[plan] = count;
    };
    
    // 初始化价格数据
    const initializePrices = async () => {
        try {
            const resp = await fetchPrices();
            priceMap.value = resp.prices;
            etaMap.value = resp.eta_seconds || {};
        } catch (error) {
            console.error('Failed to fetch prices:', error);
        }
    };
    
    return {
        priceMap,
        etaMap,
        selectedCounts,
        createPriceComputed,
        handleSelectedCountChange,
        initializePrices,
        getCurrentSelectedCount
    };
};
