// 控制应用生命周期和创建原生浏览器窗口的模组
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/windowTray.png?asset'

// 菜单
import menu from './menu'
import './setUserTasks'
// 托盘
import { createTray } from './tray'
// 更新
import './autoUpdater'

// 拖动
// import drag from './drag'

// 窗口类
import Window from './createWin'
const window = new Window()

function createWindow(): void {
  // 创建浏览器窗口

  const mainWindow = window.createWindows({
    width: 600,
    height: 600,
    show: false,
    autoHideMenuBar: true, //自动隐藏菜单栏
    alwaysOnTop: false, //是否保持在最上层
    // frame: false, //windows去除标题栏和窗口控制按钮
    transparent: true, //窗口背景透明
    skipTaskbar: true, //是否在任务栏中显示窗口
    resizable: true, //窗口是否可以改变尺寸
    minWidth: 200,
    titleBarStyle: 'default', //mac下隐藏导航栏
    icon: icon,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
      //网页功能的设置
      // devTools:false//是否开启 DevTools
      // webSecurity: false//是否禁用同源策略
    }
  })
  window.listen()

  // 长宽比率为1
  // mainWindow.setAspectRatio(1)

  // 创建系统托盘
  createTray(mainWindow)
  // 录制屏幕
  // screenCapturer()
  // 设置dock图标
  if (process.platform === 'darwin') {
    app.dock.setIcon(icon)
  }
  //右键菜单
  menu(mainWindow)
  // 拖动
  // drag(mainWindow)
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  // 开发中的 F12 默认打开或关闭 DevTools
  // 并忽略生产中的 CommandOrControl + R。
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // recordWindow(mainWindow)

  createWindow()

  app.on('activate', function () {
    // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
    // 打开的窗口，那么程序会重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

//除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 在这个文件中，你可以包含应用程序剩余的所有部分的代码，
// 也可以拆分成几个文件，然后用 require 导入。
