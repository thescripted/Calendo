import Receiver from "./Receiver"
// WebSocket Configuration
const socket = new WebSocket('wss://localhost:3030/websocket')
socket.addEventListener('open', function (event) {
  socket.send("Hello!")
})

socket.addEventListener('message', function (event) {
  const data = event.data
  Receiver.read(data)
})

