import React from 'react'
import styles from "./styles/Navigation.module.css"

export default function Navigation(props) {
    return(
        <div className={styles.container}>
        <div className={styles.navigation_wrapper}>
            <div className={styles.logo}>
                <h2>Calendo</h2>
            </div>
            <div className={styles.row_nav}>
                <div className={styles.button_container}>
                    <button id={styles.left_button}/>
                    <button id={styles.right_button}/>
                </div>
                <div className={styles.month_field}>
                    <h2>
                        October 2020
                    </h2>
                </div>
            </div>
        </div>
        </div>
    )
}
