import React from 'react'
import { IEventState } from "../types/calendo"

export default function useEvent() {
    const defaultEventState: IEventState = {
        dragging: undefined,
        carrying: undefined,
        modal: false,
        isDragging: false,
        isCarrying: false,
        modalEvent: undefined
    }
    const [eventState, setEventState] = React.useState<IEventState>(defaultEventState)
    return {eventState, setEventState}
}
