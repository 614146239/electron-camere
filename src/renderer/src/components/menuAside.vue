<template>
  <el-menu
    router
    class="el-menu-vertical-demo"
    unique-opened
    active-text-color="#fff"
    text-color="#fff"
    background-color="#2c3e50"
    default-active="/webcamSetting"
  >
    <el-menu-item v-for="item in menu" :key="item.path" :index="String(item.path)">
      <el-icon> <component :is="item.icon" /></el-icon>
      <template #title>{{ item.label }}</template>
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
const menu = [
  {
    label: '视频设置',
    path: '/webcamSetting',
    icon: 'VideoCameraFilled'
  },
  {
    label: '人脸模型',
    path: '/faceModel',
    icon: 'Picture'
  },
  {
    label: '视频背景',
    path: '/backgroundCut',
    icon: 'Picture'
  }
]
</script>

<style scoped lang="less">
.el-menu {
  width: 100%;
  border-right: none;
  background-color: #2c3e50;
  .is-active {
    background-color: #1d9f92;
  }

  .el-menu-item {
    min-width: 70px;
  }
}
</style>
