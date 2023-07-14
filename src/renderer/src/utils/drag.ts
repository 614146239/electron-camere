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
