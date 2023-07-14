<template>
  <div class="setting">
    <el-progress
      v-if="percentage"
      :text-inside="true"
      :percentage="percentage"
      :stroke-width="15"
      striped
      striped-flow
    />
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

      <el-form-item label="摄像头">
        <el-radio-group v-model="config.isWebcam" class="ml-4">
          <el-radio :label="true" border>是</el-radio>
          <el-radio :label="false" border>否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="录制屏幕">
        <el-radio-group v-model="config.isRecording" class="ml-4">
          <el-radio :label="true" border>是</el-radio>
          <el-radio :label="false" border>否</el-radio>
        </el-radio-group>
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

    <el-button type="primary" @click="submit">确认</el-button>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '../store/index'
import { ElNotification } from 'element-plus'
import { reactive, ref, onMounted } from 'vue'
import { createWindow } from '../store/createWindow'
const win = createWindow()
const store = useStore()
store.getUserMedia()
const config = reactive(store.config)
const constraints = reactive(store.constraints)
const cameraArr = reactive(store.cameraArr)
const audioArr = reactive(store.audioArr)

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

const submit = (): void => {
  if (config.isRecording) {
    win.recordWindow()
  }
  if (config.isWebcam) {
    win.cameraWindow()
  }
}
const percentage = ref(0)
onMounted(() => {
  window.electron.downloadProgress((_, progress) => {
    percentage.value = Math.floor(progress.percent)
  })
})
</script>

<style scoped lang="less">
.setting {
  width: 100%;
  height: 100%;
  background-color: rgb(44, 62, 80);
  .el-form {
    padding: 40px 40px 20px;
  }
  .el-button {
    display: block;
    width: 80%;
    margin: 0 auto;
  }
  :deep(.el-form-item__label) {
    color: #fff;
  }
}
:deep(.el-color-picker, .el-popper) {
  -webkit-app-region: no-drag;
}
:deep(.el-radio) {
  color: #fff;
}
</style>
