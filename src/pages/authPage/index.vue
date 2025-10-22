<template>
  <PageLikeModal 
    :is-open="isOpen" 
    page-title="Sign In / Sign Up" 
    modal-style="horizontal" 
    :disable-content-scroll="true"
    @close="$emit('close')"
  >
    <div class="modal-page">
      <div class="modal-content">
        <div v-show="props.message && props.message.length > 0" class="auth-banner">{{ props.message }}</div>
        <CenterCard 
          ref="centerCardRef"
          title="Welcome!"
          sub-title="Sign In / Sign Up With"
          :error-message="authError"
          fullWidth
        >
          <template #buttons>
            <LargePrimaryButton variant="inverse" class="oauth-btn google-btn" @click="signIn('google')">
              <div class="button-content">
                <div class="icon-container">
                  <span class="logo g"><SvgIcon name="logo-google" size="22px" color="#ea4335" /></span>
                </div>
                <div class="text-container">
                  Google
                </div>
              </div>
            </LargePrimaryButton>
            <LargePrimaryButton variant="inverse" class="oauth-btn facebook-btn" @click="signIn('facebook')">
              <div class="button-content">
                <div class="icon-container">
                  <span class="logo f"><SvgIcon name="logo-facebook" size="22px" color="#1877f2" /></span>
                </div>
                <div class="text-container">
                  Facebook
                </div>
              </div>
            </LargePrimaryButton>
          </template>
        </CenterCard>
      </div>
      <PageFooterHint>
        By continuing, you agree to our<br>
        <a href="#" class="link" @click.prevent="showTermsOfService">Terms of Services</a>, 
        <a href="#" class="link" @click.prevent="showPrivacyPolicy">Privacy Policy</a> and 
        <a href="#" class="link" @click.prevent="showCookiesPolicy">Cookies Policy</a>.
      </PageFooterHint>
    </div>
  </PageLikeModal>
  
  <!-- Terms of Service Modal -->
  <TermsOfServicePage :is-open="isTermsOfServiceOpen" @close="isTermsOfServiceOpen = false" />
  
  <!-- Privacy Policy Modal -->
  <PrivacyPolicyPage :is-open="isPrivacyPolicyOpen" @close="isPrivacyPolicyOpen = false" />

  <!-- Cookies Policy Modal -->
  <CookiePolicyPage :is-open="isCookiePolicyOpen" @close="isCookiePolicyOpen = false" />
</template>

<script setup lang="ts">
import { ref, watch, defineAsyncComponent } from 'vue';
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';
import LargePrimaryButton from '@/components/button/LargePrimaryButton.vue';
import CenterCard from '@/components/layout/CenterCard.vue';
import PageFooterHint from '@/components/layout/PageFooterHint.vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';

// 政策页面 - 懒加载（用户点击链接时才加载）
const TermsOfServicePage = defineAsyncComponent(() => 
  import('@/pages/sideMenu/TermsOfServicePage.vue')
);
const PrivacyPolicyPage = defineAsyncComponent(() => 
  import('@/pages/sideMenu/PrivacyPolicyPage.vue')
);
const CookiePolicyPage = defineAsyncComponent(() => 
  import('@/pages/sideMenu/CookiePolicyPage.vue')
);

// 导入组合式函数
import { useOAuthAuth } from './composables/useOAuthAuth';
import { usePolicyModals } from './composables/usePolicyModals';
// 组件属性和事件
const props = withDefaults(defineProps<{ isOpen: boolean; message?: string }>(), {
  message: ''
});
defineEmits<{ (e: 'close'): void }>();

// 模板引用
const centerCardRef = ref<InstanceType<typeof CenterCard> | null>(null);

// 使用组合式函数
const { authError, signIn } = useOAuthAuth();
const { 
  isTermsOfServiceOpen, 
  isPrivacyPolicyOpen, 
  isCookiePolicyOpen,
  showTermsOfService,
  showPrivacyPolicy,
  showCookiesPolicy
} = usePolicyModals();



// 监听错误变化 - 由于我们已经使用CSS布局，不再需要重新计算位置
watch(authError, () => {
  // CenterCard 现在使用纯CSS布局，无需重新计算位置
});
</script>

<style scoped>
/* 模态框内容布局 */
.modal-page {
  padding: calc(var(--plm-header-height, 0px) - var(--plm-header-padding-bottom, 0px) + 20px) 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
}

.auth-banner {
  width: 100%;
  max-width: 420px;
  padding: 14px 18px;
  margin-bottom: 20px;
  border-radius: 16px;
  background: rgba(79, 158, 255, 0.16);
  border: 1px solid rgba(79, 158, 255, 0.45);
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-align: center;
  line-height: 1.45;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(6px);
}

.modal-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 100%;
}

/* OAuth 按钮特定样式 */
.oauth-btn {
  margin-bottom: 19px;
}

.oauth-btn:last-of-type {
  margin-bottom: 13px;
}

.facebook-btn {
  color: #1877f2;
}

/* 按钮内容布局 */
.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 100%;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.text-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}



/* 覆盖 AuthCenterCard 中按钮的默认样式 */
:deep(.card-buttons .large-primary-btn) {
  padding: 8px 20px;
}

/* 移除响应式代码 - 只支持移动端 */
</style>