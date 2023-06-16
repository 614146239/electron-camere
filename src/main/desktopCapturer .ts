// 在主进程中.
import { desktopCapturer } from 'electron'
// // 允许屏幕共享
let source
const screenCapturer = () => {
  if (source) {
    // mainWindow.webContents.send('screenCapturer', source.id)
    return source.id
  } else {
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
  }
}

export default screenCapturer
