import React from 'react'
import {StoreContext} from "../context/StoreContext"

export default function useBoard() {
    const context = React.useContext(StoreContext)
    if (!context) {
        throw new Error(`useBoard must be used within a BoardProvider`)
    }

    const { boardState, setBoardState } = context

    return {
        boardState,
        setBoardState
    }
}
