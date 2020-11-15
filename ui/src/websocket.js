// WebSocket Configuration
const ws = new WebSocket('wss://localhost:3030/websocket')
socket.addEventListener('open', function (event) {
  socket.send("Hello!")
})

socket.addEventListener('close', function (event) {
  console.log("Connection closed")
})

export default socket

