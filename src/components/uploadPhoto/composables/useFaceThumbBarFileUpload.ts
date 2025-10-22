/**
 * FaceThumbBar 文件上传逻辑
 * 负责处理文件选择和上传
 */
import { ref, type Ref } from 'vue';
import { useAuthRequiredAction } from '@/composables/useAuthRequiredAction';

export interface FileUploadEmits {
  plus: () => void;
  filesChange: (files: File[]) => void;
}

export function useFaceThumbBarFileUpload(
  fileInputRef: Ref<HTMLInputElement | null>,
  emit: FileUploadEmits
) {
  /**
   * 确保用户已登录后再上传
   */
  const { ensureAuth: ensureUploadAuth } = useAuthRequiredAction(
    'upload-photos',
    () => {
      const input = fileInputRef.value;
      if (input) {
        input.click();
      }
    },
    { message: 'Please sign in before uploading.' }
  );

  /**
   * 处理加号按钮点击
   */
  const onPlus = () => {
    emit.plus();
  };

  /**
   * 处理文件选择
   */
  const handleFiles = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    emit.filesChange(files);
    input.value = '';
  };

  /**
   * 打开文件选择器
   */
  const openFilePicker = () => {
    ensureUploadAuth();
  };

  return {
    onPlus,
    handleFiles,
    openFilePicker,
  };
}
