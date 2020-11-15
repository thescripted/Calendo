import React from 'react'
import { TimeContext, default_week } from '../context/TimeContext'
import { add, sub } from 'date-fns'

export default function useWeek() {
    const context = React.useContext(TimeContext)
    if (!context) {
        throw new Error("useWeek can only be used under TimeContext")
    }
    const { weekArray, setWeekArray } = context

    // increments the weekArray by a given number of days. 
    function incrementDays(days: number = 7) {
        const newWeekArray = weekArray.map((weekDay) => {
            return add(weekDay, {
                days: days
            })
        })
        setWeekArray(newWeekArray)
    }

    // decrement the week by one.
    function decrementDays(days: number = 7) {
        const newWeekArray = weekArray.map((weekDay) => {
            return sub(weekDay, {
                days: days
            })
        })
        setWeekArray(newWeekArray)
    }

    function jumpToToday() {
        setWeekArray(default_week)
    }
    return {
        weekArray,
        incrementDays,
        decrementDays,
        jumpToToday
    }

}
