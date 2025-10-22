<template>
    <PageLikeModal 
        :is-open="isOpen" 
        :page-title="'Generator Sub Page'"
        modal-style="horizontal"
        @close="$emit('close')"
        class="generator-sub-page-modal"
    >
        <div class="modal-page">
            <div class="modal-content">
                <h2>这是从 GeneratorPage 打开的子页面</h2>
                <p>这演示了多层全屏窗口的功能。</p>
                <p>你可以：</p>
                <ul>
                    <li>使用左上角的返回按钮关闭</li>
                    <li>从左边缘向右滑动关闭</li>
                    <li>主页的滑动手势已被完全锁定</li>
                </ul>
                
                <button @click="openAnotherLayer" class="action-btn">
                    打开第三层窗口
                </button>
                
                <button @click="$emit('close')" class="close-btn">
                    关闭此页面
                </button>
            </div>
        </div>
    </PageLikeModal>
    
    <!-- 第三层窗口 -->
    <GeneratorThirdPage :is-open="showThirdPage" @close="showThirdPage = false" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';
import GeneratorThirdPage from './GeneratorThirdPage.vue';

interface Props {
    isOpen: boolean;
}

defineProps<Props>();
defineEmits<{
    close: [];
}>();

const showThirdPage = ref(false);

const openAnotherLayer = () => {
    showThirdPage.value = true;
};
</script>

<style scoped>
.action-btn, .close-btn {
    display: block;
    width: 100%;
    max-width: 300px;
    margin: 10px auto;
    padding: 15px 20px;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.action-btn {
    background: #2a78ff;
    color: #fff;
}

.action-btn:hover {
    background: #1e5fd1;
}

.close-btn {
    background: #666;
    color: #fff;
}

.close-btn:hover {
    background: #555;
}
</style>