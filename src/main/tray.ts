import { Menu, Tray } from 'electron'
import path from 'path'
// 系统托盘
const createTray = (mainWindow) => {
  const tray = new Tray(
    path.resolve(
      __dirname,
      process.platform == 'darwin'
        ? '../../resources/trayTemplate@2x.png'
        : '../../resources/windowTray.png'
    )
  )
  //   小托盘提示
  tray.setToolTip('camera')
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开',
      click: () => {
        mainWindow.show()
      }
    },
    // 使用分隔符不同label之间有一条横线
    {
      type: 'separator'
    },
    {
      type: 'separator'
    },
    { label: '退出程序', role: 'quit' }
  ])
  tray.setContextMenu(contextMenu)
}

export { createTray }
