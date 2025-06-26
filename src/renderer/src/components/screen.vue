<template>
  <div class="navBar">
    <div v-if="recorder" class="rec">REC</div>
    <div class="audio">
      <div v-if="muted" class="nav-item">
        <el-icon color="red" @click="toggleMute">
          <Microphone />
        </el-icon>
        <p>录音</p>
      </div>
      <div v-else class="nav-item">
        <el-icon color="#fff" @click="toggleMute">
          <Mute />
        </el-icon>
        <p>静音</p>
      </div>
    </div>

    <div class="stopRecoder">
      <div v-if="recorder?.state === 'recording'" class="nav-item" @click="stop">
        <el-icon color="red">
          <Platform />
        </el-icon>
        <p>录制中</p>
      </div>
      <div v-else class="nav-item">
        <el-icon color="#fff" @click="stop">
          <VideoPlay />
        </el-icon>
        <p>暂停</p>
      </div>
    </div>
    <div class="camera">
      <div v-if="config.isWebcam" class="nav-item" @click="closeCamera">
        <el-icon color="red">
          <CameraFilled />
        </el-icon>
        <p>开启</p>
      </div>
      <div v-else class="nav-item" @click="openCamera">
        <el-icon color="#fff">
          <Camera />
        </el-icon>
        <p>关闭</p>
      </div>
    </div>
    <div class="time">
      <span>{{ formatTime }}</span>
    </div>
    <div class="recoder">
      <button v-if="recorder" @click="endRecorder">保存</button>
      <button v-else @click="readyRecoder">录制</button>
    </div>
    <div class="nav-item" @click="closeRecordWindow">
      <el-icon color="#fff">
        <CloseBold />
      </el-icon>
      <p>关闭</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, toRaw, onBeforeUnmount } from 'vue'
import { useStore } from '../store/index'
import { useRoute } from 'vue-router'
import { createWindow } from '../store/createWindow'
import drag from '../utils/drag'

const win = createWindow()
const route = useRoute()
onMounted(() => {
  drag(Number(route.query.id))
})
const store = useStore()
const config = store.config
const audio = toRaw(store.constraints.audio)
const sourceId = ref()
// 录制视频
const recorder = ref()
let mediaStream: MediaStream
const chunks = ref()
const muted = ref(false)
const audioStream = ref()
const vidioStream = ref()
const audioTracks = ref()
const time = ref(0)
const recordTimer = ref()
const formatTime = ref('00:00:00')

// 录制时间
const recordTime = (): void => {
  clearInterval(recordTimer.value)
  recordTimer.value = setInterval(() => {
    time.value++
    const hours = Math.floor(time.value / 3600)
      .toString()
      .padStart(2, '0')
    const minutes = Math.floor((time.value % 3600) / 60)
      .toString()
      .padStart(2, '0')
    const seconds = (time.value % 60).toString().padStart(2, '0')
    formatTime.value = `${hours}:${minutes}:${seconds}`
  }, 1000)
}

// 停止录制时间
const stopRecodTime = (): void => {
  clearInterval(recordTimer.value)
  time.value = 0
  formatTime.value = '00:00:00'
}

// 是否静音
const toggleMute = (): void => {
  if (audioStream.value) {
    audioTracks.value.forEach((track) => {
      track.enabled = !track.enabled
    })
    muted.value = !muted.value
  }
}
// 音频轨道
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getAudio = async () => {
  try {
    // if (recorder.value && recorder.value.state == 'recording') {
    audioStream.value = await navigator.mediaDevices.getUserMedia({
      audio: audio
    })
    audioTracks.value = audioStream.value.getTracks()
    muted.value = true
    // }
  } catch (error) {
    console.error(error)
  }
}

// 停止录音
const stopAudio = (): void => {
  audioTracks.value.forEach((MediaStreamTrack: { stop: () => void }) => {
    MediaStreamTrack.stop()
    muted.value = false
  })
}

// 录制
const createRecorder = (vidioStream, audioStream): void => {
  mediaStream = new MediaStream([
    ...vidioStream.value.getVideoTracks(),
    ...audioStream.value.getAudioTracks()
  ])

  recorder.value = new MediaRecorder(mediaStream, { mimeType: 'video/webm; codecs=vp9' })
  // recorder.value = new MediaRecorder(mediaStream, { mimeType: 'video/mp4' })

  recorder.value.start()
  // 录制时间
  recordTime()
  recorder.value.addEventListener('dataavailable', (event: { data: any }) => {
    chunks.value.push(event.data)
  })
  recorder.value.onerror = (err): void => {
    console.error(err)
  }
}
// 赞停录制
const stop = (): void => {
  // 闲置中，录制中,暂停 inactive, recording, or paused.
  if (recorder.value && recorder.value.state == 'recording') {
    // 赞停录制
    recorder.value.pause()
    muted.value = false
    clearInterval(recordTimer.value)
  } else if (recorder.value && recorder.value.state == 'paused') {
    // 开始录制
    recorder.value.resume()
    // 开启声音录制
    muted.value = true
    recordTime()
  }
}
// 结束录制并保存
const endRecorder = (): void => {
  if ((recorder.value && recorder.value.state == 'recording') || recorder.value.state == 'paused') {
    recorder.value.stop()
    // 停止录制声音
    stopAudio()
    stopRecodTime()
    recorder.value.addEventListener('stop', () => {
      // const blob = new Blob(chunks.value, { type: 'video/webm;codecs=vp9' })
      const blob = new Blob(chunks.value, { type: 'video/mp4' })

      // const blob = new Blob(chunks.value, { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const currentTime = new Date()
      a.download = `${currentTime.toLocaleString()}.mp4`
      a.click()
    })
    recorder.value = null
    chunks.value = []
  }
}

const readyRecoder = async (): Promise<void> => {
  win.countDownWindow()

  sourceId.value = await window.api.recording()
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
        chromeMediaSourceId: sourceId.value,
        width: { ideal: screen.width },
        height: { ideal: screen.height },
        codec: 'vp9'
        // 帧率
        // maxFrameRate: 60
      }
    }
  }

  // 指定屏幕id只能使用getUserMedia
  vidioStream.value = await navigator.mediaDevices.getUserMedia(constraints as any)
  // 音频
  await getAudio()
}
const channel = new BroadcastChannel('recoder')
channel.addEventListener('message', (e) => {
  if (e.data) {
    beginRecorder()
  }
})
// 合并录制视频音频
const beginRecorder = async (): Promise<void> => {
  createRecorder(vidioStream, audioStream)
}
// 打开摄像头
const openCamera = (): void => {
  win.cameraWindow()
  config.isWebcam = true
}
//
const closeCamera = (): void => {
  console.log('关闭')
  // store.closeCameraWindow()
  // config.isWebcam = false
}
const closeRecordWindow = (): void => {
  // 关闭之前建议是否考虑是否录制中保存
  store.closeWindow(route.query.id)
}
onBeforeUnmount(() => {
  channel.close()
})
</script>
<style scoped lang="less">
* {
  line-height: 1em;
}

.navBar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: rgb(43, 43, 43);

  // // 可以拖动窗口
  // -webkit-app-region: drag;
  .time {
    color: #fff;
    font-size: 18px;
  }

  .rec {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    background-color: red;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 14px;
    font-weight: bold;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 40px;
    cursor: pointer;

    p {
      margin-top: 5px;
      color: #fff;
      font-size: 12px;
    }
  }
}

.el-icon {
  font-size: 25px;
}

.recoder {
  button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 60px;
    height: 30px;
    font-weight: bold;
    background-color: #2dc7cc;
    border-radius: 10px;
    border: none;
  }
}
</style>
