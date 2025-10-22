<template>
    <PageLikeModal :is-open="isOpen" page-title="Preferences" modal-style="horizontal" @close="$emit('close')">
            <div class="content">
                <!-- Gender 选项组 -->
                <div class="section-group">
                    <div class="section-header">Gender</div>
                    <div class="section-items">
                        <button 
                            v-for="option in genderOptions" 
                            :key="option"
                            class="section-item"
                            :class="{ active: model.gender === option }"
                            @click="() => select('gender', option)"
                        >
                            <span class="item-label">{{ option }}</span>
                            <span class="item-check" v-if="model.gender === option">
                                <SvgIcon name="checkmark-outline" size="20px" />
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Ethnicity 选项组 -->
                <div class="section-group">
                    <div class="section-header">Ethnicity</div>
                    <div class="section-items">
                        <button 
                            v-for="option in ethnicityOptions" 
                            :key="option"
                            class="section-item"
                            :class="{ active: model.ethnicity === option }"
                            @click="() => select('ethnicity', option)"
                        >
                            <span class="item-label">{{ option }}</span>
                            <span class="item-check" v-if="model.ethnicity === option">
                                <SvgIcon name="checkmark-outline" size="20px" />
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Age 选项组 -->
                <div class="section-group">
                    <div class="section-header">Age</div>
                    <div class="section-items">
                        <button 
                            v-for="option in ageOptions" 
                            :key="option"
                            class="section-item"
                            :class="{ active: model.age === option }"
                            @click="() => select('age', option)"
                        >
                            <span class="item-label">{{ option }}</span>
                            <span class="item-check" v-if="model.age === option">
                                <SvgIcon name="checkmark-outline" size="20px" />
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Body Size 选项组 -->
                <div class="section-group">
                    <div class="section-header">Body Size</div>
                    <div class="section-items">
                        <button 
                            v-for="option in bodySizeOptions" 
                            :key="option"
                            class="section-item"
                            :class="{ active: model.bodySize === option }"
                            @click="() => select('bodySize', option)"
                        >
                            <span class="item-label">{{ option }}</span>
                            <span class="item-check" v-if="model.bodySize === option">
                                <SvgIcon name="checkmark-outline" size="20px" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
    </PageLikeModal>
</template>

<script setup lang="ts">
import PageLikeModal from '@/components/pageLike/PageLikeModal.vue';
import { reactive, watch } from 'vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';

type PrefKeys = 'gender' | 'ethnicity' | 'age' | 'bodySize';

interface Prefs {
    gender: string;
    ethnicity: string;
    age: string;
    bodySize: string;
}

const props = defineProps<{ isOpen: boolean; value?: Prefs }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'update:value', v: Prefs): void; (e: 'applied', v: Prefs): void }>();

const model = reactive<Prefs>({
    gender: 'Female',
    ethnicity: 'White',
    age: 'Middle',
    bodySize: 'M',
});

// 直接从localStorage加载偏好设置
function loadPreferencesFromStorage() {
    try {
        const saved = localStorage.getItem(PREF_KEY);
        if (saved) {
            const savedPrefs = JSON.parse(saved);
            
            // 将保存的小写格式转换为界面显示用的首字母大写格式
            const displayValue = { ...savedPrefs };
            if (displayValue.gender) {
                displayValue.gender = displayValue.gender.charAt(0).toUpperCase() + displayValue.gender.slice(1);
            }
            if (displayValue.ethnicity) {
                displayValue.ethnicity = displayValue.ethnicity.charAt(0).toUpperCase() + displayValue.ethnicity.slice(1);
            }
            if (displayValue.age) {
                displayValue.age = displayValue.age.charAt(0).toUpperCase() + displayValue.age.slice(1);
            }
            if (displayValue.bodySize) {
                displayValue.bodySize = displayValue.bodySize.toUpperCase();
            }
            Object.assign(model, displayValue);
        }
    } catch (error) {
        console.error('Failed to load preferences from localStorage:', error);
    }
}

