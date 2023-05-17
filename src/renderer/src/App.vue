<template>
  <router-view @click.right="getPosition"></router-view>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const getPosition = (e: { clientX: string; clientY: string }): void => {
  console.log(e.clientX, e.clientY)
  window.api.contextMenu()
}
// 右键设置跳转设置
window.electron.hrefSetting(() => {
  router.push('/setting')
})
</script>

<style lang="less"></style>
