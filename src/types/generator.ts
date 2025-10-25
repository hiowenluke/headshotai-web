// Generator组件相关类型定义

export interface GeneratorProps {
    selectedPlan: string;
    // 从父组件传递的计算结果
    generateLabel?: string;
    priceString?: string | number;
    formattedEta?: string;
    pricePillClass?: object;
}

// Tab相关类型定义
export interface TabItem {
    key: string;
    label: string;
    icon?: string; // SVG 图标名称
    hot?: boolean;
}