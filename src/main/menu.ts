import { ipcMain, Menu, MenuItemConstructorOptions } from 'electron'

ipcMain.on('contextmenu', () => {
  const template = [
    {
      label: '编辑',
      submenu: [
        {
          label: '复制',
          role: 'copy',
          click: () => {
            console.log('复制文件')
          }
        },
        {
          label: '粘贴',
          role: 'paste',
          click: () => {
            console.log('粘贴文件')
          }
        }
      ]
    }
  ] as MenuItemConstructorOptions[]
  // 固定写法
  const menuBuilder = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menuBuilder)
  menuBuilder.popup()
})
