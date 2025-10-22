<template>
    <PageLikeModal :is-open="isOpen" page-title="Refund Policy" modal-style="horizontal" @close="$emit('close')">
        <div class="modal-page">
            <div class="modal-content">
                <div class="page-wrapper">
                    <h2>Refund Policy</h2>
                    <p class="desc">Our refund policy for your peace of mind.</p>
                    <p class="meta">Refund policy content will be implemented here.</p>
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
