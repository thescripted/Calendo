import React from 'react'
import io from 'socket.io-client'
import { StoreContext } from './StoreContext'
const DEV_URL = 'http://localhost:5000' 

const WebSocketContext = React.createContext(undefined)


// Not ideal to have this defined here. Should move to utils.
function dateTimeReviver(key, value) {
  if (key === "date" || key === "startTime" || key === "endTime") {
    return new Date(value)
  }
  return value
}

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

  const socket = io.connect(DEV_URL)
  socket.on('connect', function() {
    socket.emit("event://init", "User has connected")
  });

  socket.on('event://init', function(msg) {
    const payload = JSON.parse(msg, dateTimeReviver)
    console.log(payload)
    setBoardState(payload)
  })

  socket.on('event://calendar', function(msg) {
    const payload = JSON.parse(msg, dateTimeReviver)
    console.log(payload)
    setBoardState(payload)
  })

  const value = {
    socket,
    sendState
  }
  return <WebSocketContext.Provider value={value} {...props} />
}
export { WebSocketContext, WebSocketProvider}

