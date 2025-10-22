<template>
    <PageLikeModal 
        :is-open="isOpen" 
        :page-title="'第二层子窗口'"
        modal-style="horizontal"
        @close="$emit('close')"
        class="third-page-demo-modal"
    >
        <div class="modal-page">
            <div class="modal-content">
                <div class="level-indicator">
                    <h1>🎯 第二层子窗口</h1>
                    <div class="breadcrumb">
                        <span class="crumb">主窗口</span>
                        <span class="arrow">→</span>
                        <span class="crumb">第一层</span>
                        <span class="arrow">→</span>
                        <span class="crumb current">第二层</span>
                    </div>
                </div>

                <div class="depth-info">
                    <div class="depth-card">
                        <h2>📊 窗口层级分析</h2>
                        <div class="layer-stack">
                            <div class="layer-item background">
                                <span class="layer-label">主窗口</span>
                                <span class="layer-status">🔒 锁定</span>
                            </div>
                            <div class="layer-item background">
                                <span class="layer-label">第一层</span>
                                <span class="layer-status">🔒 锁定</span>
                            </div>
                            <div class="layer-item active">
                                <span class="layer-label">第二层</span>
                                <span class="layer-status">✨ 当前活跃</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="technical-section">
                    <h2>⚙️ 技术细节</h2>
                    <div class="tech-grid">
                        <div class="tech-item">
                            <div class="tech-icon">🎭</div>
                            <div class="tech-content">
                                <h3>Z-Index 管理</h3>
                                <p>自动管理窗口层级，确保正确的显示顺序</p>
                            </div>
                        </div>
                        <div class="tech-item">
                            <div class="tech-icon">🔄</div>
                            <div class="tech-content">
                                <h3>状态隔离</h3>
                                <p>每个窗口都有独立的 Vue 组件状态</p>
                            </div>
                        </div>
                        <div class="tech-item">
                            <div class="tech-icon">🎨</div>
                            <div class="tech-content">
                                <h3>动画系统</h3>
                                <p>流畅的进入和退出动画</p>
                            </div>
                        </div>
                        <div class="tech-item">
                            <div class="tech-icon">📱</div>
                            <div class="tech-content">
                                <h3>手势识别</h3>
                                <p>精确的触摸手势检测和处理</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="performance-section">
                    <h2>⚡ 性能优化</h2>
                    <div class="performance-list">
                        <div class="performance-item">
                            <span class="performance-icon">🚀</span>
                            <span class="performance-text">懒加载组件，按需渲染</span>
                        </div>
                        <div class="performance-item">
                            <span class="performance-icon">💾</span>
                            <span class="performance-text">智能内存管理，自动清理</span>
                        </div>
                        <div class="performance-item">
                            <span class="performance-icon">🎯</span>
                            <span class="performance-text">事件委托，减少监听器</span>
                        </div>
                        <div class="performance-item">
                            <span class="performance-icon">⚡</span>
                            <span class="performance-text">硬件加速动画</span>
                        </div>
                    </div>
                </div>

                <div class="navigation-section">
                    <h2>🎮 继续深入</h2>
                    <p>我们已经到达第二层了！让我们看看这个系统能支持多深的嵌套。</p>
                    
                    <div class="action-buttons">
                        <button @click="openFourthPage" class="nav-btn primary">
                            🚀 打开第三层子窗口
                        </button>
                        <button @click="$emit('close')" class="nav-btn secondary">
                            🔙 返回上一层
                        </button>
                    </div>
                </div>

                <div class="experiment-section">
                    <div class="experiment-box">
                        <h3>🧪 实验观察</h3>
                        <p>在这一层，你可以观察到：</p>
                        <ul>
                            <li>背景中的两个窗口都被锁定</li>
                            <li>滑动手势只对当前窗口有效</li>
                            <li>窗口切换动画保持流畅</li>
                            <li>内存使用保持稳定</li>
                        </ul>
                        <div class="experiment-stats">
                            <div class="stat">
                                <span class="stat-label">当前层级:</span>
                                <span class="stat-value">Level 2</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">背景窗口:</span>
                                <span class="stat-value">2 个</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </PageLikeModal>
    
    <!-- 第三层子窗口 -->
    <FourthPageDemo :is-open="showFourthPage" @close="showFourthPage = false" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';
