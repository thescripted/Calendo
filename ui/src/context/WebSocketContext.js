import React from 'react'
import io from 'socket.io-client'
import { StoreContext } from './StoreContext'
const DEV_URL = 'http://localhost:5000' 

const WebSocketContext = React.createContext(undefined)

let socket
let value

function WebSocketProvider(props) {
  const { setBoardState } = React.useContext(StoreContext)
  function sendState(currentState, user_id, board_url) {
    const payload = {
      board_url: board_url,
      user_id: user_id,
      data: currentState,
    }
    console.log(payload)
  }

  if (!socket) {
    socket = io.connect(DEV_URL)
    socket.on('connect', function() {
      socket.emit("init", "User has connected")
    });
    value = {
      socket,
      sendState
    }
  }


  return <WebSocketContext.Provider value={value} {...props} />
}
export { WebSocketContext, WebSocketProvider}

