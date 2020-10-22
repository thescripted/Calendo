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

export function locateDay(date: Date, context: IBoard): IDay | undefined {
    return context.eventDayCollection[hashDate(date)]
}

export function getCalendarInfo() {
    const calendarRoot = document.getElementById('calendar_root')
    const LEFT_OFFSET = calendarRoot.offsetLeft 
    const TOP_OFFSET = calendarRoot.offsetTop 
    const SCROLL_OFFSET = calendarRoot.scrollTop
    const WIDTH = calendarRoot.offsetWidth
    return {
        LEFT_OFFSET,
        TOP_OFFSET,
        SCROLL_OFFSET,
        WIDTH
    } 
}

