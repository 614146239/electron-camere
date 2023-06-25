// 主进程拖动监听事件
import { BrowserWindow, ipcMain } from 'electron'
// export default (win: BrowserWindow) => {
//   ipcMain.handle('drag', (_event, opt: { x: number; y: number }) => {
//     const [x, y] = win.getPosition()
//     win.setPosition(x + opt.x, y + opt.y)
//   })
// }

// ipcMain.on('drag', (event, move, winId) => {
//   const winBounds = win.getBounds()
//   const delta = { x: newCoords.x - startCoords.x, y: newCoords.y - startCoords.y }
//   win.setBounds({
//     x: winBounds.x + delta.x,
//     y: winBounds.y + delta.y,
//     width: winBounds.width,
//     height: winBounds.height
//   })
// })
