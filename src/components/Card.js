import React from 'react';
import styles from './styles/Card.module.css';
// import { useDrag } from 'react-dnd';
// import { TYPES } from './Constant';

export default function Card({ event, ...props }) {
    // const [collectedProps, drag] = useDrag({
    //     // ID is the main identifier for the card. This should be injected to this component from the model layer.
    //     // This will be the ID used so the slots know which card to render/update when needed.
    //     item: { type: TYPES.CARD, id: props.id },
    //     collect: monitor => ({
    //         isDragging: monitor.isDragging()
    //     })
    // });
    return (
        <div
            // ref={drag}
            className={styles.card}
            style={{ height: `${props.scale * event.level - 2}px`, top: event.height }}
            // onMouseDown={() => props.publishDragEvent(props.id, true)}
            // onMouseUp={() => props.publishDragEvent(props.rowID, props.id, false)}
        >
            <p>{event.content}</p>
            <p>{event.date.date}</p>
        </div>
    );
}
