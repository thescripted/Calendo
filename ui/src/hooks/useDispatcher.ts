import React from 'react'
import { WebSocketContext } from '../context/WebSocketContext'
import { StoreContext } from "../context/StoreContext"

let dispatchedMessageCount = 0

export default function useDispatcher() {
  const { boardState } = React.useContext(StoreContext)
  const { socket } = React.useContext(WebSocketContext)
  React.useEffect(function () {
    // if a card is in a preview state, don't dispatch.
    if (!_checkForPreview(boardState.cardCollection)) {
      socket.emit(JSON.stringify(boardState))
      console.log("Fired off board state!")
    }
  }, [boardState])

  // Determines if any card is in a preview state.
  function _checkForPreview(collection) {
    for (let card in collection) {
      if (collection.hasOwnProperty(card)) {
        if (collection[card].preview === true) {
          return true 
        }
      }
    }
    return false 
  }

  function dispatch() {
    dispatchedMessageCount++
    console.log("Message, sent!")
    return 1
  }
  // Allow user to disable dispatching events.
  function disableWebSocket() {
    socket.close()
  }

  return disableWebSocket
}
