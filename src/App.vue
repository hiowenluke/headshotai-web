<template>
  <ion-app 
    @touchstart="handleAppTouchStart"
    @touchmove="handleAppTouchMove"
    @touchend="handleAppTouchEnd"
    @touchcancel="handleAppTouchCancel"
  >
    <ion-split-pane content-id="main-content">
  <ion-router-outlet id="main-content" :inert="showSideMenu ? '' : null" />
  <DebugPopup :open="showDebug" @close="showDebug=false" />
  
  <!-- 用户中心（改为 PageLikeModal 内部实现） -->
  <UserCenterPage :is-open="showUserCenter" @close="showUserCenter=false" />
  
  <!-- 各个独立页面的模态框 -->
  <PreferencesPage :is-open="showPreferencesPage" @close="showPreferencesPage=false" />
  <PricingPage :is-open="showPricing" @close="showPricing=false" />
  <RefundPolicyPage :is-open="showRefundPolicy" @close="showRefundPolicy=false" />
  <PrivacyPolicyPage :is-open="showPrivacyPolicy" @close="showPrivacyPolicy=false" />
  <TermsOfServicePage :is-open="showTermsOfService" @close="showTermsOfService=false" />
  <CookiePolicyPage :is-open="showCookiePolicy" @close="showCookiePolicy=false" />
  
  <!-- 用户中心子页面 -->
  <PaymentHistoryPage :is-open="showPaymentHistory" @close="showPaymentHistory=false" />
  <UsageHistoryPage :is-open="showUsageHistory" @close="showUsageHistory=false" />
  <BuyCoinsPage :is-open="showBuyCoins" @close="showBuyCoins=false" />
  
  <!-- 支付相关页面 -->
  <PaymentSuccessPage :is-open="showPaymentSuccess" @close="showPaymentSuccess=false" />
  <PaymentCancelPage :is-open="showPaymentCancel" @close="showPaymentCancel=false" />
  
  <AuthPage :is-open="showAuth" :message="authMessage" @close="handleAuthClose" />
  <MessageToast />
    <SideMenuPage :open="showSideMenu" @close="showSideMenu=false" />
    </ion-split-pane>
    
    <!-- LoadingToast 放在最顶层，确保覆盖所有内容 -->
    <LoadingToast />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/vue';
import { onMounted, onBeforeUnmount, watch, ref, defineAsyncComponent } from 'vue';
import PreferencesPage from '@/pages/sideMenu/PreferencesPage.vue';
import DebugPopup from '@/popups/DebugPopup.vue';
import { usePersistentModal } from '@/composables/usePersistentModal';
import SideMenuPage from '@/pages/sideMenu/index.vue';
import AuthPage from '@/pages/authPage/index.vue';
import MessageToast from '@/components/toast/MessageToast.vue';
import LoadingToast from '@/components/toast/LoadingToast.vue';
import UserCenterPage from '@/pages/userCenter/index.vue';
import PaymentHistoryPage from '@/pages/userCenter/PaymentHistoryPage.vue';
import UsageHistoryPage from '@/pages/userCenter/UsageHistoryPage.vue';
import BuyCoinsPage from '@/pages/payment/BuyCoinsPage.vue';
import PaymentSuccessPage from '@/pages/payment/PaymentSuccessPage.vue';
import PaymentCancelPage from '@/pages/payment/PaymentCancelPage.vue';
import PricingPage from '@/pages/sideMenu/PricingPage.vue';
import useSessionHeartbeat from '@/composables/useSessionHeartbeat';
import { authState } from '@/state/authState';
import { initializeHomePageLock, cleanupHomePageLock, getHomePageLock } from '@/utils/homePageLock';
import { createSmartLoadingConfig } from '@/utils/smartLoading';

// 懒加载政策页面组件（这些页面不常用，按需加载）
const RefundPolicyPage = defineAsyncComponent(() => 
  import('@/pages/sideMenu/RefundPolicyPage.vue')
);
const PrivacyPolicyPage = defineAsyncComponent(() => 
  import('@/pages/sideMenu/PrivacyPolicyPage.vue')
);
const TermsOfServicePage = defineAsyncComponent(() => 
  import('@/pages/sideMenu/TermsOfServicePage.vue')
);
const CookiePolicyPage = defineAsyncComponent(() => 
  import('@/pages/sideMenu/CookiePolicyPage.vue')
);

// 首次访问偏好弹窗现在由index.html中的preferences-popup.js处理
const showPreferencesPage = usePersistentModal('preferencesPage');
const showDebug = usePersistentModal('debug');
const showUserCenter = usePersistentModal('userCenter');
const showPricing = usePersistentModal('pricing');
const showRefundPolicy = usePersistentModal('refundPolicy');
const showPrivacyPolicy = usePersistentModal('privacyPolicy');
const showTermsOfService = usePersistentModal('termsOfService');
const showCookiePolicy = usePersistentModal('cookiePolicy');
const showPaymentHistory = usePersistentModal('paymentHistory');
const showUsageHistory = usePersistentModal('usageHistory');
const showBuyCoins = usePersistentModal('buyCoins');
const showPaymentSuccess = usePersistentModal('paymentSuccess');
const showPaymentCancel = usePersistentModal('paymentCancel');
const devMode = import.meta.env && (import.meta.env.DEV || import.meta.env.MODE === 'development');

// 初始化主页锁定功能
let homePageLock: ReturnType<typeof getHomePageLock> | null = null;

// 智能加载配置
const smartLoadingConfig = createSmartLoadingConfig();

// 登录页不使用持久化状态，因为登录是临时的事件驱动状态
const showAuth = ref(false);
const authMessage = ref('');

const showSideMenu = usePersistentModal('sideMenu');


