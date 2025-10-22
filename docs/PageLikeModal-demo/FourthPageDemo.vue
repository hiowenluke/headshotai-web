<template>
    <PageLikeModal 
        :is-open="isOpen" 
        :page-title="'第三层子窗口'"
        modal-style="horizontal"
        @close="$emit('close')"
        class="fourth-page-demo-modal"
    >
        <div class="modal-page">
            <div class="modal-content">
                <div class="level-indicator">
                    <h1>🎯 第三层子窗口</h1>
                    <div class="breadcrumb">
                        <span class="crumb mini">主窗口</span>
                        <span class="arrow">→</span>
                        <span class="crumb mini">第一层</span>
                        <span class="arrow">→</span>
                        <span class="crumb mini">第二层</span>
                        <span class="arrow">→</span>
                        <span class="crumb current">第三层</span>
                    </div>
                </div>

                <div class="achievement-section">
                    <div class="achievement-card">
                        <div class="achievement-icon">🏆</div>
                        <h2>深度探索成就</h2>
                        <p>恭喜！你已经深入到第三层窗口了</p>
                        <div class="achievement-stats">
                            <div class="achievement-stat">
                                <span class="stat-number">4</span>
                                <span class="stat-label">个窗口</span>
                            </div>
                            <div class="achievement-stat">
                                <span class="stat-number">3</span>
                                <span class="stat-label">层深度</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="system-info">
                    <h2>🔧 系统状态</h2>
                    <div class="status-grid">
                        <div class="status-item good">
                            <div class="status-icon">✅</div>
                            <div class="status-content">
                                <div class="status-title">内存管理</div>
                                <div class="status-desc">正常运行</div>
                            </div>
                        </div>
                        <div class="status-item good">
                            <div class="status-icon">✅</div>
                            <div class="status-content">
                                <div class="status-title">动画性能</div>
                                <div class="status-desc">流畅运行</div>
                            </div>
                        </div>
                        <div class="status-item good">
                            <div class="status-icon">✅</div>
                            <div class="status-content">
                                <div class="status-title">手势识别</div>
                                <div class="status-desc">响应正常</div>
                            </div>
                        </div>
                        <div class="status-item good">
                            <div class="status-icon">✅</div>
                            <div class="status-content">
                                <div class="status-title">状态隔离</div>
                                <div class="status-desc">完全独立</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="architecture-section">
                    <h2>🏗️ 架构优势</h2>
                    <div class="advantage-list">
                        <div class="advantage-item">
                            <div class="advantage-number">1</div>
                            <div class="advantage-content">
                                <h3>无限嵌套</h3>
                                <p>理论上支持无限深度的窗口嵌套，实际受设备内存限制</p>
                            </div>
                        </div>
                        <div class="advantage-item">
                            <div class="advantage-number">2</div>
                            <div class="advantage-content">
                                <h3>自动管理</h3>
                                <p>系统自动管理 z-index、事件处理、内存回收等复杂逻辑</p>
                            </div>
                        </div>
                        <div class="advantage-item">
                            <div class="advantage-number">3</div>
                            <div class="advantage-content">
                                <h3>性能优化</h3>
                                <p>背景窗口冻结交互，减少不必要的计算和渲染</p>
                            </div>
                        </div>
                        <div class="advantage-item">
                            <div class="advantage-number">4</div>
                            <div class="advantage-content">
                                <h3>用户体验</h3>
                                <p>统一的手势操作和动画效果，直观的层级管理</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="navigation-section">
                    <h2>🎮 终极挑战</h2>
                    <p>我们已经来到了第三层，系统依然稳定运行。要不要挑战第四层？</p>
                    
                    <div class="action-buttons">
                        <button @click="openFifthPage" class="nav-btn primary">
                            🚀 挑战第四层！
                        </button>
                        <button @click="$emit('close')" class="nav-btn secondary">
                            🔙 返回上一层
                        </button>
                    </div>
                </div>

                <div class="warning-section">
                    <div class="warning-box">
                        <h3>⚠️ 深度提醒</h3>
                        <p>当前已处于较深的窗口层级中：</p>
                        <div class="warning-content">
                            <ul>
                                <li>建议不要过度嵌套窗口</li>
                                <li>每增加一层都会消耗更多内存</li>
                                <li>用户可能会迷失在层级中</li>
                                <li>建议为复杂流程设计更好的导航</li>
                            </ul>
                            <div class="warning-tip">
                                💡 在实际应用中，通常3-4层嵌套已经足够满足大部分需求
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </PageLikeModal>
    
    <!-- 第四层子窗口 -->
    <FifthPageDemo :is-open="showFifthPage" @close="showFifthPage = false" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';
