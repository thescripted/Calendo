import React from 'react'
import io from 'socket.io-client'
const DEV_URL = 'http://localhost:5000' 

const WebSocketContext = React.createContext(undefined)

function WebSocketProvider(props) {
  function sendState(currentState, user_id, board_url) {
    const payload = {
      board_url: board_url,
      user_id: user_id,
      data: currentState,
    }
    console.log(payload)
  }

  const socket = io.connect(DEV_URL)
  socket.on('event://calendar', function(msg) {
    const payload = JSON.parse(msg)
    console.log(payload)
  })

  socket.on('connect', function() {
    socket.emit("event://connection", "User has connected")

  });
  const value = {
    socket,
    sendState
  }
  return <WebSocketContext.Provider value={value} {...props} />
}
export { WebSocketContext, WebSocketProvider}

