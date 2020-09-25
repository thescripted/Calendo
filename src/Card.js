import React from 'react';
import styles from './Card.module.css';
import { useDrag } from 'react-dnd';
import { TYPES } from './Constant';

export default function Card(props) {
    const [collectedProps, drag] = useDrag({
        // ID is the main identifier for the card. This should be injected to this component from the model layer.
        // This will be the ID used so the slots know which card to render/update when needed.
        item: { type: TYPES.CARD, id: props.id },
        collect: monitor => ({
            isDragging: monitor.isDragging()
        })
    });

    console.log(props.length);

    return (
        <div className={styles.card} ref={drag}>
            <p>I am a card!</p>
        </div>
    );
}
