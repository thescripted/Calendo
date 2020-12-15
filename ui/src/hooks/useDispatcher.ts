import React from 'react'
import { WebSocketContext } from '../context/WebSocketContext'
import { StoreContext } from "../context/StoreContext"

let dispatchedMessageCount = 0

export default function useDispatcher() {
  const { boardState } = React.useContext(StoreContext)
  const value = React.useContext(WebSocketContext)
  const { socket } = value
  const [dispatchFlag, setDispatchFlag] = React.useState(false)

  React.useEffect(function() { 
    if (dispatchFlag) {
      socket.emit("calendar", JSON.stringify(boardState))
      setDispatchFlag(false)
    }
  }, [boardState, dispatchFlag])

  function dispatch() {
    setDispatchFlag(true)
    dispatchedMessageCount++
    return 1
  }
  // Allow user to disable dispatching events.
  function disableWebSocket() {
    socket.close()
  }

  return dispatch
}
