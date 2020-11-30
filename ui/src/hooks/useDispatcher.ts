import React from 'react'
import { WebSocketContext } from '../context/WebSocketContext'
import { StoreContext } from "../context/StoreContext"

let dispatchedMessageCount = 0

export default function useDispatcher() {
  const { boardState } = React.useContext(StoreContext)
  const { socket } = React.useContext(WebSocketContext)

  React.useEffect(function () {
    let collection = boardState.cardCollection

    if (Object.keys(collection).length === 0) {
    }
    else if (!_checkForPreview(collection)) {
      socket.emit("event://calendar", JSON.stringify(boardState))
      console.log("Fired off board state!")
    }
  }, [boardState])

  // Determines if any card is in a preview state.
  // This is a heavy burden. TODO: There needs to be a way for the state
  // to signal it's dispatch. Not the other way around.
  //
  // This check is fired off so many time that performance drops.
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
