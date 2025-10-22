// 政策页面模态框管理组合式函数
// 管理服务条款、隐私政策、Cookie政策等模态框的显示状态

import { ref } from 'vue';

export function usePolicyModals() {
  // 模态框状态
  const isTermsOfServiceOpen = ref(false);
  const isPrivacyPolicyOpen = ref(false);
  const isCookiePolicyOpen = ref(false);

  // 显示服务条款
  function showTermsOfService() {
    isTermsOfServiceOpen.value = true;
  }

  // 显示隐私政策
  function showPrivacyPolicy() {
    isPrivacyPolicyOpen.value = true;
  }

  // 显示Cookie政策
  function showCookiesPolicy() {
    isCookiePolicyOpen.value = true;
  }

  // 关闭所有政策模态框
  function closeAllPolicyModals() {
    isTermsOfServiceOpen.value = false;
    isPrivacyPolicyOpen.value = false;
    isCookiePolicyOpen.value = false;
  }

  return {
    // 状态
    isTermsOfServiceOpen,
    isPrivacyPolicyOpen,
    isCookiePolicyOpen,
    
    // 方法
    showTermsOfService,
    showPrivacyPolicy,
    showCookiesPolicy,
    closeAllPolicyModals
  };
}