import FifthPageDemo from './FifthPageDemo.vue';

interface Props {
    isOpen: boolean;
}

defineProps<Props>();
defineEmits<{
    close: [];
}>();

const showFifthPage = ref(false);

const openFifthPage = () => {
    showFifthPage.value = true;
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
    color: #e83e8c;
}

.breadcrumb {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 11px;
    flex-wrap: wrap;
}

.crumb {
    padding: 2px 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
}

.crumb.mini {
    font-size: 10px;
    padding: 1px 4px;
}

.crumb.current {
    background: #e83e8c;
    color: #fff;
    font-weight: 600;
}

.arrow {
    opacity: 0.6;
    font-size: 8px;
}

.achievement-section {
    margin-bottom: 30px;
}

.achievement-card {
    background: linear-gradient(135deg, rgba(232, 62, 140, 0.2) 0%, rgba(232, 62, 140, 0.1) 100%);
    border: 1px solid rgba(232, 62, 140, 0.3);
    padding: 24px;
    border-radius: 16px;
    text-align: center;
}

.achievement-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.achievement-card h2 {
    margin: 0 0 8px 0;
    font-size: 20px;
    color: #e83e8c;
}

.achievement-card p {
    margin: 0 0 20px 0;
    opacity: 0.9;
}

.achievement-stats {
    display: flex;
    justify-content: center;
    gap: 32px;
}

.achievement-stat {
    text-align: center;
}

.stat-number {
    display: block;
    font-size: 32px;
    font-weight: 700;
    color: #e83e8c;
    line-height: 1;
}

.stat-label {
    font-size: 14px;
    opacity: 0.8;
    margin-top: 4px;
}

.system-info {
    margin-bottom: 30px;
}

.system-info h2 {
    font-size: 18px;
    margin-bottom: 16px;
    color: #fff;
}

.status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
}

.status-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
}

.status-item.good {
    border-left: 3px solid #28a745;
    background: rgba(40, 167, 69, 0.1);
}

.status-icon {
    font-size: 16px;
    flex-shrink: 0;
}

.status-title {
    font-weight: 600;
    font-size: 14px;
    color: #fff;
}

.status-desc {
    font-size: 12px;
    opacity: 0.8;
    margin-top: 2px;
}

.architecture-section {
    margin-bottom: 30px;
}

.architecture-section h2 {
    font-size: 18px;
    margin-bottom: 16px;
    color: #fff;
}

.advantage-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.advantage-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    background: rgba(255, 255, 255, 0.03);
    padding: 16px;
    border-radius: 8px;
}

.advantage-number {
    width: 32px;
    height: 32px;
    background: #e83e8c;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
}

.advantage-content h3 {
    margin: 0 0 6px 0;
    font-size: 16px;
    color: #fff;
}

.advantage-content p {
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
    background: linear-gradient(135deg, #e83e8c 0%, #fd1d7c 100%);
    color: #fff;
    box-shadow: 0 4px 15px rgba(232, 62, 140, 0.4);
}

.nav-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(232, 62, 140, 0.6);
}

.nav-btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-btn.secondary:hover {
    background: rgba(255, 255, 255, 0.15);
}

.warning-section {
    margin-bottom: 20px;
}

.warning-box {
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid rgba(255, 193, 7, 0.3);
    border-radius: 8px;
    padding: 16px;
}

.warning-box h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #ffc107;
}

.warning-box p {
    margin: 0 0 12px 0;
    opacity: 0.9;
}

.warning-content ul {
    margin: 0 0 16px 0;
    padding-left: 20px;
}

.warning-content li {
    margin-bottom: 4px;
    opacity: 0.8;
    font-size: 14px;
}

.warning-tip {
    background: rgba(255, 193, 7, 0.15);
    padding: 12px;
    border-radius: 6px;
    font-size: 14px;
    border-left: 3px solid #ffc107;
}

@media (max-width: 768px) {
    .achievement-stats {
        gap: 20px;
    }
    
    .status-grid {
        grid-template-columns: 1fr;
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
