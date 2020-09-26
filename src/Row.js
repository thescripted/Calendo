import React from 'react';
import styles from './Row.module.css';

export default function Row({ children, log }) {
    return (
        <div className={styles.row} onClick={e => log(e)} id='row_event'>
            {children}
        </div>
    );
}
