// 在主进程中.
import { desktopCapturer } from 'electron'
// // 允许屏幕共享
let source
const screenCapturer = async () => {
  if (source) {
    return source.id
  } else {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      // thumbnailSize: {
      //   height: 300, // 窗口或屏幕的截图快照高度
      //   width: 300 // 窗口或屏幕的截图快照宽度
      // },
      fetchWindowIcons: true // 如果视频源是窗口且有图标，则设置该值可以捕获到的窗口图标
    })
    source = sources[0]
    return source.id
  }
}

export default screenCapturer
