import React from 'react'
import styles from './styles/Sidebar.module.css'

export default function(props) {
    return (
        <div className={styles.container}>
            <div className={styles.main_content}>
                <div className={styles.creation_area}>
                    <h2>Current Time</h2>
                    <div className={styles.clock}>
                        <span>07</span>:<span>22</span>:<span>30</span>
                    </div>
                    <div className={styles.create_event}>
                        <button>Create An Event</button>
                    </div>
                </div>
                <div className={styles.copyright}>
                    <p>
                        Calendo is an event-driven, TypeScript application demonstrating some of the core features of
                        Google Calendar.
                    </p>
                    <p>Created by 
                        <a> Benjamin Kinga</a>
                    </p>
                    <p>
                        <a>Source Code</a>
                    </p>
                </div>
            </div>
        </div>
    )
}
