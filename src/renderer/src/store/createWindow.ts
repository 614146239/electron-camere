import { defineStore } from 'pinia'

export const createWindow = defineStore('createWindow', () => {
  //创建摄像头窗口
  const cameraWindow = () => {
    window.api.createWindow({
      path: '/webcam',
      width: 300,
      height: 300,
      show: false,
      autoHideMenuBar: true, //自动隐藏菜单栏
      alwaysOnTop: true, //是否保持在最上层
      frame: false, //windows去除标题栏和窗口控制按钮
      transparent: true, //窗口背景透明
      modal: true,
      x: 1500,
      y: 700,
      skipTaskbar: true, // 不在任务栏中显示窗口图标
      draggable: true
    })
  }
  const recordWindow = () => {
    window.api.createWindow({
      path: '/recording',
      width: 350,
      height: 80,
      show: false,
      autoHideMenuBar: true, //自动隐藏菜单栏
      alwaysOnTop: true, //是否保持在最上层
      frame: false, //windows去除标题栏和窗口控制按钮
      // transparent: true, //窗口背景透明
      // parent: mainWindow,
      modal: true,
      x: 1500,
      y: 100,
      skipTaskbar: true, // 不在任务栏中显示窗口图标
      draggable: true
    })
  }
  return {
    cameraWindow,
    recordWindow
  }
})
