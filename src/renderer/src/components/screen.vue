<template>
  <div>
    <button @click="begin">录制屏幕</button>
    <video ref="videoRef" autoplay />
  </div>
</template>

<script setup lang="ts">
const videoRef = ref()

const begin = (): void => {
  window.electron.screenCapturer(async (event, sourceId) => {
    console.log(event, sourceId)
    // try {
    //   const stream = (navigator.mediaDevices as any).getDisplayMedia({
    //     audio: false,
    //     // video: {
    //     //   mandatory: {
    //     //     chromeMediaSource: 'desktop',
    //     //     chromeMediaSourceId: 'screen:0:0',
    //     //     maxWidth: window.screen.width,
    //     //     maxHeight: window.screen.height
    //     //   }
    //     // }
    //     video: true
    //   })
    //   console.log(stream)
    //   videoRef.value.srcObject = stream
    // } catch (e) {
    //   console.log(e)
    // }
  })
}
</script>

<style scoped lang="scss"></style>
