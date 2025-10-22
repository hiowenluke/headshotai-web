import { ref, computed, type Ref } from 'vue';
import type { PlanKey } from './useGeneratorPlans';

export function useGeneratorFaces(
  currentPlanKey: Ref<PlanKey>,
  demoFacesList: Ref<string[]>,
  generator1PRef: Ref<any>
) {
  const selectedDemoFaces = ref<string[]>([]);
  
  // 只保存选中的上传图片数量，不保存具体的 URL 列表
  const uploadedFacesCount = ref<number>(0);

  const showBottomFaceUploadController = computed(() => {
    if (currentPlanKey.value === '1P' || currentPlanKey.value === '20P') return true;
    return uploadedFacesCount.value > 0;
  });

  const currentUploadDemos = computed(() => {
    return currentPlanKey.value === '1P' ? demoFacesList.value : [];
  });

  const hasSelectedFaces = computed(() => {
    const demoCount = currentPlanKey.value === '1P' ? selectedDemoFaces.value.length : 0;
    return uploadedFacesCount.value + demoCount > 0;
  });

  const getDemoCountForPlan = (plan: PlanKey) =>
    plan === '1P' ? selectedDemoFaces.value.length : 0;

  const handleUploadedCountChange = (
    count: number,
    updatePlanSelectionCount: (plan: PlanKey, count?: number) => void
  ) => {
    uploadedFacesCount.value = count;
    updatePlanSelectionCount(currentPlanKey.value, count);
  };

  const handlePreviewImageChange = (url: string | null) => {
    if (currentPlanKey.value === '1P') {
      generator1PRef.value?.setPreviewImage?.(url);
    }
  };

  const handleDemoFacesChange = (
    faces: string[],
    updatePlanSelectionCount: (plan: PlanKey, count?: number) => void
  ) => {
    selectedDemoFaces.value = faces;
    if (currentPlanKey.value === '1P') {
      generator1PRef.value?.setSelectedDemoFaces?.(faces);
    }
    updatePlanSelectionCount(currentPlanKey.value);
  };

  return {
    selectedDemoFaces,
    uploadedFacesCount,
    showBottomFaceUploadController,
    currentUploadDemos,
    hasSelectedFaces,
    getDemoCountForPlan,
    handleUploadedCountChange,
    handlePreviewImageChange,
    handleDemoFacesChange
  };
}
