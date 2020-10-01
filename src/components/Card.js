import React from 'react';
import styles from './styles/Card.module.css';
// import { useDrag } from 'react-dnd';
// import { TYPES } from './Constant';

let isDragging = false;
function dragCard(event) {
    isDragging = true;
}

function updateCardLength(e) {
    return e;
}

function finalizeCard(e) {
    isDragging = false;
}

export default function Card(props) {
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
            style={{ height: `${props.scale * props.level - 2}px`, top: props.height }}
            onMouseDown={e => dragCard(e)}
            onMouseMove={e => updateCardLength(e)}
            onMouseUp={e => finalizeCard(e)}
        >
            <p>{props.content}</p>
            <p>{props.dateString}</p>
        </div>
    );
}
