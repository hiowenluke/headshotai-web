<template>
    <HomeMainPage />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HomeMainPage from '@/pages/homepage/index.vue';

export default defineComponent({
    name: 'HomePage',
    components: { 
        HomeMainPage 
    }
});
</script>

<style scoped>
/* 路由页面样式 - 通常只保留必要的布局样式 */
</style>
