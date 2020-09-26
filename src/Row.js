import React from 'react';
import styles from './Row.module.css';

// A Row Component takes in Card components as children, and exposes the 'available slots' to the App component.
// The App provides to the row an ability to create new cards, but only valid cards can be created.
export default function Row({ children, log }) {
    return (
        <div className={styles.row} onClick={e => log(e)} id='row_event'>
            {children}
        </div>
    );
}
