import React from 'react';
import styles from './Slot.module.css';
import { useDrop } from 'react-dnd';
import { TYPES } from './Constant';

// TODO: Remove Slot. There will be a model layer that the card will sit on top of.
export default function Slot({ children, row, col, updater }) {
    const [collectedProps, drop] = useDrop({
        accept: TYPES.CARD,

        drop: (_, monitor) => {
            updater();
            console.log(monitor.getItem());
        }
    });

    return (
        <div className={styles.slot} ref={drop} role='button'>
            {children}
        </div>
    );
}
