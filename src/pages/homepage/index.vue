<template>
    <ion-page>
        <HomeHeader 
            :menus="menus" 
            :active-index="activeIndex"
            :show-sub-menu="showSubMenu"
            :current-sub-menus="currentSubMenus"
            :active-sub-index="activeSubIndex"
            :has-sub-menus="hasSubMenus"
            @select="selectMainMenu" 
            @select-sub="selectSubMenu"
            @scroll-to-top="scrollToTop"
        />
        <ion-content class="home-content" fullscreen>
            <CategoryPanels ref="categoryPanelsRef" :menus="flatMenus" :active-index="currentFlatIndex" :card-data-map="cache" :no-more-map="noMoreMap"
                :infinite-disabled-map="infiniteDisabledMap" :loading-first-map="loadingFirstPageMap"
                :loading-more-map="loadingMoreMap" :load-category="loadCategory" :prefetch-distance="1" enable-prefetch
                @select="handleFlatMenuSelect" @open="openGenerator" @load-more="({ event, category }) => loadMore(event, category)"
                @prefetch-skip="onPrefetchSkip" />
            <RetryButton :skipped-list="skippedCategoriesDisplay"
                :menus="menus" :active-index="activeIndex" @reload="manualLoad" />
        </ion-content>
        
        <GeneratorPage :is-open="showGenerator" :image="previewImage || undefined" :demo-faces="demoFaces"
            @close="closeGenerator" />
         
        <!-- 智能加载调试组件 -->
        <SmartLoadingDebug v-if="devMode" />
    </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, defineAsyncComponent } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import HomeHeader from '@/components/header/HomeHeader.vue';
import CategoryPanels from '@/components/category/CategoryPanels.vue';
import RetryButton from '@/components/category/RetryButton.vue';

// 懒加载非首屏组件
const GeneratorPage = defineAsyncComponent(() => 
  import('@/pages/generator/index.vue')
);
const SmartLoadingDebug = defineAsyncComponent(() => 
  import('@/components/debug/SmartLoadingDebug.vue')
);

// 导入组合式函数
import { useMenuManagement } from './composables/useMenuManagement';
import { useDataManagement } from './composables/dataManagement';
import { usePreferencesManagement } from './composables/usePreferencesManagement';
import { useGeneratorIntegration } from './composables/useGeneratorIntegration';
import { useUIManagement } from './composables/useUIManagement';
import { useEventHandlers } from './composables/useEventHandlers';
import { useScrollManagement } from './composables/useScrollManagement';
import { useWatchers } from './composables/useWatchers';
import { useLifecycleSetup } from './composables/useLifecycleSetup';

export default defineComponent({
    name: 'HomeMainPage',
    components: { 
        IonPage, HomeHeader, IonContent, CategoryPanels, RetryButton, GeneratorPage, SmartLoadingDebug
    },
    setup() {
        // 模板引用
        const categoryPanelsRef = ref<any>(null);
        
        // 开发模式标记
        const devMode = import.meta.env && (import.meta.env.DEV || import.meta.env.MODE === 'development');
        
        // 使用组合式函数
        const menuManagement = useMenuManagement();
        const dataManagement = useDataManagement();
        const preferencesManagement = usePreferencesManagement();
        const generatorIntegration = useGeneratorIntegration();
        const uiManagement = useUIManagement();
        
        // 解构需要的状态和方法
        const {
            menus,
            flatMenus,
            activeIndex,
            currentFlatIndex,
            activeSubIndex,
            hasSubMenus,
            showSubMenu,
            currentSubMenus,
            currentCategory,
            selectMainMenu,
            selectSubMenu,
            handleFlatMenuSelect,
            syncMenuStates
        } = menuManagement;
        
        const {
            cache,
            noMoreMap,
            infiniteDisabledMap,
            loadingFirstPageMap,
            loadingMoreMap,
            skippedCategoriesDisplay,
            loadCategory,
            loadMore,
            onPrefetchSkip,
            manualLoad,
            resetAllForPrefs,
            updateSkippedDisplay
        } = dataManagement;
        
        const {
            currentPrefs,
            demoFaces,
            loadCachedDemoFaces,
            updateDemoFaces,
            loadSavedPreferences,
            setupPreferencesListener
        } = preferencesManagement;

        // 预先尝试从缓存读取 Demo faces
        loadCachedDemoFaces();

        const ensureDemoFacesLoaded = async () => {
            if (demoFaces.value.length) return;
            try {
                await updateDemoFaces();
            } catch (err) {
                console.warn('[HomeMainPage] Failed to fetch demo faces', err);
            }
        };
        
        const {
            previewImage,
            showGenerator,
            openGenerator,
            closeGenerator,
            initializePreviewImage,
            setupPreviewImageWatcher
        } = generatorIntegration;
        
        const { scrollToTop: baseScrollToTop } = uiManagement;
        
        // 滚动管理
        const { scrollToTop } = useScrollManagement(categoryPanelsRef, baseScrollToTop);
        
        // 事件处理器
        const {
            handleLoadMore,
            handleMainMenuSelect,
            handleSubMenuSelect,
            wrappedHandleFlatMenuSelect
        } = useEventHandlers(
            currentCategory,
            currentPrefs,
            loadCategory,
            loadMore,
            selectMainMenu,
            selectSubMenu,
            handleFlatMenuSelect
        );
        
        // 监听器设置
        const { setupAllWatchers } = useWatchers(
            currentFlatIndex,
            previewImage,
            showGenerator,
            syncMenuStates,
            setupPreviewImageWatcher,
            ensureDemoFacesLoaded
        );
        
        // 生命周期设置
        const { setupOnMounted, setupOnBeforeUnmount } = useLifecycleSetup(
            devMode,
            flatMenus,
            currentFlatIndex,
            currentPrefs,
            showGenerator,
            loadCategory,
            loadSavedPreferences,
            initializePreviewImage,
            ensureDemoFacesLoaded,
            setupPreferencesListener,
            resetAllForPrefs,
            updateSkippedDisplay
        );
        
        // 设置所有监听器
        setupAllWatchers();
        
        // 设置生命周期钩子
        setupOnMounted();
        setupOnBeforeUnmount();
        
        return {
            // 模板引用
            categoryPanelsRef,
            
            // 菜单相关
            menus,
            flatMenus,
            activeIndex,
            currentFlatIndex,
            hasSubMenus,
            showSubMenu,
            currentSubMenus,
            activeSubIndex,
            selectMainMenu: handleMainMenuSelect,
            selectSubMenu: handleSubMenuSelect,
            
            // 数据相关
            cache,
            noMoreMap,
            infiniteDisabledMap,
            loadingFirstPageMap,
            loadingMoreMap,
            skippedCategoriesDisplay,
            handleFlatMenuSelect: wrappedHandleFlatMenuSelect,
            loadMore: handleLoadMore,
            onPrefetchSkip,
            manualLoad: (cat: string) => manualLoad(cat, currentPrefs),
            loadCategory: (category: string, isFirstMenu: boolean = false) => {
                void loadCategory(category, currentPrefs, isFirstMenu);
            },
            
            // 偏好设置相关
            currentPrefs,
            demoFaces,
            
            // 生成器相关
            showGenerator,
            previewImage,
            openGenerator,
            closeGenerator,
            
            // UI 相关
            scrollToTop,
            
            // 开发相关
            devMode
        };
    }
});
</script>

<style scoped>
/* 主页面样式 - 只保留页面级别的样式 */
.home-content {
    background: transparent;
    padding: 6px 12px 12px 12px;
}


</style>
