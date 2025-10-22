<template>
    <PageLikeModal 
        :is-open="isOpen" 
        :page-title="'终极深度'"
        modal-style="horizontal"
        @close="$emit('close')"
        class="fifth-page-demo-modal"
    >
        <div class="modal-page">
            <div class="modal-content">
                <div class="level-indicator">
                    <h1>🎖️ 终极深度</h1>
                    <div class="breadcrumb">
                        <span class="crumb ultra-mini">主</span>
                        <span class="arrow">→</span>
                        <span class="crumb ultra-mini">1</span>
                        <span class="arrow">→</span>
                        <span class="crumb ultra-mini">2</span>
                        <span class="arrow">→</span>
                        <span class="crumb ultra-mini">3</span>
                        <span class="arrow">→</span>
                        <span class="crumb current">4</span>
                    </div>
                    <div class="depth-badge">
                        <span class="depth-number">5</span>
                        <span class="depth-label">个窗口</span>
                    </div>
                </div>

                <div class="ultimate-achievement">
                    <div class="ultimate-card">
                        <div class="ultimate-icon">🏅</div>
                        <h1>终极探索者</h1>
                        <p>你已经到达了演示系统的最深层！</p>
                        <div class="ultimate-stats">
                            <div class="ultimate-stat">
                                <span class="stat-big">5</span>
                                <span class="stat-label">个窗口</span>
                            </div>
                            <div class="ultimate-stat">
                                <span class="stat-big">4</span>
                                <span class="stat-label">层深度</span>
                            </div>
                            <div class="ultimate-stat">
                                <span class="stat-big">100%</span>
                                <span class="stat-label">完成度</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="system-overview">
                    <h2>🎯 系统概览</h2>
                    <div class="overview-grid">
                        <div class="overview-card memory">
                            <div class="card-icon">💾</div>
                            <h3>内存管理</h3>
                            <div class="stat-value">优秀</div>
                            <p>每个窗口独立管理，自动垃圾回收</p>
                        </div>
                        <div class="overview-card performance">
                            <div class="card-icon">⚡</div>
                            <h3>性能表现</h3>
                            <div class="stat-value">流畅</div>
                            <p>背景窗口冻结，减少资源消耗</p>
                        </div>
                        <div class="overview-card architecture">
                            <div class="card-icon">🏗️</div>
                            <h3>架构设计</h3>
                            <div class="stat-value">稳定</div>
                            <p>组件化设计，高度可复用</p>
                        </div>
                        <div class="overview-card user-experience">
                            <div class="card-icon">✨</div>
                            <h3>用户体验</h3>
                            <div class="stat-value">优质</div>
                            <p>统一手势，流畅动画</p>
                        </div>
                    </div>
                </div>

                <div class="technical-details">
                    <h2>⚙️ 技术实现</h2>
                    <div class="tech-list">
                        <div class="tech-item">
                            <div class="tech-label">框架:</div>
                            <div class="tech-value">Vue 3 Composition API</div>
                        </div>
                        <div class="tech-item">
                            <div class="tech-label">UI框架:</div>
                            <div class="tech-value">Ionic 7</div>
                        </div>
                        <div class="tech-item">
                            <div class="tech-label">动画:</div>
                            <div class="tech-value">CSS3 Transform + Transition</div>
                        </div>
                        <div class="tech-item">
                            <div class="tech-label">手势识别:</div>
                            <div class="tech-value">Touch Events + 自定义逻辑</div>
                        </div>
                        <div class="tech-item">
                            <div class="tech-label">状态管理:</div>
                            <div class="tech-value">独立组件状态</div>
                        </div>
                        <div class="tech-item">
                            <div class="tech-label">层级管理:</div>
                            <div class="tech-value">动态 z-index 计算</div>
                        </div>
                    </div>
                </div>

                <div class="recommendation-section">
                    <h2>💡 最佳实践建议</h2>
                    <div class="recommendations">
                        <div class="recommendation-item best">
                            <div class="rec-icon">✅</div>
                            <div class="rec-content">
                                <h3>推荐做法</h3>
                                <ul>
                                    <li>限制嵌套深度在 3-4 层</li>
                                    <li>为每个窗口提供清晰的标题</li>
                                    <li>实现面包屑导航</li>
                                    <li>提供快速返回按钮</li>
                                </ul>
                            </div>
                        </div>
                        <div class="recommendation-item avoid">
                            <div class="rec-icon">❌</div>
                            <div class="rec-content">
                                <h3>避免做法</h3>
                                <ul>
                                    <li>过度嵌套导致用户迷失</li>
                                    <li>缺乏返回机制</li>
                                    <li>窗口间状态依赖过强</li>
                                    <li>忽略移动端体验</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="final-section">
                    <h2>🎉 演示完成</h2>
                    <p>恭喜你完成了 PageLikeModal 的完整演示！</p>
                    <p>这个系统展示了无限嵌套窗口的可能性，但在实际应用中请合理控制深度。</p>
                    
                    <div class="final-actions">
                        <button @click="$emit('close')" class="final-btn primary">
                            🎯 完成演示
                        </button>
                        <div class="celebration-note">
                            <div class="celebration-icon">🎊</div>
                            <span>感谢你的耐心探索！</span>
                        </div>
                    </div>
                </div>

                <div class="credits">
                    <div class="credits-content">
                        <h3>开发说明</h3>
                        <p>PageLikeModal 是一个强大而灵活的模态窗口系统，支持：</p>
                        <div class="feature-tags">
                            <span class="tag">无限嵌套</span>
                            <span class="tag">手势操作</span>
                            <span class="tag">流畅动画</span>
                            <span class="tag">响应式设计</span>
                            <span class="tag">类型安全</span>
                        </div>
                        <div class="tech-note">
                            使用 Vue 3 + TypeScript + Ionic 构建
                        </div>
                    </div>
                </div>
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
.level-indicator {
    text-align: center;
    margin-bottom: 30px;
}

