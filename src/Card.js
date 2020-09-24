import React from 'react';
import styles from './Card.module.css';
import { useDrag } from 'react-dnd';
import { TYPES } from './Constant';

export default function Card(props) {
    const [collectedProps, drag] = useDrag({
        item: { type: TYPES.CARD },
        collect: monitor => ({
            isDragging: monitor.isDragging()
        })
    });

    console.log(collectedProps);

    return (
        <div className={styles.card} ref={drag}>
            <p>I am a card!</p>
        </div>
    );
}
