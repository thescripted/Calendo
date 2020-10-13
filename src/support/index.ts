import React from 'react'
import { IEventState, IDay, IEvent, IBoard } from '../types/calendo'

export function hashDate(date: Date) {
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
export function locateEvent(eventID: string, context: IBoard): IEvent | undefined {
    return context.cardCollection[eventID]
}

export function locateDay(date: Date, context: IBoard): IDay | undefined {
    return context.eventDayCollection[hashDate(date)]
}

