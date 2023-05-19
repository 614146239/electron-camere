import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 用于渲染器的自定义 API
// 渲染进程向主进程
const api = {
  // 右键菜单
  contextMenu: (e) => {
    e.preventDefault()
    ipcRenderer.send('contextMenu')
  },
  // 拖动
  drag: (opt: { x: number; y: number }) => {
    ipcRenderer.invoke('drag', opt)
  }
}
// 主进程向渲染进程
const electron = {
  // 跳转到设置页面
  hrefSetting: (callback) => {
    ipcRenderer.on('hrefSetting', callback)
  },
  // 录屏未实现
  screenCapturer: (callback) => {
    ipcRenderer.on('screenCapturer', callback)
  }
}

// 使用“contextBridge”API仅在启用上下文隔离时才向渲染器公开Electron API，
// 否则只需添加到DOM全局
if (process.contextIsolated) {
  try {
    // 向渲染进程通知
    contextBridge.exposeInMainWorld('electron', { ...electronAPI, ...electron })
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
