<template>
  <ion-button 
    @click="handleClick" 
    :class="['base-modal-button', buttonClass]"
    fill="clear">
    <ImgIcon :name="icon" color="white" size="24px" class-name="button-icon" />
  </ion-button>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';
import ImgIcon from '@/components/icons/ImgIcon.vue';

interface Props {
  icon: string;
  buttonClass?: string;
}

defineProps<Props>();

const emit = defineEmits<{
  click: [];
}>();

const handleClick = () => {
  emit('click');
};
</script>

<style scoped>
.base-modal-button {
  background: none !important;
  border: none !important;
  width: 44px !important;
  height: 44px !important;
  margin: 6px 0 0 0 !important;
  color: #fff !important;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px !important;
  transition: background-color 0.2s ease;
  min-width: 44px !important;
  min-height: 44px !important;
  position: relative;
  z-index: var(--button-z-index, 10012) !important;
  --background: none !important;
  --background-activated: none !important;
  --background-focused: none !important;
  --background-hover: none !important;
  --box-shadow: none !important;
  --color: #ffffff !important;
  --border-radius: 6px !important;
  --padding-start: 0 !important;
  --padding-end: 0 !important;
  --padding-top: 0 !important;
  --padding-bottom: 0 !important;
  text-transform: none !important;
}

.base-modal-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.base-modal-button:active {
  background-color: rgba(255, 255, 255, 0.2);
}

.base-modal-button:focus,
.base-modal-button:active,
.base-modal-button:focus-visible {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

.base-modal-button .button-icon {
  margin: 0 !important;
  padding: 0 !important;
}
</style>
