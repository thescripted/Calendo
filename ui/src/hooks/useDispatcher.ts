import React from 'react'
import ws from '../websocket'
import useBoard from './useBoard'

let dispatchedMessageCount = 0

/* core logic for dispatching events to the websocket
 * React can call `dispatch()` which will send data through the socket.
 * dispatch will return an Ok if the message was sent successfully, or an error otherwise.
 * Additionally, useDispatcher can auto-save the application, calling itself a fixed amount of times.
 * Since it may not be optimal to allow frequent inputs into our server, some throttling mechanism
 * will be needed here.
 */

export default function useDispatcher() {
  const { boardState: currentBoardState } = useBoard()
  // Perhaps in the future this might be useful if it were completely asynchromous.
  function dispatch() {
    // Confirm,
    // Clean and Serialize,
    // Send
    // Call callback functions and return
    console.log(currentBoardState)
    console.log(ws)
    ws.send(JSON.stringify(currentBoardState))
    dispatchedMessageCount++
    console.log(dispatchedMessageCount)
    
    return 1
  }


  return dispatch

}
