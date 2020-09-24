import React from 'react';
import styles from './Slot.module.css';
import { useDrop } from 'react-dnd';
import { TYPES } from './Constant';

export default function Slot({ id }) {
    const [collectedProps, drop] = useDrop({
        accept: TYPES.CARD,
        drop: (_, montior) => {}
    });

    console.log(collectedProps);
    return (
        <div className={styles.slot} ref={drop}>
            <p>Drop Target</p>
        </div>
    );
}
