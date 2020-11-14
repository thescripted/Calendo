import React from "react"
import { useBoard } from './context/StoreContext'

function useReceiver() {
  const { boardState: currentState } = useBoard()
  console.log(currentState)

  // deserializes and reads data from incoming socket. Calls the appropriates methods to handle the read data.
  // Only to read JSON-structured data. In the future it may be useful to handle different types of incoming data,
  // In which this will need more access to the header or initial websocket connection.
  read(data) {

    console.log('Message from server: ', data)
    this.currentState = _getCurrentState()
    console.log("current State: ", this.currentState)
  }

  // used by React to take in the current data to update it's state.
  // will signal to react if data has errors, merge fails, server disconnect, etc.
  receive(data) {


  }

  resolveConflict() {

  }





  return applicationState

}
