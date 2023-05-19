// 主进程拖动监听事件
import { BrowserWindow, ipcMain } from 'electron'
export default (win: BrowserWindow) => {
  ipcMain.handle('drag', (_event, opt: { x: number; y: number }) => {
    const [x, y] = win.getPosition()
    win.setPosition(x + opt.x, y + opt.y)
  })
}
