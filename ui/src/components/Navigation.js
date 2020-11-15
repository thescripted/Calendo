import React from 'react'
import {useWeek} from '../hooks'
import styles from "./styles/Navigation.module.css"
import * as dateFns from "date-fns"
import { ReactComponent as LeftArrow } from './static/leftArrow.svg'
import { ReactComponent as RightArrow } from './static/rightArrow.svg'

export default function Navigation(props) {
    const { weekArray, incrementDays, decrementDays, jumpToToday } = useWeek()
    const startDate = weekArray[0]
    const endDate = weekArray[weekArray.length - 1]

    return(
        <div className={styles.container}>
            <div className={styles.navigation_wrapper}>
                <div className={styles.logo}>
                    <h2>Calendo</h2>
                </div>
                <div className={styles.row_nav}>
                    <button onClick={() => jumpToToday()}>Today</button>
                    <div className={styles.button_container}>
                        <button id={styles.left_button} onClick={() => decrementDays()}>
                            <LeftArrow />
                        </button>
                        <button id={styles.right_button} onClick={() => incrementDays()}>
                            <RightArrow />
                        </button>
                    </div>
                    <div className={styles.month_field}>
                        <h2>
                            {getMonthHeader(startDate, endDate)}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    )
}

function getMonthHeader(start, end) {
    let builder = dateFns.format(start, " MMMM")
    if (start.getMonth() !== end.getMonth()) {
        builder = builder.concat(" - ", dateFns.format(end, " MMMM"))
    }
    builder = builder.concat(" ", dateFns.format(end, "y"))
    return builder
}