// 监听页面打开状态，每次打开时重新加载数据
watch(
    () => props.isOpen,
    (isOpen) => {
        if (isOpen) {
            // 页面打开时重新从localStorage加载最新数据
            loadPreferencesFromStorage();
        }
    }
);

watch(
    () => props.value,
    (v) => {
        if (v) {
            // 将保存的小写格式转换为界面显示用的首字母大写格式
            const displayValue = { ...v };
            if (displayValue.gender) {
                displayValue.gender = displayValue.gender.charAt(0).toUpperCase() + displayValue.gender.slice(1);
            }
            if (displayValue.age) {
                displayValue.age = displayValue.age.charAt(0).toUpperCase() + displayValue.age.slice(1);
            }
            if (displayValue.bodySize) {
                displayValue.bodySize = displayValue.bodySize.toUpperCase();
            }
            
            // 开发环境下的调试信息（已移除）
            
            Object.assign(model, displayValue);
            
            // 模型更新完成
        }
    },
    { immediate: true }
);

// 选项数据
const genderOptions = ['Male', 'Female'];
const ethnicityOptions = ['White', 'Black', 'Hispanic', 'Asian'];
const ageOptions = ['Young', 'Middle', 'Elderly'];
const bodySizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];

const PREF_KEY = 'user_prefs_v1';
const PREF_SHOWN_KEY = 'user_prefs_shown_v1';

function select(key: PrefKeys, value: string) {
    (model as any)[key] = value;
    const updatedPrefs = { ...model };
    emit('update:value', updatedPrefs);
    
    // 直接保存到 localStorage
    const payload = { ...updatedPrefs } as Prefs;
    
    // 保存时将字段转为小写（仅存储/事件，不影响界面显示）
    if (payload.gender) (payload as any).gender = payload.gender.toLowerCase();
    if (payload.age) (payload as any).age = payload.age.toLowerCase();
    if (payload.bodySize) (payload as any).bodySize = payload.bodySize.toLowerCase();
    
    try { 
        localStorage.setItem(PREF_KEY, JSON.stringify(payload)); 
        localStorage.setItem(PREF_SHOWN_KEY, '1');
    } catch (e) { /* ignore */ }
    
    // 广播事件供其他页面响应偏好变化
    try { 
        window.dispatchEvent(new CustomEvent('prefs-applied', { detail: payload }));
    } catch (e) { /* ignore */ }
    
    // 偏好设置自动保存完成
}


</script>

<style scoped>
.content {
    flex: 1;
    overflow-y: auto;
}

/* iOS 风格的分组 */
.section-group {
    margin-top: 10px;
    margin-bottom: 25px;
}

.section-header {
    font-size: 14px;
    font-weight: 400;
    color: #8e8e93;
    text-transform: uppercase;
    margin-bottom: 8px;
    padding: 0 4px;
}

.section-items {
    background: rgba(50, 50, 58, 0.8);
    border-radius: 10px;
    overflow: hidden;
}

.section-item {
    width: 100%;
    background: transparent;
    border: none;
    padding: 20px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #fff;
    font-size: 18px !important;
    cursor: pointer;
    border-bottom: 1px solid rgba(68, 68, 88, 0.65);
}

.section-item:last-child {
    border-bottom: none;
}

.section-item:active {
    background: rgba(74, 74, 85, 0.45);
}
/* 
.section-item.active {
    color: #007AFF;
} */

.item-label {
    flex: 1;
    text-align: left;
    font-weight: 400;
}

.item-check {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
}

.item-check ion-icon {
    color: white;
    font-size: 18px;
}

/* 移除响应式代码 - 只支持移动端，直接应用移动端样式 */
.content {
    padding: 0 15px calc(10px + env(safe-area-inset-bottom, 0px));
}

.section-header {
    padding: 0 4px;
}

.section-item {
    padding: 18px 16px;
    font-size: 16px;
}
</style>
