<template>
  <div class="video" :style="borderStyle">
    <video
      ref="videoRef"
      autoplay
      :muted="constraints.audio.muted"
      :class="{ reverse: config.reverse }"
    ></video>
  </div>
</template>

<script setup lang="ts">
// import router from '../router'
import { useStore } from '../store'
import { onMounted } from 'vue'
import { ref, reactive } from 'vue'
const videoRef = ref()
const tracks = ref()
// 数据要从store中存储
const store = useStore()
const config = store.config
const constraints = store.constraints
const borderStyle = reactive({
  border: `${config.borderWidth}px  solid  ${config.borderColor}`
})
onMounted(() => {
  // 摄像头
  const video = videoRef.value
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream
    tracks.value = stream.getTracks()
  })
})
// 关闭所有流媒体
onBeforeUnmount(() => {
  tracks.value.forEach(function (track) {
    track.stop()
  })

  videoRef.value.srcObject = null
})
</script>

<style scoped lang="less">
.video {
  width: 100vw;
  height: 100vh;
  border-radius: 50%;
  overflow: hidden;
  z-index: 9999;
  // 可以拖动窗口
  -webkit-app-region: drag;
}
video {
  width: inherit;
  height: inherit;
  object-fit: cover;
}
.reverse {
  // 切换镜像，video旋转y轴180
  transform: rotateY(180deg);
}
</style>