onMounted(() => {
  // 初始化主页锁定功能
  homePageLock = initializeHomePageLock(devMode);
  
  // 初始化智能加载配置
  smartLoadingConfig.initialize();
  
  // 安装会话心跳（方案 A）— 10 分钟间隔滑动续期，仅页面可见时运行
  // 不自动显示登录页，让业务逻辑决定何时显示
  useSessionHeartbeat({ intervalMs: 10 * 60 * 1000, autoOpenAuth: false });
  
  // 监听认证状态变化，用户登录后自动关闭登录页
  watch(() => authState.isLoggedIn, (isLoggedIn) => {
    if (isLoggedIn && showAuth.value) {
      showAuth.value = false;
      authMessage.value = '';

    }
  });
  
  function bringPaymentHistoryToFront() {
    try {
      const modalEl = document.querySelector('.payment-history-modal');
      if (modalEl) {
        (modalEl as HTMLElement).style.zIndex = '10020';
        const content = (modalEl as HTMLElement).shadowRoot?.querySelector('.modal-wrapper') as HTMLElement | null;
        if (content) content.style.zIndex = '10021';

      }
    } catch (e) {
      if (devMode) console.warn('[PaymentHistoryPage] bringToFront failed', e);
    }
  }
  // 首次访问偏好弹窗现在由index.html处理
  window.addEventListener('open-debug-modal', () => { showDebug.value = true; });
    
  // 新的独立认证弹窗事件（侧边菜单直接触发）
      window.addEventListener('open-auth', (event: Event) => { 
        // 检查是否有待处理的认证成功，如果有则不显示登录页
        const just = localStorage.getItem('auth:justLoggedIn');
        if (just === '1') {
          return;
        }
        const detail = (event as CustomEvent<{ message?: string }>).detail;
        authMessage.value = detail?.message ?? '';
        showAuth.value = true; 
      });
    // 登录成功后 AuthModal 内部会 dispatch close-auth
    window.addEventListener('close-auth', () => {
      if (showAuth.value) {
        showAuth.value = false;

      }
    });
    window.addEventListener('open-side-menu', () => { 
      showSideMenu.value = true;

    });
    // 监听用户中心关闭事件（退出登录时触发）
    window.addEventListener('close-user-center', () => {
      if (showUserCenter.value) {
        showUserCenter.value = false;

      }
    });
    
    // 监听用户中心打开事件
    window.addEventListener('open-user-center', () => {
      showUserCenter.value = true;

    });
    
    // 监听各个独立页面打开事件
    window.addEventListener('open-preferences', () => {
      showPreferencesPage.value = true;

    });

    window.addEventListener('open-pricing', () => {
      showPricing.value = true;

    });
    
    window.addEventListener('open-refund-policy', () => {
      showRefundPolicy.value = true;

    });
    
    window.addEventListener('open-privacy-policy', () => {
      showPrivacyPolicy.value = true;

    });
    
    window.addEventListener('open-terms-of-service', () => {
      showTermsOfService.value = true;

    });
    
    window.addEventListener('open-cookie-policy', () => {
      showCookiePolicy.value = true;

    });
    
    // 监听用户中心子页面打开事件
    window.addEventListener('open-payment-history', () => {
      // 若已为 true，先强制关闭一帧再打开，确保 watch / IonModal 动画与层级刷新
      if (showPaymentHistory.value) {

        showPaymentHistory.value = false;
        requestAnimationFrame(() => {
          showPaymentHistory.value = true;
          requestAnimationFrame(() => bringPaymentHistoryToFront());
        });
      } else {
        showPaymentHistory.value = true;
        requestAnimationFrame(() => bringPaymentHistoryToFront());
      }

    });
    
    window.addEventListener('open-usage-history', () => {
      showUsageHistory.value = true;

    });
    
    window.addEventListener('open-buy-coins', () => {
      showBuyCoins.value = true;

    });
    
    // 监听支付回调事件
    window.addEventListener('open-payment-success', (event: Event) => {
      const customEvent = event as CustomEvent<{ sessionId: string }>;
      
      // 转发 session ID 给 PaymentSuccessPage
      if (customEvent.detail?.sessionId) {
        window.dispatchEvent(new CustomEvent('payment-success-data', {
          detail: { sessionId: customEvent.detail.sessionId }
        }));
      }
      
      showPaymentSuccess.value = true;

    });
    
    window.addEventListener('open-payment-cancel', () => {
      showPaymentCancel.value = true;

    });
    
    // 主页锁定功能已在 homePageLock.initialize() 中处理
});

// 组件卸载时清理主页锁定功能
onBeforeUnmount(() => {
  cleanupHomePageLock();
});
// 偏好设置相关函数已移除，现在由各自的组件独立处理

function handleAuthClose() { 
  showAuth.value = false; 
  authMessage.value = '';
}

// 主页锁定触摸事件处理函数
function handleAppTouchStart(event: TouchEvent) {
  homePageLock?.handleAppTouchStart(event);
}

function handleAppTouchMove(event: TouchEvent) {
  homePageLock?.handleAppTouchMove(event);
}

function handleAppTouchEnd(event: TouchEvent) {
  homePageLock?.handleAppTouchEnd(event);
}

function handleAppTouchCancel(event: TouchEvent) {
  homePageLock?.handleAppTouchCancel(event);
}

// showPref 相关的 watch 已移除
// 注意：showAuth 不需要持久化，它应该是临时状态


// 主页锁定功能已通过 homePageLock 工具类实现
// 不再需要监听模态框状态来控制主页锁定
</script>

<style scoped>
/* App 根级暂无特殊样式；已移除旧 ion-menu 样式 */
</style>
