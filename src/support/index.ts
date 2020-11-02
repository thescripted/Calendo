import React from 'react'
import { IEventState, IDay, IBoard } from '../types/calendo'


/**
 * Perform shallow equality by iterating through keys on an object and returning false
 * when any key has values that are not strictly equal.
 *
 * Shallow equality is used due to the fact that "deep" equality creates cycles in this application.
 * e.g.)
 *      Two Calendar Events has a reference to a Day event. 
 *      The Day events have an array of Calendar events in it.
 *      Each of those Calendar Events has a reference to a Day event.
 *      And so it goes...
 *
 *  Lodash currently does not support control for depth-level deep equalities.
 *  So I'm using a Shallow equality instead and ignoring the attribute that will create cycles.
 *
 * This does not currently support all edge-case for shallow equality (e.g., invalid inputs, reference equality)
 */
export function isShallowEqual(obj1: Object, obj2: Object) {
    const keysA = Object.keys(obj1)
    const keysB = Object.keys(obj2)
    if (keysA.length !== keysB.length) {
        return false
    }

    // checks for equalities only on conditions where the item is a primitive type.
    function simpleEqual(value1: any, value2: any): boolean {
        if (value1 instanceof Date && value2 instanceof Date) {
            return value1.getTime() === value2.getTime()
        }
        //Sloppy. 
        if (typeof value1 === 'object' && typeof value2 === 'object') {
            return true
        }

        return value1 === value2

    }
    for (let i = 0; i < keysA.length; i++) {

        if (
            !Object.prototype.hasOwnProperty.call(obj2, keysA[i]) ||
            !simpleEqual(obj1[keysA[i]], obj2[keysB[i]]) // NOTE: Highly specific 'is' function, suited ONLY for this application.
        ) {
            return false
        }
    }
    return true
}

export function hashDate(date: Date) {
    return (+date).toString(36);
}

// Should be moved elsewhere.
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
