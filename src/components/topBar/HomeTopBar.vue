<template>
  <ion-toolbar class="main-toolbar">
    <div class="toolbar-inner">
      <div class="brand">
        <span class="app-name">Headshot AI</span>
      </div>
      <div class="right-icons">
        <ion-button fill="clear" class="icon-button" @click="$emit('recent')" aria-label="Recent tasks">
          <SvgIcon name="time-outline" class="white-icon" size="30px" />
        </ion-button>
        <ion-button fill="clear" class="icon-button" @click="openSideMenu" aria-label="Open menu">
          <SvgIcon name="menu-outline" class="white-icon menu-icon" size="30px" />
        </ion-button>
      </div>
    </div>
  </ion-toolbar>
</template>

<script setup lang="ts">
import { IonToolbar, IonButton } from '@ionic/vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';

// 定义事件
defineEmits<{
  (e: 'recent'): void;
}>();

// 打开侧边菜单
function openSideMenu() {
  try {
    window.dispatchEvent(new CustomEvent('open-side-menu'));
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.main-toolbar {
  --background: transparent;
  background: transparent !important;
  --border-width: 0;
  --border-color: transparent;
  border: none !important;
  box-shadow: none !important;
  --box-shadow: none;
  --padding-top: 1px;
  --padding-bottom: 1px;
  --min-height: 27px;
}

.main-toolbar::before,
.main-toolbar::after {
  display: none !important;
}

.toolbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 8px 6px;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-left: 2px;
}

.app-name {
  font-weight: 700;
  color: #ffffff;
  font-size: 20px;
}

.icon-button {
  padding: 0;
  background: transparent;
  margin: 0;
  --border-width: 0;
  border: none !important;
  box-shadow: none !important;
}

.icon-button:first-child {
  margin-right: -20px;
}

.right-icons {
  display: flex;
  margin-right: -12px;
}

.right-icons ion-icon.white-icon {
  color: #fff !important;
  font-size: 30px;
}

.right-icons ion-icon.menu-icon {
  color: #fff !important;
  font-size: 30px;
  transform: scaleY(1.5);
}
</style>