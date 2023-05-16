import { defineStore } from 'pinia'
import { ElNotification } from 'element-plus'

interface DeviceArr {
  deviceId: string
  label: string
}
export const useStore = defineStore('store', {
  state: () => {
    return {
      cameraArr: [] as DeviceArr[],
      audioArr: [] as DeviceArr[],
      config: {
        borderWidth: '',
        borderColor: '',
        reverse: true
        // aspectRatio: 16 / 9
      },
      constraints: {
        // 摄像头
        video: {
          // 画面比例
          // aspectRatio: 16 / 9,
          // 设备ID，可以从enumerateDevices中获取
          deviceId: ''
          // 摄像头前后置模式，一般适用于手机
          // facingMode: ConstrainDOMString
          // 帧率，采集视频的目标帧率
          // frameRate: ConstrainDouble
          // 组ID，用一个设备的输入输出的组ID是同一个
          // groupId: ConstrainDOMString
          // 视频高度
          // height: ConstrainULong
          // 视频宽度
          // width: ConstrainULong
        },
        // 麦克风
        audio: {
          muted: true,
          // 是否开启AGC自动增益，可以在原有音量上增加额外的音量
          // autoGainControl: ConstrainBoolean
          // 声道配置
          // channelCount: ConstrainULong
          // 设备ID，可以从enumerateDevices中获取
          deviceId: '',
          // 是否开启回声消除
          echoCancellation: true,
          // 组ID，用一个设备的输入输出的组ID是同一个
          // groupId: ConstrainDOMString
          // 延迟大小
          // latency: ConstrainDouble
          // 是否开启降噪
          noiseSuppression: true,
          // 采样率单位Hz
          // sampleRate: ConstrainULong
          // 采样大小，单位位
          // sampleSize: ConstrainULong
          // 本地音频在本地扬声器播放
          suppressLocalAudioPlayback: false
        }
      }
      // voice: false,
      // screen: false
    }
  },

  getters: {},
  actions: {
    // 获取设备列表并存入store
    async getUserMedia() {
      await navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          // 遍历设备列表
          devices.forEach((device) => {
            // 如果设备类型是视频输入设备，则输出设备信息
            if (device.kind === 'videoinput') {
              this.cameraArr.push({
                label: device.label,
                deviceId: device.deviceId
              })
            }
            if (device.kind === 'audioinput') {
              this.audioArr.push({ label: device.label, deviceId: device.deviceId })
            }
          })
        })
        .catch(function (err) {
          console.error('获取设备列表失败:', err)
          ElNotification({
            title: '获取设备列表失败',
            message: err,
            type: 'error'
          })
        })
    }
  }
})
