import React from 'react'
import { WebSocketContext } from '../context/WebSocketContext'
import { StoreContext } from "../context/StoreContext"
import {isShallowEqual} from '../support'

let dispatchedMessageCount = 0
const INTERVAL_TIMEOUT = 5000 // 5 seconds

export default function useDispatcher() {
  let timeInterval
  let _previousBoardState
  const [readyState, setReadyState] = React.useState(true)

  const boardState = React.useContext(StoreContext)
  const ws = React.useContext(WebSocketContext)

  React.useEffect(function() {
    if (readyState) {
      ws.emit('event://calendar', JSON.stringify(boardState))
      setReadyState(false)
      timeInterval = setTimeout(function() {
        setReadyState(true)
      }, INTERVAL_TIMEOUT)
    }
  }, [boardState, readyState])

  if (!timeInterval) {
  timeInterval = setInterval(function() {
      ws.emit('event://calendar', JSON.stringify(boardState))
    }, INTERVAL_TIMEOUT)
  }

  function interrupt() {
    if (!timeInterval) {
      return
    }
    clearInterval(timeInterval)
    timeInterval = undefined
  }

  function dispatch() {
    dispatchedMessageCount++
    console.log("Message, sent!")
    return 1
  }

  return {
    interrupt
    dispatch
  }
}
