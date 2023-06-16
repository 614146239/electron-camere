<template>
  <div>
    <video ref="videoRef" muted autoplay />
    <button @click="begin">录制屏幕</button>
    <button @click="stop">暂停录制</button>
    <button @click="end">结束录制</button>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
// 录制视频
let recorder: MediaRecorder
const chunks = []
const videoRef = ref()
let audioStream
// 合并视频与音频轨道未作
// 音频轨道
const getAudio = async (): any => {
  try {
    audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    })
  } catch (error) {
    throw new Error('error')
  }
}
const createRecorder = (stream: MediaStream): void => {
  recorder = new MediaRecorder(stream)
  recorder.start()

  recorder.addEventListener('dataavailable', (e) => {
    chunks.push(e.data)
  })
  recorder.onerror = (err): void => {
    console.error(err)
  }
}
// 赞停录制
const stop = (): void => {
  // 闲置中，录制中,暂停 inactive, recording, or paused.
  if (recorder && recorder.state == 'recording') {
    // 赞停录制
    recorder.pause()
    // 停止录制声音
    audioStream.value.forEach(function (track: { stop: () => void }) {
      track.stop()
    })
  } else if (recorder && recorder.state == 'paused') {
    // 开始录制
    recorder.resume()
    // 开启声音录制
    getAudio()
  }
}
// 结束录制并保存
const end = (): void => {
  if (recorder && recorder.state == 'recording') {
    recorder.stop()
    // 停止录制声音
    // audioTrack.value.forEach(function (track) {
    //   track.stop()
    // })
    recorder.addEventListener('stop', () => {
      const blob = new Blob(chunks, { type: 'video/webm;codecs=vp9' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const currentTime = new Date()
      a.download = `${currentTime.toLocaleString()}.mp4`
      a.click()
    })
  }
}

const begin = async (): Promise<void> => {
  window.api.recording()
  window.electron.screenCapturer(async (event, sourceId) => {
    try {
      const constraints = {
        audio: {
          mandatory: {
            // 无需指定mediaSourceId就可以录音了，录得是系统音频
            chromeMediaSource: 'desktop'
          }
        },
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            codec: 'vp9',
            // 帧率
            maxFrameRate: 60
          }
        }
      }
      // 指定屏幕id只能使用getUserMedia
      const screenStream = await navigator.mediaDevices.getUserMedia(constraints as any)
      videoRef.value.srcObject = screenStream
      // 音频
      await getAudio()
      const stream = new MediaStream([
        screenStream.getVideoTracks()[0],
        audioStream.getAudioTracks()[0]
      ])
      createRecorder(stream)
    } catch (e) {
      throw new Error(e)
    }
  })
}
</script>
<style scoped lang="scss">
video {
  width: 300px;
  height: 300px;
}
</style>
