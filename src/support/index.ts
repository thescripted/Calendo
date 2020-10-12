import React from 'react'
import { IEventState, IDay, IEvent } from '../types/calendo'
import { StoreContext } from '../StoreContext'

export function hashDate(date) {
    return (+date).toString(36);
}

export function useEvent() {
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

export function getThreshold(height: number): number {
        return Math.max(12, height * 0.1)
    }
export function getEvent(eventID: string): IEvent | undefined {
    const context = React.useContext(StoreContext)
    if (!context) {
        throw new Error("getEvent can only be used within StoreContext")
    }
    const {boardState} = context
    return boardState.cardCollection[eventID]
}

export function getDay(dayID: string): IDay | undefined {
    const context = React.useContext(StoreContext)
    if (!context) {
        throw new Error("getEvent can only be used within StoreContext")
    }
    const {boardState} = context
    return boardState.eventDayCollection[dayID]
}

