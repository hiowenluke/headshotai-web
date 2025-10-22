// 图标组件映射，用于替换ionicons和lucide图标
import { defineComponent, h } from 'vue';
import SvgIcon from './SvgIcon.vue';

// 创建图标组件的工厂函数
type IconComponent = ReturnType<typeof defineComponent> & { iconName?: string };

const createIconComponent = (iconName: string, size = '26px'): IconComponent => {
  const component = defineComponent({
    name: `${iconName}Icon`,
    setup() {
      return () => h(SvgIcon, { name: iconName, size });
    }
  });
  (component as IconComponent).iconName = iconName;
  return component as IconComponent;
};

// 导出图标组件
export const mailOutline = createIconComponent('mail-outline');
export const shieldCheckmarkOutline = createIconComponent('shield-checkmark-outline');
export const documentTextOutline = createIconComponent('document-text-outline');
export const heartOutline = createIconComponent('heart-outline');

export const Heart = createIconComponent('heart');
export const CircleDollarSign = createIconComponent('circle-dollar-sign');
export const Receipt = createIconComponent('receipt');
export const RefundOutline = createIconComponent('refund-outline');
export const User = createIconComponent('user');
export const Cookie = createIconComponent('cookie');