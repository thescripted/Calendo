import React from 'react'
import { WebSocketContext } from '../context/WebSocketContext'
import { StoreContext } from "../context/StoreContext"

/**
 * useDispatcher contains the logic to dispatch the current state of the board.
 * Currently the board APIs (updateEvent, dispatchEvent) uses this logic.
 *
 * Note: It may be expensive to constantly send the entire boardState across the socket. May need to review.
 *
 * @returns {dispatch} A function to emit the boardState across the websocket.
 */
export default function useDispatcher() {
    const { boardState } = React.useContext(StoreContext)
    const { socket } = React.useContext(WebSocketContext)
    const [dispatchFlag, setDispatchFlag] = React.useState(false)

    // boardState will constantly change. Only dispatch on a true dispatch flag.
    React.useEffect(function() { 
        if (dispatchFlag) {
            socket.emit("calendar", JSON.stringify(boardState))
            setDispatchFlag(false)
        }
    }, [boardState, dispatchFlag])

    function dispatch() {
        setDispatchFlag(true)
    }
    return dispatch
}