import FourthPageDemo from './FourthPageDemo.vue';

interface Props {
    isOpen: boolean;
}

defineProps<Props>();
defineEmits<{
    close: [];
}>();

const showFourthPage = ref(false);

const openFourthPage = () => {
    showFourthPage.value = true;
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
    color: #fd7e14;
}

.breadcrumb {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 12px;
    flex-wrap: wrap;
}

.crumb {
    padding: 3px 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
}

.crumb.current {
    background: #fd7e14;
    color: #fff;
    font-weight: 600;
}

.arrow {
    opacity: 0.6;
    font-size: 10px;
}

.depth-info {
    margin-bottom: 30px;
}

.depth-card {
    background: rgba(253, 126, 20, 0.1);
    border: 1px solid rgba(253, 126, 20, 0.3);
    padding: 20px;
    border-radius: 12px;
}

.depth-card h2 {
    margin: 0 0 16px 0;
    font-size: 18px;
    color: #fd7e14;
}

.layer-stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.layer-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.layer-item.background {
    background: rgba(108, 117, 125, 0.2);
    opacity: 0.6;
}

.layer-item.active {
    background: rgba(253, 126, 20, 0.2);
    border: 1px solid rgba(253, 126, 20, 0.5);
}

.layer-label {
    font-weight: 600;
}

.layer-status {
    font-size: 14px;
    opacity: 0.9;
}

.technical-section {
    margin-bottom: 30px;
}

.technical-section h2 {
    font-size: 18px;
    margin-bottom: 16px;
    color: #fff;
}

.tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
}

.tech-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: rgba(255, 255, 255, 0.03);
    padding: 16px;
    border-radius: 8px;
}

.tech-icon {
    font-size: 24px;
    flex-shrink: 0;
}

.tech-content h3 {
    margin: 0 0 6px 0;
    font-size: 14px;
    color: #fff;
}

.tech-content p {
    margin: 0;
    font-size: 13px;
    opacity: 0.8;
    line-height: 1.4;
}

.performance-section {
    margin-bottom: 30px;
}

.performance-section h2 {
    font-size: 18px;
    margin-bottom: 16px;
    color: #fff;
}

.performance-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.performance-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.03);
    padding: 12px 16px;
    border-radius: 6px;
}

.performance-icon {
    font-size: 18px;
    flex-shrink: 0;
}

.performance-text {
    font-size: 14px;
    opacity: 0.9;
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
    background: linear-gradient(135deg, #fd7e14 0%, #ff6b35 100%);
    color: #fff;
    box-shadow: 0 4px 15px rgba(253, 126, 20, 0.4);
}

.nav-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(253, 126, 20, 0.6);
}

.nav-btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-btn.secondary:hover {
    background: rgba(255, 255, 255, 0.15);
}

.experiment-section {
    margin-bottom: 20px;
}

.experiment-box {
    background: rgba(17, 141, 87, 0.1);
    border: 1px solid rgba(17, 141, 87, 0.3);
    border-radius: 8px;
    padding: 16px;
}

.experiment-box h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #118d57;
}

.experiment-box p {
    margin: 0 0 12px 0;
    opacity: 0.9;
}

.experiment-box ul {
    margin: 0 0 16px 0;
    padding-left: 20px;
}

.experiment-box li {
    margin-bottom: 4px;
    opacity: 0.8;
    font-size: 14px;
}

.experiment-stats {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
}

.stat {
    display: flex;
    align-items: center;
    gap: 8px;
}

.stat-label {
    font-size: 14px;
    opacity: 0.8;
}

.stat-value {
    font-weight: 600;
    color: #118d57;
}

@media (max-width: 768px) {
    .tech-grid {
        grid-template-columns: 1fr;
    }
    
    .action-buttons {
        width: 100%;
    }
    
    .nav-btn {
        width: 100%;
        max-width: 300px;
    }
    
    .experiment-stats {
        flex-direction: column;
        gap: 8px;
    }
}
</style>
