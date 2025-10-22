<template>
    <PageLikeModal 
        :is-open="isOpen" 
        :page-title="'Third Layer'"
        modal-style="horizontal"
        @close="$emit('close')"
        class="generator-third-page-modal"
    >
        <div class="modal-page">
            <div class="modal-content">
                <h2>第三层窗口</h2>
                <p>这是第三层全屏窗口，演示了深层嵌套的多层窗口功能。</p>
                <p>当前窗口层级：</p>
                <div class="layer-info">
                    <div class="layer">主页 (HomePage)</div>
                    <div class="arrow">↓</div>
                    <div class="layer">生成器页面 (GeneratorPage)</div>
                    <div class="arrow">↓</div>
                    <div class="layer">子页面 (GeneratorSubPage)</div>
                    <div class="arrow">↓</div>
                    <div class="layer current">第三层 (GeneratorThirdPage) ← 当前</div>
                </div>
                
                <p>所有层级都支持：</p>
                <ul>
                    <li>手势滑动关闭</li>
                    <li>返回按钮关闭</li>
                    <li>主页滑动锁定</li>
                    <li>独立的状态管理</li>
                </ul>
                
                <button @click="$emit('close')" class="close-btn">
                    关闭第三层
                </button>
            </div>
        </div>
    </PageLikeModal>
</template>

<script setup lang="ts">
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';

interface Props {
    isOpen: boolean;
}

defineProps<Props>();
defineEmits<{
    close: [];
}>();
</script>

<style scoped>
.layer-info {
    background: rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 10px;
    margin: 20px 0;
    text-align: center;
}

.layer {
    padding: 8px 12px;
    margin: 5px 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    font-weight: 500;
}

.layer.current {
    background: #2a78ff;
    color: #fff;
    font-weight: 700;
}

.arrow {
    font-size: 20px;
    color: #888;
    margin: 5px 0;
}

.close-btn {
    display: block;
    width: 100%;
    max-width: 300px;
    margin: 20px auto;
    padding: 15px 20px;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #d40000;
    color: #fff;
}

.close-btn:hover {
    background: #b30000;
}
</style>