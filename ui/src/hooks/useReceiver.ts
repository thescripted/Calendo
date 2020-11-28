import React from "react"
import { IBoard } from "../types/calendo"
import useBoard from './useBoard'
import socket from "../websocket"


export default function useReceiver() {
  const [message, setMessage] = React.useState<string>("")
  const [board, setBoard] = React.useState<IBoard | undefined>(undefined)
  const [error, setError] = React.useState(undefined)
  const { boardState: currentBoardState } = useBoard()

  // deserializes and reads data from incoming socket. Calls the appropriates methods to handle the read data.
  // Only to read JSON-structured data. In the future it may be useful to handle different types of incoming data,
  // In which this will need more access to the header or initial websocket connection.
  function parseMessage(data: string): IBoard {
    const parsedData = JSON.parse(data)
    console.log('Message from server: ', parsedData)
    return parsedData 
  }

  // Diffing algorithm used to determine and resolve merge conflicts between board states.
  function diff(current: IBoard, previous: IBoard): IBoard {
    return current
  }

  // binding websocket messages to update message state.
  React.useEffect(() => {
    socket.on('testing', function(msg) {
      console.log(msg)
    });
    return () => {
    }
  }, [])

  React.useEffect(() => {
    if (message === "") {
      return
    }

    if (error) {
      setBoard(undefined)
      console.log("Error!")
    }

    const currentMessage = parseMessage(message)
    const updatedBoard = diff(currentMessage, currentBoardState)
    setBoard(updatedBoard)
  }, [currentBoardState, error, message])

  return [board, error] 
}
