<template>
    <PageLikeModal :is-open="isOpen" page-title="Plans & Pricing" modal-style="horizontal" @close="$emit('close')">
        <div class="modal-page">
            <div class="modal-content">
                <div class="page-wrapper">
                    <h2>Plans & Pricing</h2>
                    <p class="desc">Save up to 50% with our special plans!</p>
                    <p class="meta">Pricing content will be implemented here.</p>
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
