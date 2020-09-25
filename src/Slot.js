import React from 'react';
import styles from './Slot.module.css';
import { useDrop } from 'react-dnd';
import { TYPES } from './Constant';

export default function Slot({ children, coord, updater }) {
    const [collectedProps, drop] = useDrop({
        accept: TYPES.CARD,
        drop: () => {
            updater(coord);
        }
    });

    return (
        <div className={styles.slot} ref={drop} role='button'>
            {children}
        </div>
    );
}
