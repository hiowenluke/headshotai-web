<template>
    <PopupLikeModal :open="open" :backdrop-blur="true" @close="close">
        <!-- 卡片内容 -->
        <div class="debug-header">
            <h2 class="title">Debug</h2>
            <button class="close-btn" @click="close" aria-label="Close debug">
                <SvgIcon name="close-outline" size="24px" />
            </button>
        </div>
        <div class="debug-body">
            <ul class="actions">
                <li>
                    <button class="action-btn" @click="clearPrefs">Clear Preferences</button>
                </li>
                <li>
                    <button class="action-btn" @click="showMessageToast">Show Message Toast</button>
                </li>
                <li>
                    <button class="action-btn" @click="showMessageLightToast">Show Message Light Toast</button>
                </li>
                <li>
                    <button class="action-btn" @click="showLoadingToast">Show Loading Toast</button>
                </li>
                <li>
                    <button class="action-btn" @click="showShortDialog">Test Dialog - Short Message</button>
                </li>
                <li>
                    <button class="action-btn" @click="showLongDialog">Test Dialog - Long Message</button>
                </li>
            </ul>
        </div>
    </PopupLikeModal>
    
    <!-- Test dialog -->
    <ConfirmDialog 
        :open="showDialog"
        title="Test Dialog"
        message="This is a test of the universal dialog component."
        cancel-text="Cancel"
        confirm-text="OK"
        @confirm="handleDialogConfirm"
        @cancel="showDialog = false"
    />
    
    <!-- Short message dialog -->
    <ConfirmDialog 
        :open="showShortMessageDialog"
        title="Short Message"
        message="Delete file?"
        cancel-text="Cancel"
        confirm-text="Delete"
        @confirm="showShortMessageDialog = false"
        @cancel="showShortMessageDialog = false"
    />
    
    <!-- Long message dialog -->
    <ConfirmDialog 
        :open="showLongMessageDialog"
        title="Long Message"
        message="Are you sure you want to permanently delete this file? This action cannot be undone and the file will be removed from all devices and backed up to trash."
        cancel-text="Cancel"
        confirm-text="Delete"
        @confirm="showLongMessageDialog = false"
        @cancel="showLongMessageDialog = false"
    />
</template>
<script setup lang="ts">
// Vue 组件导入
import { ref, defineAsyncComponent } from 'vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';
import PopupLikeModal from '@/components/popupLike/PopupLikeModal.vue';

// 确认对话框 - 懒加载（用户触发时才显示）
const ConfirmDialog = defineAsyncComponent(() => 
  import('@/components/dialog/ConfirmDialog.vue')
);

// 组件属性和事件定义
defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

// 关闭调试弹窗
function close() {
    emit('close');
}

// 测试对话框状态管理
const showDialog = ref(false);
const showShortMessageDialog = ref(false);
const showLongMessageDialog = ref(false);

// 显示短消息对话框
function showShortDialog() {
    showShortMessageDialog.value = true;
}

// 显示长消息对话框
function showLongDialog() {
    showLongMessageDialog.value = true;
}

// 处理对话框确认事件
function handleDialogConfirm() {
    console.log('[Debug] Dialog confirmed');
    showDialog.value = false;
    
    // 显示确认成功的 toast 通知
    setTimeout(() => {
        const now = new Date();
        const ts = now.toLocaleTimeString();
        window.dispatchEvent(new CustomEvent('app:toast', {
            detail: {
                message: `Dialog confirmed @ ${ts}`,
                type: 'success',
                ttl: 2000
            }
        }));
    }, 100);
}

// 清除偏好设置数据
function clearPrefs() {
    const keys = ['user_prefs_v1', 'user_prefs_shown_v1', 'ui_state_v1'];
    keys.forEach(k => { try { localStorage.removeItem(k); } catch { /* ignore */ } });
    try { console.log('[Debug] Cleared preference keys:', keys); } catch { /* ignore */ }
    alert('Preferences cleared. Please reload the page to see the first-run flow.');
}

// 显示普通消息 Toast
function showMessageToast() {
    // 先关闭调试弹窗，避免界面冲突
    try { emit('close'); } catch { /* ignore */ }
    // 延迟发送 toast 事件，避免动画重叠
    setTimeout(() => {
        const now = new Date();
        const ts = now.toLocaleTimeString();
        window.dispatchEvent(new CustomEvent('app:toast', {
            detail: {
                message: `Debug Toast @ ${ts}`,
                type: 'info',
                ttl: 3000
            }
        }));
    }, 50);
}

// 显示浅色模式 Toast
function showMessageLightToast() {
    // 先关闭调试弹窗，避免界面冲突
    try { emit('close'); } catch { /* ignore */ }
    // 延迟发送 toast 事件，避免动画重叠
    setTimeout(() => {
        const now = new Date();
        const ts = now.toLocaleTimeString();
        window.dispatchEvent(new CustomEvent('app:toast', {
            detail: {
                message: `Info Toast @ ${ts}`,
                type: 'info',
                ttl: 3000
            }
        }));
    }, 50);
}

// 显示加载中 Toast
function showLoadingToast() {
    // 先关闭调试弹窗
    try { emit('close'); } catch { /* ignore */ }
    // 延迟发送 loading toast 事件
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent('app:loading-toast', {
            detail: { show: true }
        }));
        // 2秒后自动关闭 loading toast
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('app:loading-toast', {
                detail: { show: false }
            }));
        }, 2000);
    }, 50);
}

// function testLogout() {
//     // 先关闭调试弹窗
//     try { emit('close'); } catch { /* ignore */ }
//     // 等一帧再发退出登录的 toast，模拟真实的退出登录场景
//     setTimeout(() => {
//         window.dispatchEvent(new CustomEvent('app:toast', {
//             detail: {
//                 message: "You've been logged out.",
//                 type: 'info',
//                 ttl: 3000
//             }
//         }));
//     }, 50);
// }

</script>
<style scoped>
/* 卡片内容样式 */

.debug-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.title {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 0.5px;
}

.close-btn {
    background: #4d5258;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 24px;
}

.close-btn:active {
    transform: translateY(1px);
}

.debug-body {
    margin-top: 8px;
}

.actions {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.action-btn {
    width: 100%;
    background: #2a78ff;
    color: #fff;
    border: none;
    font-size: 18px;
    font-weight: 600;
    padding: 14px 18px;
    border-radius: 16px;
    box-shadow: 0 6px 18px -4px rgba(0, 0, 0, 0.55);
    text-align: center;
}

.action-btn:active {
    transform: translateY(1px);
}
</style>
