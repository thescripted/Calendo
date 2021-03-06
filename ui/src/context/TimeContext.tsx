import React from 'react'
import { hashDate } from '../support'
import { add, startOfWeek } from 'date-fns'
import { useBoard } from '../hooks'

export const TimeContext = React.createContext(undefined)


export function default_week(): Date[] {
    const start: Date = startOfWeek(new Date())
    let week: Date[] = []
    for (let i = 0; i < 7; i++) { // With variable date views, this won't work. 
        week.push(add(start, {
            days: i
        }))
    }
    return week
}


export function WeekProvider(props) {
    const [weekArray, setWeekArray] = React.useState<Date[]>(default_week())
    const { boardState, setBoardState } = useBoard()

    // On weekArray state change, automatically create new eventDays if one does not exist.
    React.useEffect(() => {
        let updatedState = {
            eventDayCollection: { ...boardState.eventDayCollection }
        }
        weekArray.forEach(dayOfWeek => {
            if (boardState.eventDayCollection[hashDate(dayOfWeek)] === undefined) {
                // produce new board state
                const id = hashDate(dayOfWeek)
                updatedState.eventDayCollection[id] = {
                    date: dayOfWeek,
                    dayID: id,
                    eventCollection: []
                }
                setBoardState({ ...boardState, ...updatedState })
            }
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weekArray])

    const value = React.useMemo(() => {
        return {
            weekArray,
            setWeekArray
        }
    }, [weekArray])

    return (
        <TimeContext.Provider value={value} {...props} />
    )
}
