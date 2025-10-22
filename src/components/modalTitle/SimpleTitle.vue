<template>
    <div class="simple-title">
        {{ title }}
    </div>
</template>

<script lang="ts" setup>
defineProps<{
    title?: string;
}>();
</script>

<style scoped>
.simple-title {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    text-align: center;
}
</style>
