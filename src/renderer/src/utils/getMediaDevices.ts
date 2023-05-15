import pinia from '../store/store'
import { useStore } from '../store/index'
import { ElNotification } from 'element-plus'
const store = useStore(pinia)

interface DeviceArr {
  label: string
  deviceId: string
}
const cameraArr: Array<DeviceArr> = []
const audioArr: Array<DeviceArr> = []
const newArr = (item: DeviceArr) => {
  return {
    label: item.label,
    deviceId: item.deviceId
  }
}
navigator.mediaDevices
  .enumerateDevices()
  .then((devices) => {
    // 遍历设备列表
    devices.forEach(function (device) {
      console.log(device)

      // 如果设备类型是视频输入设备，则输出设备信息
      if (device.kind === 'videoinput') {
        cameraArr.push(newArr(device))
      }
      if (device.kind === 'audioinput') {
        audioArr.push(newArr(device))
      }

      store.$patch((state) => {
        state.cameraArr = cameraArr
        state.audioArr = audioArr
      })
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
