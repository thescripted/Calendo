import React from 'react'
import { WebSocketContext } from '../context/WebSocketContext'
import { StoreContext } from "../context/StoreContext"

let dispatchedMessageCount = 0

export default function useDispatcher() {
  const { boardState } = React.useContext(StoreContext)
  const value = React.useContext(WebSocketContext)
  const { socket } = value

  function dispatch() {
    dispatchedMessageCount++
    console.log("Message, sent!")
    socket.emit("event://calendar", JSON.stringify(boardState))
    return 1
  }
  // Allow user to disable dispatching events.
  function disableWebSocket() {
    socket.close()
  }

  return dispatch
}
