import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  nativeImage,
  shell
} from 'electron'
import { join } from 'path'
// import url from 'url'
import { is } from '@electron-toolkit/utils'
// 录制屏幕
import screenCapturer from './desktopCapturer '

interface Config {
  id?: string | number //唯一id
  path?: string // 页面路由URL '/manage?id=123'
  data?: null //数据
  isMultiWindow?: boolean //是否支持多开窗口 (如果为false，当窗体存在，再次创建不会新建一个窗体 只focus显示即可，，如果为true，即使窗体存在，也可以新建一个)
  isMainWin?: boolean //是否主窗口(当为true时会替代当前主窗口)
  parentId?: string //父窗口id  创建父子窗口 -- 子窗口永远显示在父窗口顶部 【父窗口可以操作】
  modal?: boolean //模态窗口 -- 模态窗口是禁用父窗口的子窗口，创建模态窗口必须设置 parent 和 modal 选项 【父窗口不能操作】
}
interface windowArr {
  id: string | number
  path?: string
}

class Window {
  main: null
  windowArr: windowArr[]
  constructor() {
    this.main = null //当前页
    this.windowArr = [] //窗口组
  }
  defaultConfig(): BrowserWindowConstructorOptions {
    return {
      width: 600,
      height: 600,
      show: false,
      autoHideMenuBar: true, //自动隐藏菜单栏
      alwaysOnTop: false, //是否保持在最上层
      // frame: false, //windows去除标题栏和窗口控制按钮
      transparent: true, //窗口背景透明
      skipTaskbar: true, //是否在任务栏中显示窗口
      resizable: true, //窗口是否可以改变尺寸
      titleBarStyle: 'default', //mac下隐藏导航栏
      // icon: icon,
      // ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
        // devTools:false//是否开启 DevTools
        // webSecurity: false//是否禁用同源策略
      }
    }
  }
  // 获取窗口
  getWindow(id) {
    return BrowserWindow.fromId(id)
  }
  // 获取全部窗口
  getAllWindows() {
    return BrowserWindow.getAllWindows()
  }
  // 创建窗口
  createWindows(options: BrowserWindowConstructorOptions & Config) {
    const windowConfig = Object.assign({}, this.defaultConfig(), options)
    // 判断窗口是否存在
    // for (const i in this.windowArr) {
    //   if (
    //     this.getWindow(Number(i)) &&
    //     this.windowArr[i].path === windowConfig.path &&
    //     !windowConfig.isMultiWindow
    //   ) {
    //     this.getWindow(Number(i)).focus()
    //     return
    //   }
    // }
    for (let i = 0; i < this.windowArr.length; i++) {
      const item = this.windowArr[i]
      if (this.getWindow(item.id) && item.path === options.path) {
        this.getWindow(Number(item.id))?.focus()
        return
      }
    }

    const win = new BrowserWindow(windowConfig)
    console.log('窗口id：' + win.id)
    this.windowArr.push({
      path: windowConfig.path,
      id: win.id
    })

    // win.on('close', () => win.setOpacity(0))
    // 打开网址（加载页面）
    // HMR 用于基于electron cli 的渲染器。
    // 只能用hash模式
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      if (windowConfig.path) {
        win.loadURL(process.env['ELECTRON_RENDERER_URL'] + `#${windowConfig.path}?id=${win.id}`)
      } else {
        win.loadURL(process.env['ELECTRON_RENDERER_URL'])
      }
    } else {
      // 加载 index.html
      if (windowConfig.path) {
        win.loadFile(join(__dirname, '../renderer/index.html'), {
          hash: `${windowConfig.path}?id=${win.id}`
        })
      } else {
        win.loadFile(join(__dirname, '../renderer/index.html'))
      }
    }
    win.once('ready-to-show', () => {
      win.show()
    })

    // 当窗口被关闭时触发
    win.on('close', (event) => {
      if (windowConfig.isMainWin) {
        // 阻止默认行为
        event.preventDefault()
        // 隐藏窗口
        win.hide()
      }
    })

    win.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    const icon = nativeImage.createFromPath(join(__dirname, '../../resources/windowTray.png'))
    win.setIcon(icon)

    return win
  }
  listen() {
    // 录制
    ipcMain.handle('recording', screenCapturer)
    // 创建窗口
    ipcMain.on('createWindow', (_, args) => {
      this.createWindows(args)
    })
    // 关闭窗口
    ipcMain.on('closeWindow', (_, winId) => {
      if (winId) {
        this.getWindow(Number(winId))?.close()
        this.windowArr = this.windowArr.filter((item) => {
          return item.id != winId
        })
      }
    })
    //无边框 窗口移动
    ipcMain.handle('drag', (_, move, winId) => {
      if (winId) {
        const win = this.getWindow(Number(winId))
        const winBounds = win!.getBounds()
        win?.setBounds({
          x: winBounds.x + move.x,
          y: winBounds.y + move.y,
          width: winBounds.width,
          height: winBounds.height
        })
      }
    })
  }
}

export default Window
