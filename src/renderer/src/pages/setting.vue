<template>
  <div class="setting">
    <el-form :model="config" label-width="auto">
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
        <el-input v-model="config.borderWidth" placeholder="边框宽度" />
      </el-form-item>
      <el-form-item label="边框颜色">
        <el-color-picker
          v-model="config.borderColor"
          size="large"
          show-alpha
          :predefine="predefineColors"
          @active-change="changeColor"
        />
      </el-form-item>
    </el-form>

    <button @click="herf">去视频</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useStore } from '../store/index'
import { ElNotification } from 'element-plus'
import { reactive } from 'vue'

const store = useStore()
const router = useRouter()
store.getUserMedia()
const config = store.config
const constraints = reactive(store.constraints)
const cameraArr = reactive(store.cameraArr)
const audioArr = reactive(store.audioArr)

// console.log(window.api.chageFrame)
// window.api.changeFrame()

// 预定义颜色
const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0, 0.68)',
  'rgb(255, 120, 0)',
  'hsv(51, 100, 98)',
  'hsva(120, 40, 94, 0.5)',
  'hsl(181, 100%, 37%)',
  'hsla(209, 100%, 56%, 0.73)',
  '#c7158577'
])
const changeColor = (e): void => {
  console.log(e)
  config.borderColor = e
}
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

const herf = (): void => {
  router.push('/index')
}
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
:deep(.el-color-picker, .el-popper) {
  -webkit-app-region: no-drag;
}
</style>
