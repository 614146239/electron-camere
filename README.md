# camere

An Electron +Vue+pinia +TypeScript+elementPlus

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux

```

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

<!--  -->

分为主进程和渲染进程，preload 预渲染主进程和渲染进程之间通信
