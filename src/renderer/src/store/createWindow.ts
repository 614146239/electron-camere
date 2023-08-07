import { defineStore } from 'pinia'
import { useStore } from './index'
const store = useStore()
const config = store.config
const screenWidth = screen.width
const screenHeight = screen.height
const positionX = (width, percent) => {
  return Math.trunc(screenWidth - width - screenWidth * (percent / 100))
}
const positionY = (height, percent) => {
  return Math.trunc(screenHeight - height - screenHeight * (percent / 100))
}
export const createWindow = defineStore('createWindow', () => {
  //创建摄像头窗口
  const cameraWindow = () => {
    window.api.createWindow({
      path: '/webcam',
      width: config.isCircle ? 300 : 400,
      height: config.isCircle ? 300 : 300,
      show: false,
      autoHideMenuBar: true, //自动隐藏菜单栏
      alwaysOnTop: true, //是否保持在最上层
      frame: false, //windows去除标题栏和窗口控制按钮
      transparent: true, //窗口背景透明
      modal: true,
      x: positionX(300, 10),
      y: positionY(300, 7),
      skipTaskbar: true // 不在任务栏中显示窗口图标
    })
  }
  const recordWindow = () => {
    window.api.createWindow({
      path: '/recording',
      width: 350,
      height: 80,
      show: false,
      autoHideMenuBar: true,
      alwaysOnTop: true,
      frame: false,
      modal: true,
      x: positionX(350, 5),
      y: positionY(100, 85),
      skipTaskbar: true // 不在任务栏中显示窗口图标
    })
  }
  const countDownWindow = () => {
    window.api.createWindow({
      path: '/countDown',
      width: screen.width,
      height: screen.height,
      autoHideMenuBar: true, //自动隐藏菜单栏
      alwaysOnTop: true, //是否保持在最上层
      frame: false, //windows去除标题栏和窗口控制按钮
      transparent: true, //窗口背景透明
      skipTaskbar: false
    })
  }
  return {
    cameraWindow,
    recordWindow,
    countDownWindow
  }
})
