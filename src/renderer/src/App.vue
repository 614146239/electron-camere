<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()

// 右键设置跳转设置
window.electron.hrefSetting(() => {
  router.push('/setting')
})
</script>

<style lang="less"></style>
