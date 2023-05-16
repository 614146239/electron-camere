<template>
  <div class="video" :style="borderStyle">
    <video
      ref="videoRef"
      autoplay
      :muted="constraints.audio.muted"
      :class="{ reverse: config.reverse }"
    ></video>
    <!-- <button @click="href">返回上一层</button> -->
  </div>
</template>

<script setup lang="ts">
// import router from '../router'
import { useStore } from '../store'
import { onMounted } from 'vue'
import { ref, reactive } from 'vue'
const videoRef = ref()
// 数据要从store中存储
const store = useStore()
// const href = (): void => {
//   router.push('/setting')
// }
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
  })
})
</script>

<style scoped lang="less">
.video {
  width: 100vw;
  height: 100vh;
  border-radius: 50%;
  overflow: hidden;
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
