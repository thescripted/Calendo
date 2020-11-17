// WebSocket Configuration
const ws = new WebSocket('ws://localhost:3030/websocket')
ws.addEventListener('open', function (event) {
  ws.send("Hello!")
})

ws.addEventListener('close', function (event) {
  console.log("Connection closed")
})

export default ws

