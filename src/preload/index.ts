import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 用于渲染器的自定义 API
// 渲染进程向主进程
const api = {
  chageFrame: (frame): void => {
    ipcRenderer.send('frame', frame)
  },
  contextMenu: () => {
    ipcRenderer.send('contextMenu')
  }
}
// 主进程向渲染进程
const electron = {
  hrefSetting: (callback) => {
    ipcRenderer.on('hrefSetting', callback)
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
