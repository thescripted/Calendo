import React from 'react';
import styles from './styles/Card.module.css';
import * as dateFns from 'date-fns';

// import { useDrag } from 'react-dnd';
// import { TYPES } from './Constant';

const FIFTEEN_MINUTE_INTERVAL = 15;

export default function Card({ event, ...props }) {
    // const [collectedProps, drag] = useDrag({
    //     // ID is the main identifier for the card. This should be injected to this component from the model layer.
    //     // This will be the ID used so the slots know which card to render/update when needed.
    //     item: { type: TYPES.CARD, id: props.id },
    //     collect: monitor => ({
    //         isDragging: monitor.isDragging()
    //     })
    // });
    const formattedStartTime = dateFns.format(event.startTime, 'hh:mm a');
    const formattedEndTime = dateFns.format(event.endTime, 'hh:mm a');

    const eventHeightInterval =
        dateFns.differenceInMinutes(event.endTime, event.startTime) / FIFTEEN_MINUTE_INTERVAL;
    const eventHeightFromTop =
        dateFns.differenceInMinutes(event.startTime, event.date) / FIFTEEN_MINUTE_INTERVAL;

    const gridIndex = event.startTime.getMinutes() / 15;
    const generateEventHeight = props.grid[gridIndex] - props.grid[0];

    console.log(gridIndex);
    return (
        <div
            // ref={drag}
            className={styles.card}
            style={{
                height: `${props.scale * eventHeightInterval - 2}px`,
                top: generateEventHeight
            }}
            // onMouseDown={() => props.publishDragEvent(props.id, true)}
            // onMouseUp={() => props.publishDragEvent(props.rowID, props.id, false)}
        >
            <p>{event.content}</p>
            <p>{`${formattedStartTime} - ${formattedEndTime}`}</p>
        </div>
    );
}
