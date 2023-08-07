<template>
  <div class="app">
    <div class="number">{{ countDown }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useStore } from '../store/index'
import { useRoute } from 'vue-router'
const route = useRoute()
const store = useStore()
const countDown = ref(3)
const timer = ref()

onMounted(() => {
  const channel = new BroadcastChannel('recoder')
  timer.value = setInterval(() => {
    countDown.value--
    if (countDown.value <= 0) {
      store.closeWindow(route.query.id)
      clearInterval(timer.value)
      channel.postMessage(true)
    }
  }, 1000)
})
</script>

<style scoped lang="less">
.app {
  width: 100vw;
  height: 100vh;
  background-color: rgba(105, 105, 105, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  .number {
    font-size: 360px;
    color: #fff;
    line-height: 1em;
    font-weight: bold;
  }
}
</style>
