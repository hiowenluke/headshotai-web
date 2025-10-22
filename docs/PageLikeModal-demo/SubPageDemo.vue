<template>
    <PageLikeModal 
        :is-open="isOpen" 
        :page-title="'第一层子窗口'"
        modal-style="horizontal"
        @close="$emit('close')"
        class="sub-page-demo-modal"
    >
        <div class="modal-page">
            <div class="modal-content">
                <div class="level-indicator">
                    <h1>🎯 第一层子窗口</h1>
                    <div class="breadcrumb">
                        <span class="crumb">主窗口</span>
                        <span class="arrow">→</span>
                        <span class="crumb current">第一层</span>
                    </div>
                </div>

                <div class="info-section">
                    <div class="info-card">
                        <h2>📋 当前窗口信息</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">窗口类型：</span>
                                <span class="value">子窗口 (SUB)</span>
                            </div>
                            <div class="info-item">
                                <span class="label">动画方向：</span>
                                <span class="value">水平滑入 (从右到左)</span>
                            </div>
                            <div class="info-item">
                                <span class="label">关闭手势：</span>
                                <span class="value">从左边缘向右滑动</span>
                            </div>
                            <div class="info-item">
                                <span class="label">层级深度：</span>
                                <span class="value">Level 1</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="features-section">
                    <h2>🛠️ 子窗口特性</h2>
                    <div class="feature-list">
                        <div class="feature-item">
                            <div class="feature-icon">🔙</div>
                            <div class="feature-text">
                                <strong>返回按钮</strong>
                                <p>左上角提供返回按钮，点击可关闭当前窗口</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">👈</div>
                            <div class="feature-text">
                                <strong>滑动关闭</strong>
                                <p>从屏幕左边缘向右滑动可关闭当前窗口</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">🔒</div>
                            <div class="feature-text">
                                <strong>背景锁定</strong>
                                <p>后台窗口的手势操作被自动锁定</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">📱</div>
                            <div class="feature-text">
                                <strong>独立状态</strong>
                                <p>每个窗口都有独立的状态管理</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="navigation-section">
                    <h2>🎮 继续探索</h2>
                    <p>这个多层窗口系统支持无限深度的嵌套，让我们继续向下一层进发！</p>
                    
                    <div class="action-buttons">
                        <button @click="openThirdPage" class="nav-btn primary">
                            🚀 打开第二层子窗口
                        </button>
                        <button @click="$emit('close')" class="nav-btn secondary">
                            🔙 返回主窗口
                        </button>
                    </div>
                </div>

                <div class="tips-section">
                    <div class="tip-box">
                        <h3>💡 操作提示</h3>
                        <ul>
                            <li>尝试从左边缘向右滑动关闭此窗口</li>
                            <li>注意观察主窗口已被锁定，无法操作</li>
                            <li>子窗口支持独立的滚动和交互</li>
                            <li>可以继续打开更多层级的子窗口</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </PageLikeModal>
    
    <!-- 第二层子窗口 -->
    <ThirdPageDemo :is-open="showThirdPage" @close="showThirdPage = false" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';
import ThirdPageDemo from './ThirdPageDemo.vue';

interface Props {
    isOpen: boolean;
}

defineProps<Props>();
defineEmits<{
    close: [];
}>();

const showThirdPage = ref(false);

const openThirdPage = () => {
    showThirdPage.value = true;
};
</script>

<style scoped>
.level-indicator {
    text-align: center;
    margin-bottom: 30px;
}

.level-indicator h1 {
    font-size: 24px;
    margin-bottom: 12px;
    color: #28a745;
}

.breadcrumb {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
}

.crumb {
    padding: 4px 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16px;
}

.crumb.current {
    background: #28a745;
    color: #fff;
    font-weight: 600;
}

.arrow {
    opacity: 0.6;
}

.info-section {
    margin-bottom: 30px;
}

.info-card {
    background: rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-card h2 {
    margin: 0 0 16px 0;
    font-size: 18px;
    color: #fff;
}

.info-grid {
    display: grid;
    gap: 12px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item:last-child {
    border-bottom: none;
}

.label {
    font-weight: 500;
    opacity: 0.8;
}

.value {
    font-weight: 600;
    color: #28a745;
}

.features-section {
    margin-bottom: 30px;
}

.features-section h2 {
    font-size: 18px;
    margin-bottom: 16px;
    color: #fff;
}

.feature-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.feature-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    background: rgba(255, 255, 255, 0.03);
    padding: 16px;
    border-radius: 8px;
}

.feature-icon {
    font-size: 24px;
    flex-shrink: 0;
}

.feature-text {
    flex: 1;
}

.feature-text strong {
    display: block;
    margin-bottom: 4px;
    color: #fff;
}

.feature-text p {
    margin: 0;
    font-size: 14px;
    opacity: 0.8;
    line-height: 1.4;
}

.navigation-section {
    margin-bottom: 30px;
    text-align: center;
}

.navigation-section h2 {
    font-size: 18px;
    margin-bottom: 12px;
    color: #fff;
}

.navigation-section p {
    margin-bottom: 20px;
    opacity: 0.9;
}

.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
}

.nav-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 20px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 200px;
}

.nav-btn.primary {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: #fff;
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
}

.nav-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(40, 167, 69, 0.6);
}

.nav-btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-btn.secondary:hover {
    background: rgba(255, 255, 255, 0.15);
}

.tips-section {
    margin-bottom: 20px;
}

.tip-box {
    background: rgba(32, 201, 151, 0.1);
    border: 1px solid rgba(32, 201, 151, 0.3);
    border-radius: 8px;
    padding: 16px;
}

.tip-box h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #20c997;
}

.tip-box ul {
    margin: 0;
    padding-left: 20px;
}

.tip-box li {
    margin-bottom: 6px;
    opacity: 0.9;
    line-height: 1.4;
}

@media (max-width: 768px) {
    .info-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }
    
    .action-buttons {
        width: 100%;
    }
    
    .nav-btn {
        width: 100%;
        max-width: 300px;
    }
}
</style>
