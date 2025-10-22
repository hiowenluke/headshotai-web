<template>
    <PageLikeModal 
        :is-open="isOpen" 
        :page-title="'PageLikeModal 演示'"
        modal-style="horizontal"
        @close="$emit('close')"
        class="main-page-demo-modal"
    >
        <div class="modal-page">
            <div class="modal-content">
                <div class="demo-header">
                    <h1>📱 PageLikeModal 功能演示</h1>
                    <p class="subtitle">多层窗口管理系统</p>
                </div>

                <div class="feature-section">
                    <h2>✨ 主要特性</h2>
                    <div class="feature-grid">
                        <div class="feature-card">
                            <div class="feature-icon">🔄</div>
                            <h3>无限嵌套</h3>
                            <p>支持无限层级的子窗口叠加</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">👆</div>
                            <h3>手势操作</h3>
                            <p>支持滑动手势关闭窗口</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">📑</div>
                            <h3>Tab 切换</h3>
                            <p>支持标签页切换与滑动</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🎨</div>
                            <h3>自定义动画</h3>
                            <p>主窗口和子窗口不同动画</p>
                        </div>
                    </div>
                </div>

                <div class="modes-section">
                    <h2>🎭 窗口模式</h2>
                    <div class="mode-list">
                        <div class="mode-item">
                            <div class="mode-badge main">MAIN</div>
                            <div class="mode-info">
                                <h3>主窗口模式</h3>
                                <p>从底部向上弹出，支持垂直滑动关闭</p>
                            </div>
                        </div>
                        <div class="mode-item">
                            <div class="mode-badge sub">SUB</div>
                            <div class="mode-info">
                                <h3>子窗口模式</h3>
                                <p>从右侧滑入，支持水平滑动关闭</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="usage-section">
                    <h2>🚀 使用方法</h2>
                    <div class="code-example">
                        <pre><code>&lt;PageLikeModal 
    :is-open="isOpen" 
    :page-title="'窗口标题'"
    modal-style="vertical|horizontal"
    @close="handleClose"
&gt;
    &lt;!-- 窗口内容 --&gt;
&lt;/PageLikeModal&gt;</code></pre>
                    </div>
                </div>

                <div class="demo-section">
                    <h2>🎮 互动演示</h2>
                    <p>点击下面的按钮体验多层窗口系统：</p>
                    <button @click="openSubPage" class="demo-btn primary">
                        🚀 打开第一层子窗口
                    </button>
                    <div class="demo-tips">
                        <p>💡 <strong>操作提示：</strong></p>
                        <ul>
                            <li>使用左上角返回按钮关闭窗口</li>
                            <li>从左边缘向右滑动关闭子窗口</li>
                            <li>从下向上滑动关闭主窗口</li>
                            <li>每个窗口都可以打开更多子窗口</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </PageLikeModal>
    
    <!-- 子窗口 -->
    <SubPageDemo :is-open="showSubPage" @close="showSubPage = false" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';
import SubPageDemo from './SubPageDemo.vue';

interface Props {
    isOpen: boolean;
}

defineProps<Props>();
defineEmits<{
    close: [];
}>();

const showSubPage = ref(false);

const openSubPage = () => {
    showSubPage.value = true;
};
</script>

<style scoped>
.demo-header {
    text-align: center;
    margin-bottom: 30px;
}

.demo-header h1 {
    font-size: 28px;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.subtitle {
    font-size: 16px;
    opacity: 0.8;
    margin: 0;
}

.feature-section {
    margin-bottom: 30px;
}

.feature-section h2 {
    font-size: 20px;
    margin-bottom: 16px;
    color: #fff;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
}

.feature-card {
    background: rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    backdrop-filter: blur(10px);
}

.feature-icon {
    font-size: 32px;
    margin-bottom: 12px;
}

.feature-card h3 {
    font-size: 16px;
    margin: 0 0 8px 0;
    color: #fff;
}

.feature-card p {
    font-size: 14px;
    margin: 0;
    opacity: 0.8;
    line-height: 1.4;
}

.modes-section {
    margin-bottom: 30px;
}

.modes-section h2 {
    font-size: 20px;
    margin-bottom: 16px;
    color: #fff;
}

.mode-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.mode-item {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    padding: 16px;
    border-radius: 8px;
}

.mode-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    margin-right: 16px;
    min-width: 50px;
    text-align: center;
}

.mode-badge.main {
    background: #2a78ff;
    color: #fff;
}

.mode-badge.sub {
    background: #28a745;
    color: #fff;
}

.mode-info h3 {
    margin: 0 0 4px 0;
    font-size: 16px;
    color: #fff;
}

.mode-info p {
    margin: 0;
    font-size: 14px;
    opacity: 0.8;
}

.usage-section {
    margin-bottom: 30px;
}

.usage-section h2 {
    font-size: 20px;
    margin-bottom: 16px;
    color: #fff;
}

.code-example {
    background: rgba(0, 0, 0, 0.3);
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
}

.code-example pre {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 13px;
    line-height: 1.4;
    color: #e6e6e6;
}

.demo-section {
    text-align: center;
}

.demo-section h2 {
    font-size: 20px;
    margin-bottom: 16px;
    color: #fff;
}

.demo-section p {
    margin-bottom: 20px;
    opacity: 0.9;
}

.demo-btn {
    display: inline-block;
    padding: 16px 32px;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    margin: 8px;
}

.demo-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.demo-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.demo-tips {
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid rgba(255, 193, 7, 0.3);
    border-radius: 8px;
    padding: 16px;
    margin-top: 20px;
    text-align: left;
}

.demo-tips p {
    margin: 0 0 8px 0;
    color: #ffc107;
    font-weight: 600;
}

.demo-tips ul {
    margin: 0;
    padding-left: 20px;
}

.demo-tips li {
    margin-bottom: 4px;
    opacity: 0.9;
}

@media (max-width: 768px) {
    .feature-grid {
        grid-template-columns: 1fr;
    }
    
    .mode-item {
        flex-direction: column;
        text-align: center;
        gap: 8px;
    }
    
    .mode-badge {
        margin-right: 0;
    }
}
</style>
