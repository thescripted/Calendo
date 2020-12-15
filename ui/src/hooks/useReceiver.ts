import React from "react"
import { IBoard } from "../types/calendo"
import useBoard from './useBoard'
import { WebSocketContext } from '../context/WebSocketContext'

// Not ideal to have this defined here. Should move to utils.
function dateTimeReviver(key, value) {
  if (key === "date" || key === "startTime" || key === "endTime") {
    return new Date(value)
  }
  return value
}

export default function useReceiver() {
    const [received, setReceived] = React.useState<IBoard | undefined>(undefined)
    const {socket} = React.useContext(WebSocketContext)
    React.useEffect(() => {
        console.log(socket)
        socket.on('init', function(msg: string) {
            const payload = JSON.parse(msg, dateTimeReviver)
            console.log(payload)
            setReceived(payload)
        })

        socket.on('calendar', function(msg: string) {
            const payload = JSON.parse(msg, dateTimeReviver)
            console.log(payload)
            setReceived(payload)
        })
    }, [])
  

    // Diffing algorithm used to determine and resolve merge conflicts between board states.
    function diff(current: IBoard, previous: IBoard): IBoard {
        return current
    }
  return [received] 
}
