<template>
  <div class="common-layout">
    <el-container>
      <el-aside><menuAside /></el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import menuAside from '../components/menuAside.vue'
</script>

<style scoped lang="less">
.common-layout {
  width: 100%;
  height: 100vh;
  background-color: #2c3e50;
}
.el-aside {
  width: 150px;
  height: 100vh;
  background-color: #4f6174;
}
.el-main {
  padding: 0px;
  height: 100vh;
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
