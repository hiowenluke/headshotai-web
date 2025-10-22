<template>
    <teleport to="body">
    <div v-if="showing" class="side-menu-overlay" role="dialog" aria-modal="true" aria-label="Main menu" :style="{ '--overlay-alpha': overlayAlpha.toString() }"
            @keydown.esc.prevent="closeByBtn">
            <div class="menu-wrapper" ref="panelRef">
                <div class="menu-glass-layer" aria-hidden="true"></div>
                <div class="menu-close-bar">
                    <ion-button fill="clear" class="icon-button close-btn" @click="closeByBtn" aria-label="Close menu">
                        <SvgIcon name="close-outline" class="white-icon" size="30px" />
                    </ion-button>
                </div>
                <ion-content :force-overscroll="false" class="menu-scroll">
                    <div class="menu-scroll-outer" ref="scrollOuterRef">
                        <div class="menu-scroll-inner" ref="scrollInnerRef">
                            <ion-list id="items-list">
                        <!-- 用户信息菜单项（已登录时） -->
                        <ion-item v-if="shouldShowUserInfo && isLoggedIn" button lines="none" :detail="false"
                            :class="{ selected: selectedIndex === 0 }" @click="handleUserInfoClick">
                            <div class="avatar-wrap" slot="start">
                                <template v-if="displayUserPicture">
                                    <img :src="processedUserPicture"
                                         alt="avatar"
                                         class="avatar-img"
                                         crossorigin="anonymous"
                                         referrerpolicy="no-referrer"
                                         @error="onAvatarError"
                                         @load="onAvatarLoad"
                                    />
                                </template>
                                <div v-else class="avatar-fallback" aria-hidden="true">{{ displayUserName.charAt(0).toUpperCase() }}</div>
                            </div>
                            <ion-label class="user-label">
                                <div class="user-name">{{ displayUserName }}</div>
                            </ion-label>
                            <SvgIcon name="chevron-forward-outline" slot="end" class="chevron-icon" aria-hidden="true" size="20px" />
                        </ion-item>
                        
                        <!-- Sign In / Sign Up 菜单项（未登录时） -->
                        <ion-item v-if="!isLoggedIn" button lines="none" :detail="false"
                            :class="{ selected: selectedIndex === 0 }" @click="handleUserInfoClick">
                            <span slot="start" class="menu-icon-wrap" aria-hidden="true">
                                <SvgIcon name="user" class="menu-icon" size="26px" />
                            </span>
                            <ion-label>Sign In / Sign Up</ion-label>
                        </ion-item>
                        
                        <!-- 金币状态菜单项 -->
                        <ion-item v-if="isLoggedIn" button lines="none" :detail="false" @click="handleBuyCoins">
                            <SvgIcon name="flash-outline" slot="start" class="coin-icon" aria-hidden="true" size="26px" color="#FFD700" />
                            <ion-label class="coin-label">
                                <div class="coin-text">Coins: {{ displayCoinBalance }}</div>
                            </ion-label>
                            <button class="buy-coins-btn" slot="end" @click.stop="handleBuyCoins">
                                Buy Coins
                            </button>
                        </ion-item>
                        
                        <!-- 分割线 -->
                        <div v-if="isLoggedIn" class="menu-divider"></div>
                        
                        <!-- 其他菜单项 -->
                        <ion-item v-for="(p, i) in otherPages" :key="p.title" button lines="none" :detail="false"
                            :class="{ selected: selectedIndex === i + (isLoggedIn ? 2 : 1) }" @click="handleItemClick(p, i + (isLoggedIn ? 2 : 1))">
                            <span v-if="p.hero" slot="start"
                                :class="['menu-icon-wrap', (p.title === 'Preferences' || p.title === 'Plans & Pricing') && 'pref-icon']"
                                aria-hidden="true">
                                <component :is="p.hero" class="menu-icon" />
                            </span>
                            <span v-else-if="getIconName(p) !== null" slot="start" class="menu-icon-wrap" aria-hidden="true">
                                <SvgIcon :name="getIconName(p) || undefined" size="26px" class="menu-icon" />
                            </span>
                            <span v-else slot="start" class="menu-icon-wrap icon-placeholder" aria-hidden="true"></span>
                            <ion-label v-if="p.title === 'Plans & Pricing'" class="pricing-label">
                                <div class="pricing-title-container">
                                    <span class="pricing-title">{{ p.title }}</span>
                                    <span class="pricing-subtitle">&nbsp;- Save up to 50%</span>
                                </div>
                            </ion-label>
                            <ion-label v-else>{{ p.title }}</ion-label>
                        </ion-item>
                            </ion-list>
                        </div>
                    </div>
                </ion-content>
            </div>
        </div>
    </teleport>
    
    <!-- PageLikeModal 演示系统 -->
    <!-- demo 不再作为正式页面的一部分 -->
    <!-- <MainPageDemo :is-open="showDemo" @close="showDemo = false" /> -->
</template>

<script setup lang="ts">
import './css/SideMenuPage.css'

import { IonButton, IonContent, IonList, IonItem, IonLabel } from '@ionic/vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';

// demo 不再作为正式页面的一部分
// demo 文件已经移动到 docs/PageLikeModal-demo 下，
// import MainPageDemo from '@/pages/demo/index.vue';

// 导入组合式函数
import { useSideMenuManagement } from './composables/useSideMenuManagement';

// 组件属性和事件
const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

// 使用主管理组合式函数
const sideMenuManagement = useSideMenuManagement(props, emit);

// 解构需要的状态和方法
const {
    // DOM 引用
    panelRef,
    scrollOuterRef,
    scrollInnerRef,
    
    // 用户信息相关
    isLoggedIn,
    shouldShowUserInfo,
    displayUserName,
    displayUserPicture,
    processedUserPicture,
    displayCoinBalance,
    onAvatarError,
    onAvatarLoad,
    
    // 菜单数据相关
    otherPages,
    selectedIndex,
    getIconName,
    // demo 不再作为正式页面的一部分
    // showDemo,
    
    // 动画和状态
    showing,
    overlayAlpha,
    closeByBtn,
    
    // 事件处理
    handleItemClick,
    handleBuyCoins,
    handleUserInfoClick
} = sideMenuManagement;
</script>
