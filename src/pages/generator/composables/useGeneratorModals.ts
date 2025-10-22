import { ref, nextTick, computed, type Ref } from 'vue';
import { uiState } from '@/state/uiState';

export function useGeneratorModals(uploadControllerRef: Ref<any>) {
  const showSubPage = ref(false);
  
  // 使用持久化状态
  const facesLibraryOpen = computed({
    get: () => uiState.showFaceUploaded ?? false,
    set: (value: boolean) => {
      uiState.showFaceUploaded = value;
    }
  });

  const openSubPage = () => {
    showSubPage.value = true;
  };

  const openFacesLibrary = () => {
    facesLibraryOpen.value = true;
  };

  const handleFaceModalUpload = () => {
    facesLibraryOpen.value = false;
    nextTick(() => {
      uploadControllerRef.value?.triggerUploadDialog?.();
    });
  };

  return {
    showSubPage,
    facesLibraryOpen,
    openSubPage,
    openFacesLibrary,
    handleFaceModalUpload
  };
}
