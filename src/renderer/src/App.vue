<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Drag from './utils/drag'
const router = useRouter()
// 右键设置跳转设置
window.electron.hrefSetting(() => {
  router.push('/setting')
})

const drag = new Drag()
drag.run()
</script>

<style lang="less"></style>
