<template>
    <PageLikeModal :is-open="isOpen" page-title="AIP.so - User Center" modal-style="horizontal" @close="$emit('close')">
        <div class="user-center-content">
        
        <!-- 用户头像和基本信息 -->
        <div class="user-profile-section">
            <div class="user-avatar-large">
                <template v-if="userPicture">
                    <img :src="processedUserPicture" 
                         alt="User Avatar" 
                         class="avatar-image"
                         crossorigin="anonymous"
                         referrerpolicy="no-referrer"
                         @error="onAvatarError"
                         @load="onAvatarLoad" />
                </template>
                <div v-else class="avatar-fallback-large">{{ userInitial }}</div>
            </div>
            <div class="user-info">
                <h3 class="user-name">{{ userName || 'No username set' }}</h3>
                <p class="user-email">{{ userEmail || 'No email set' }}</p>
                <div class="coin-balance">
                    <SvgIcon name="flash-outline" class="coin-icon" size="16px" />
                    <span class="balance-text">{{ coinBalance }} Coins</span>
                </div>
            </div>
        </div>

        <!-- 用户操作菜单 -->
        <div class="user-actions">
            <!-- 加上 gesture-enabled-list，响应手势 -->
            <ion-list class="user-menu-list gesture-enabled-list">
                <ion-item button lines="full" :detail="false" @click="handleBuyCoins">
                    <SvgIcon name="card-outline" slot="start" class="menu-item-icon" size="24px" />
                    <ion-label>Buy Coins</ion-label>
                    <SvgIcon name="chevron-forward-outline" slot="end" class="chevron-end" size="20px" />
                </ion-item>
                
                <ion-item button lines="full" :detail="false" @click="handlePaymentHistory">
                    <SvgIcon name="receipt" slot="start" class="menu-item-icon" size="24px" />
                    <ion-label>Payment History</ion-label>
                    <SvgIcon name="chevron-forward-outline" slot="end" class="chevron-end" size="20px" />
                </ion-item>
                
                <ion-item button lines="full" :detail="false" @click="handleCoinUsageHistory">
                    <SvgIcon name="flash-off-outline" slot="start" class="menu-item-icon" size="24px" />
                    <ion-label>Coin Usage History</ion-label>
                    <SvgIcon name="chevron-forward-outline" slot="end" class="chevron-end" size="20px" />
                </ion-item>
            </ion-list>
        </div>

        <!-- 危险操作区域 -->
        <div class="danger-section">
            <!-- 加上 gesture-enabled-list，响应手势 -->
            <ion-list class="danger-menu-list gesture-enabled-list">
                <ion-item button :detail="false" lines="none" @click="handleLogout" class="danger-item">
                    <SvgIcon name="log-out-outline" slot="start" class="menu-item-icon danger-icon" size="24px" />
                    <ion-label class="danger-label">Sign Out</ion-label>
                </ion-item>
            </ion-list>
        </div>
        
        <!-- 退出登录确认对话框 -->
        <ConfirmDialog 
            :open="showLogoutDialog"
            title="Sign Out"
            message="Are you sure?"
            :show-backdrop="true"
            @confirm="confirmLogout"
            @cancel="showLogoutDialog = false"
        />
        </div>
    </PageLikeModal>
</template>

<script setup lang="ts">
import { IonList, IonItem, IonLabel } from '@ionic/vue';
import { computed, ref, defineAsyncComponent } from 'vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';
import { useRouter } from 'vue-router';
import { authState, logout } from '@/state/authState';
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';

// 确认对话框 - 懒加载（用户触发时才显示）
const ConfirmDialog = defineAsyncComponent(() => 
  import('@/components/dialog/ConfirmDialog.vue')
);

defineProps<{ isOpen: boolean }>();
defineEmits<{ (e: 'close'): void }>();

const userName = computed(() => {
  if (authState.user?.name) return authState.user.name;
  
  try {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      return parsed.name || '';
    }
  } catch { /* ignore */ }
  return '';
});

const userEmail = computed(() => {
  if (authState.user?.email) return authState.user.email;
  
  try {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      return parsed.email || '';
    }
  } catch { /* ignore */ }
  return '';
});

const userPicture = computed(() => {
  if (authState.user?.picture) return authState.user.picture;
  
  try {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      return parsed.picture || '';
    }
  } catch { /* ignore */ }
  return '';
});