.level-indicator h1 {
    font-size: 26px;
    margin-bottom: 12px;
    background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.breadcrumb {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    font-size: 10px;
    flex-wrap: wrap;
    margin-bottom: 16px;
}

.crumb {
    padding: 2px 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
}

.crumb.ultra-mini {
    font-size: 9px;
    padding: 1px 3px;
}

.crumb.current {
    background: #ffd700;
    color: #000;
    font-weight: 700;
}

.arrow {
    opacity: 0.5;
    font-size: 7px;
}

.depth-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 140, 0, 0.2) 100%);
    border: 1px solid rgba(255, 215, 0, 0.4);
    padding: 8px 16px;
    border-radius: 20px;
}

.depth-number {
    font-size: 20px;
    font-weight: 700;
    color: #ffd700;
}

.depth-label {
    font-size: 12px;
    opacity: 0.9;
}

.ultimate-achievement {
    margin-bottom: 30px;
}

.ultimate-card {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 140, 0, 0.1) 100%);
    border: 2px solid rgba(255, 215, 0, 0.4);
    padding: 30px;
    border-radius: 20px;
    text-align: center;
}

.ultimate-icon {
    font-size: 64px;
    margin-bottom: 20px;
}

.ultimate-card h1 {
    margin: 0 0 12px 0;
    font-size: 28px;
    background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.ultimate-card p {
    margin: 0 0 24px 0;
    font-size: 16px;
    opacity: 0.9;
}

.ultimate-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
}

.ultimate-stat {
    text-align: center;
}

.stat-big {
    display: block;
    font-size: 36px;
    font-weight: 700;
    background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
}

.stat-label {
    font-size: 14px;
    opacity: 0.8;
    margin-top: 6px;
}

.system-overview {
    margin-bottom: 30px;
}

.system-overview h2 {
    font-size: 18px;
    margin-bottom: 16px;
    color: #fff;
}

.overview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
}

.overview-card {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    transition: transform 0.3s ease;
}

.overview-card:hover {
    transform: translateY(-4px);
}

.card-icon {
    font-size: 32px;
    margin-bottom: 12px;
}

.overview-card h3 {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #fff;
}

.stat-value {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 12px;
    color: #28a745;
}

.overview-card p {
    margin: 0;
    font-size: 12px;
    opacity: 0.7;
    line-height: 1.3;
}

.technical-details {
    margin-bottom: 30px;
}

.technical-details h2 {
    font-size: 18px;
    margin-bottom: 16px;
    color: #fff;
}

.tech-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.tech-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.03);
    padding: 12px 16px;
    border-radius: 8px;
}

.tech-label {
    font-weight: 600;
    color: #ffd700;
    font-size: 14px;
}

.tech-value {
    font-size: 14px;
    opacity: 0.9;
}

.recommendation-section {
    margin-bottom: 30px;
}

.recommendation-section h2 {
    font-size: 18px;
    margin-bottom: 16px;
    color: #fff;
}

.recommendations {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
}

.recommendation-item {
    display: flex;
    gap: 16px;
    padding: 16px;
    border-radius: 8px;
}

.recommendation-item.best {
    background: rgba(40, 167, 69, 0.1);
    border-left: 3px solid #28a745;
}

.recommendation-item.avoid {
    background: rgba(220, 53, 69, 0.1);
    border-left: 3px solid #dc3545;
}

.rec-icon {
    font-size: 20px;
    flex-shrink: 0;
}

.rec-content h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #fff;
}

.rec-content ul {
    margin: 0;
    padding-left: 16px;
}

.rec-content li {
    font-size: 13px;
    opacity: 0.8;
    margin-bottom: 4px;
}

.final-section {
    margin-bottom: 30px;
    text-align: center;
}

.final-section h2 {
    font-size: 20px;
    margin-bottom: 16px;
    color: #fff;
}

.final-section p {
    margin-bottom: 12px;
    opacity: 0.9;
}

.final-actions {
    margin-top: 24px;
}

.final-btn {
    padding: 16px 32px;
    border: none;
    border-radius: 25px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
    color: #000;
    box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
}

.final-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.6);
}

.celebration-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
    font-size: 14px;
    opacity: 0.8;
}

.celebration-icon {
    font-size: 16px;
}

.credits {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
}

.credits-content h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #fff;
}

.credits-content p {
    margin: 0 0 16px 0;
    opacity: 0.8;
    font-size: 14px;
}

.feature-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
}

.tag {
    background: rgba(255, 215, 0, 0.2);
    border: 1px solid rgba(255, 215, 0, 0.4);
    color: #ffd700;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.tech-note {
    font-size: 12px;
    opacity: 0.6;
    text-align: center;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
    .ultimate-stats {
        gap: 24px;
    }
    
    .overview-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .recommendations {
        grid-template-columns: 1fr;
    }
    
    .feature-tags {
        justify-content: center;
    }
}
</style>
