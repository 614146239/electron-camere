// 无边框模式拖动
// export default class Drag {
//   private body: HTMLBodyElement | null = null
//   constructor(private resPageX = 0, private resPageY = 0) {}
//   public run() {
//     window.addEventListener('DOMContentLoaded', () => {
//       this.body = document.querySelector('body')!
//       this.body.addEventListener('mousedown', this.down.bind(this))
//     })
//   }
//   private down(e: MouseEvent) {
//     this.resPageX = e.pageX
//     this.resPageY = e.pageY
//     const mouseEvent = this.move.bind(this)
//     this.body!.addEventListener('mousemove', mouseEvent)
//     this.body!.addEventListener('mouseup', () =>
//       this.body?.removeEventListener('mousemove', mouseEvent)
//     )
//   }
//   private move(e: MouseEvent) {
//     const x = e.pageX - this.resPageX
//     const y = e.pageY - this.resPageY
//     window.api.drag({ x, y })
//   }
// }

function drag(winId: number) {
  let dragging = false
  let startCoords = { x: 0, y: 0 }
  window.addEventListener('mousedown', (event) => {
    dragging = true
    startCoords = { x: event.screenX, y: event.screenY }
  })

  window.addEventListener('mousemove', (event) => {
    if (dragging) {
      const newCoords = { x: event.screenX, y: event.screenY }
      // ipcRenderer.send('drag', startCoords, newCoords)
      const move = {
        x: event.screenX - startCoords.x,
        y: event.screenY - startCoords.y
      }

      window.api.drag(move, winId)
      startCoords = newCoords
    }
  })

  window.addEventListener('mouseup', () => {
    dragging = false
  })
}
export default drag