// ===== 头像 URL 处理（解决跨域和缓存问题）=====
const processedUserPicture = computed(() => {
  const originalUrl = userPicture.value;
  if (!originalUrl) return '';
  
  // 如果是 Google 头像 URL，确保使用 HTTPS 并添加参数防止缓存问题
  if (originalUrl.includes('googleusercontent.com')) {
    const url = new URL(originalUrl.replace('http://', 'https://'));
    // 添加一些参数来确保图片能正确加载
    url.searchParams.set('sz', '80'); // 设置大小
    url.searchParams.set('c', 'photo'); // 确保是照片
    return url.toString();
  }
  
  // 其他情况直接返回原 URL
  return originalUrl;
});
const userInitial = computed(() => (userName.value || userEmail.value || '?').trim().charAt(0).toUpperCase());

const coinBalance = computed(() => {
  if (authState.user?.coin_balance !== undefined) return authState.user.coin_balance;
  
  try {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      return parsed.coin_balance || 0;
    }
  } catch { /* ignore */ }
  return 0;
});

// ===== Avatar 错误处理和调试 =====
function onAvatarError() {
  console.warn('[UserCenter] Avatar image failed to load:', {
    original: userPicture.value,
    processed: processedUserPicture.value
  });
  // 可以在这里添加重试逻辑或者设置一个默认图片
}

function onAvatarLoad() {
  // 头像加载成功
}

// Vue Router 实例
const router = useRouter();

// 退出登录对话框状态
const showLogoutDialog = ref(false);


function handleBuyCoins() {
    // 触发购买金币页面打开事件
    window.dispatchEvent(new Event('open-buy-coins'));
}

function handlePaymentHistory() {
    // 触发支付记录页面打开事件
    window.dispatchEvent(new Event('open-payment-history'));
}

function handleCoinUsageHistory() {
    // 触发金币使用记录页面打开事件
    window.dispatchEvent(new Event('open-usage-history'));
}

function handleLogout() {
    // 显示确认对话框
    showLogoutDialog.value = true;
}

function confirmLogout() {
    showLogoutDialog.value = false;
    
    // 执行退出登录操作
    logout().then(() => {
        // 关闭用户中心
        window.dispatchEvent(new Event('close-user-center'));
        
        // 返回到主页
        router.push('/home');
        
        // 显示退出成功的 toast 提示（使用 light 模式）
        window.dispatchEvent(new CustomEvent('app:toast', {
            detail: {
                message: "You've been logged out.",
                type: 'info',
                ttl: 3000
            }
        }));
    }).catch((error) => {
        console.error('Sign out failed:', error);
        
        // 即使出错也要关闭对话框，并显示错误提示
        window.dispatchEvent(new CustomEvent('app:toast', {
            detail: {
                message: 'Sign out failed. Please try again.',
                type: 'error',
                ttl: 3000
            }
        }));
    });
}
</script>

<style scoped>
.user-center-content {
    padding: 0;
    min-height: 100vh;
}

.user-profile-section {
    padding: 24px 20px 32px;
    text-align: center;
    background: linear-gradient(135deg, rgba(37, 38, 43, 0.8), rgba(37, 38, 43, 0.6));
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-avatar-large {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    margin: 0 auto 16px;
    background: #2f323a;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1), 0 8px 20px -4px rgba(0, 0, 0, 0.4);
}

.avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    image-rendering: auto;
    user-select: none;
}

.avatar-fallback-large {
    font-size: 32px;
    font-weight: 600;
    color: #fff;
}

.user-info {
    color: #fff;
}

.user-name {
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 600;
}

.user-email {
    margin: 0;
    font-size: 14px;
    opacity: 0.7;
}

.coin-balance {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 12px;
    padding: 8px 16px;
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 20px;
    display: inline-flex;
}

.coin-icon {
    color: #ffd700;
}

.balance-text {
    color: #ffd700;
    font-size: 14px;
    font-weight: 600;
}

.user-actions {
    padding: 24px 0;
}

.user-menu-list,
.danger-menu-list {
    background: transparent;
}

.user-menu-list ion-item,
.danger-menu-list ion-item {
    --background: transparent;
    --color: #fff;
    --padding-start: 20px;
    --padding-end: 20px;
    --min-height: 56px;
}

.menu-item-icon {
    font-size: 22px;
    color: rgba(255, 255, 255, 0.8);
    margin-right: 16px;
}

.chevron-end {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.4);
}

.danger-section {
    padding: 24px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.danger-item {
    --background: transparent;
}

.danger-icon {
    color: #ff6b6b !important;
}

.danger-label {
    color: #ff6b6b !important;
}

ion-item {
    --border-color: rgba(255, 255, 255, 0.1);
}

ion-label {
    font-size: 16px;
}
</style>
