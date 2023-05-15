<template>
  <div class="setting">
    <el-form :model="form" label-width="auto">
      <el-form-item label="选择摄像头">
        <el-select v-model="constraints.video.deviceId" placeholder="选择摄像头">
          <el-option
            v-for="item in cameraArr"
            :key="item.deviceId"
            :label="item.label"
            :value="item.deviceId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="选择录音设备">
        <el-select v-model="constraints.audio.deviceId" placeholder="选择录音设备">
          <el-option
            v-for="item in audioArr"
            :key="item.deviceId"
            :label="item.label"
            :value="item.deviceId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="边框宽度">
        <el-input v-model="form.borderRadius" placeholder="边框宽度" />
      </el-form-item>
      <el-form-item label="边框颜色">
        <el-input v-model="form.borderColor" placeholder="边框颜色" />
      </el-form-item>
    </el-form>

    <button @click="herf">去视频</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useStore } from '../store/index'
import { ElNotification } from 'element-plus'
const store = useStore()
const router = useRouter()
const cameraArr = store.cameraArr
const audioArr = store.audioArr
const constraints = store.constraints
console.log(cameraArr)
console.log(audioArr)

if (cameraArr.length === 0) {
  ElNotification({
    title: '未检测出摄像头',
    type: 'error'
  })
}
if (audioArr.length === 0) {
  ElNotification({
    title: '未检测出麦克风',
    type: 'error'
  })
}
const form = store.config

const herf = (): void => {
  router.push('/index')
}

// onBeforeMount(() => {})
</script>

<style scoped lang="less">
.setting {
  width: 100%;
  height: 100%;
  background-color: rgb(44, 62, 80);
  padding: 40px 40px;

  :deep(.el-form-item__label) {
    color: #fff;
  }
}
</style>
