import React from 'react'
import styles from './styles/Sidebar.module.css'
import * as dateFns from 'date-fns'

export default function({createEventWithCurrentTime}) {
    // This function will have to emit a modal on the calendarview. 
    const time = useFormattedTime()
    return (
        <div className={styles.container}>
            <div className={styles.main_content}>
                <div className={styles.creation_area}>
                    <h2>Current Time</h2>
                    <div className={styles.clock}>
                        {time}
                    </div>
                    <div className={styles.create_event}>
                        <button onClick={() => createEventWithCurrentTime(getCurrentDay())}>Create An Event</button>
                    </div>
                </div>
                <div className={styles.copyright}>
                    <p>
                        Calendo is an event-driven, TypeScript application demonstrating some of the core features of
                        Google Calendar.
                    </p>
                    <p>Created by <a href="https://benjaminkinga.com">Benjamin Kinga</a></p>
                    <p>
                        <a href="https://github.com/thescripted/calendo">Source Code</a>
                    </p>
                </div>
            </div>
        </div>
    )
}

// Hook to update the time every second. Since time-drift can happen with "setInterval", 
// or if the user is on another tab, this hook is fired every 500ms and generates a new Date object
// with the current time to render.
function useFormattedTime() {
    const [time, setTime] = React.useState(undefined)
    React.useEffect(() => {
        const timeInterval = setInterval(function() {
            const formattedDate = dateFns.format(new Date(), 'hh:mm:ss a')
            setTime(formattedDate)
        })
        return () => clearInterval(timeInterval)

    }, [])

    return time
}

    
function getCurrentDay() {
    const date = new Date()
    // Locale time only. Not UTC. may need to fix.
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()) 
}
