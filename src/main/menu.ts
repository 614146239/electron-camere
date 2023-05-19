import { Menu, MenuItemConstructorOptions } from 'electron'

const menu = (mainWindow) => {
  const template = [
    {
      label: '设置',
      click: () => {
        mainWindow.webContents.send('hrefSetting', 1)
      }
    }
  ] as MenuItemConstructorOptions[]

  // 固定写法
  const menu = Menu.buildFromTemplate(template)
  // 监听右键菜单事件
  mainWindow.webContents.on('context-menu', (e) => {
    e.preventDefault()
    Menu.setApplicationMenu(null)

    menu.popup()
  })
}
export default menu
