import React from 'react';
import styles from './styles/Row.module.css';

// A Row Component takes in Card components as children, and exposes the 'available slots' to the App component.
// The App provides to the row an ability to create new cards, but only valid cards can be created.
export default function Row({ children, resolveClickHandler, rowIdx, rowHeight }) {
    return (
        <div
            className={`${styles.row} rowEvent`}
            style={{ height: `${rowHeight}px` }}
            onClick={e => resolveClickHandler(rowIdx, e)}
        >
            {children}
        </div>
    );
}
