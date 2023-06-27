# camere

An Electron +Vue+pinia +TypeScript+elementPlus

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm run dev
```

### Build

```bash
# For windows
$ pnpm run build:win

# For macOS
$ pnpm run build:mac

# For Linux
$ pnpm run build:linux

```
该项目参考后盾人代码 网址https://doc.houdunren.com/%E7%B3%BB%E7%BB%9F%E8%AF%BE%E7%A8%8B/electron/1%20%E5%9F%BA%E7%A1%80%E7%9F%A5%E8%AF%86.html#%E4%B8%BB%E8%BF%9B%E7%A8%8B
<!--  -->

获取摄像头并赋值给 video 播放
navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
video.srcObject = stream
})
constraints 参数在 store/index.ts 中

<!--  -->

默认情况下, 无框窗口是 non-draggable 的。 应用程序需要指定 `-webkit-app-region: drag` 在 CSS 中告诉 Electron 哪个区域是可拖拽的 (像 OS 的标准标题栏), 并且应用程序也可以使用 `-webkit-app-region: no-drag` 来排除 draggable region 中的 non-draggable 区域。 请注意, 当前只支持矩形形状。

要使整个窗口可拖拽, 您可以添加 `-webkit-app-region: drag` 作为 `body` 的样式:

<body style="-webkit-app-region: drag"></body>

请注意, 如果您已使整个窗口 draggable, 则必须将按钮标记为 non-draggable, 否则用户将无法单击它们:
button { -webkit-app-region: no-drag; }

<!-- 获取设备 -->
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
<!-- 进程通讯 -->

分为主进程和渲染进程，preload 预渲染主进程和渲染进程之间通信
进程通讯多次触发情况下使用 `ipcRenderer.once`和 `ipcRenderer.on`一样


<!--  -->

录制屏幕
录制屏幕需要electron 通过desktopCapturer获取设备窗口id
desktopCapturer
      .getSources({
        types: ['screen'],
        // thumbnailSize: {
        //   height: 300, // 窗口或屏幕的截图快照高度
        //   width: 300 // 窗口或屏幕的截图快照宽度
        // },
        fetchWindowIcons: true // 如果视频源是窗口且有图标，则设置该值可以捕获到的窗口图标
      })
      .then(async (sources) => {
        source = sources[0]
        // mainWindow.webContents.send('screenCapturer', source.id)
        return source.id
      })
之后通过`navigator.mediaDevices.getUserMedia`(constraints as any)获取屏幕流

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
constraints中属性不能通过getdisplayMedia获取

音频轨道需要额外获取
 audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    })

    同时通过
      const stream = new MediaStream([
        screenStream.getVideoTracks()[0],
        audioStream.getAudioTracks()[0]
      ])合并视频流与音频流

  录制视频需要MediaRecorder(stream)
闲置中，录制中,暂停 inactive, recording, or paused

录制中push进数组中通过blob下载
  recorder.addEventListener('dataavailable', (e) => {
    chunks.push(e.data)
  })
<!-- 下载 -->
const blob = new Blob(chunks, { type: 'video/webm;codecs=vp9' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const currentTime = new Date()
      a.download = `${currentTime.toLocaleString()}.mp4`
      a.click()

<!-- 多页面加载问题 -->
win.loadFile(path.join(__dirname, '../renderer/index.html'), { hash: 'home' })

   Electron 不处理（浏览器）历史并使用同步 URL 加载页面。所以只有 hash 路由 可以工作。
对于 vue-router，你应该使用 createWebHashHistory 而不是 createWebHistory。
对于 react-router-dom，你应该使用 HashRouter 而不是 BrowserRouter。
当使用 hash 路由时，可以通过 BrowserWindow.loadFile 的第二个参数设置 hash 值来加载页面。
