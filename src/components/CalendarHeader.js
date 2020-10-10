import React from "react"
import styles from "./styles/CalendarHeader.module.css"
import * as dateFns from "date-fns"

export default function CalendarHeader(props) {
    const {weekArray} = props
    const currentDay = getCurrentDay()
    return (
        <div className={styles.container}>
            {weekArray.map((weekDay, idx) => {
                return <CalendarItem key={`Date-${idx}`} day={weekDay} currentDay={JustADate(weekDay).valueOf() === currentDay.valueOf() ? true : false}/>
            })}
        </div>
    )
}

function CalendarItem(props) {
    const { day, currentDay } = props
    const localDayOfWeek = dateFns.format(day, 'ccc');
    const localDate = dateFns.format(day, 'do');

    return (
        <div className={styles.item_container}>
            <div className={currentDay ? styles.primary_text_wrapper : styles.text_wrapper}>
                <p>{localDayOfWeek}</p>
                <p>{localDate}</p>
            </div>
        </div>
    )
}

// From StackOverflow. Prevents edge-cases comparing days around conflicting timezones
// https://stackoverflow.com/questions/2698725/comparing-date-part-only-without-comparing-time-in-javascript
// NOTE: This component shouldn't be normalizing the dates like this. That's the role of the Application.
// TODO: Move this and normalize *all* the dates in your general state.
function JustADate(initDate){
    const initialDate = new Date(initDate)
    const utcMidnightDateObj = new Date(Date.UTC(initialDate.getFullYear(),initialDate.getMonth(), initialDate.getDate()));
    return utcMidnightDateObj
}
    
function getCurrentDay() {
    const today = JustADate(Date.now())
    return today
}
