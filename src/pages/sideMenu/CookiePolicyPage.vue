<template>
    <PageLikeModal :is-open="isOpen" page-title="Cookie Policy" modal-style="horizontal" @close="$emit('close')">
        <div class="modal-page">
            <div class="modal-content">
                <div class="page-wrapper">
                    <h2>Cookie Policy</h2>
                    <p class="desc">Information about how we use cookies.</p>
                    <p class="meta">Cookie policy content will be implemented here.</p>
                </div>
            </div>
        </div>
    </PageLikeModal>
</template>

<script setup lang="ts">
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';

defineProps<{ isOpen: boolean }>();
defineEmits<{ (e: 'close'): void }>();
</script>

<style scoped>
/* 页面特有样式 */
</style>
